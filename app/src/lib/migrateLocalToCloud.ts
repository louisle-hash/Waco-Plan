/**
 * Công cụ dùng MỘT LẦN: đọc dữ liệu đã nhập trước đây trên chính máy này
 * (còn nằm trong IndexedDB cục bộ, từ trước khi chuyển sang Supabase) và
 * đẩy lên máy chủ chung, để không mất công nhập lại (ví dụ Tuần 29).
 *
 * An toàn khi bấm nhiều lần / nhiều máy cùng chạy: SKU trùng thì bỏ qua
 * (giữ bản trên máy chủ), số tuần trùng thì cũng bỏ qua nguyên tuần đó.
 */
import { db as localDb, type Week as LocalWeek } from './localDb'
import { db as cloudDb, emptyDays, type DayKey, type WeekRow as CloudWeekRow } from './db'

export type LocalDataSummary = {
  hasLocalData: boolean
  productCount: number
  weekCount: number
}

/** Xem trước có gì trên máy này trước khi đẩy lên — không ghi gì cả. */
export async function inspectLocalData(): Promise<LocalDataSummary> {
  try {
    const products = await localDb.products.toArray()
    const weeks = await localDb.weeks.toArray()
    return {
      hasLocalData: products.length > 0 || weeks.length > 0,
      productCount: products.length,
      weekCount: weeks.length,
    }
  } catch {
    // Chưa từng có IndexedDB nào trên máy này -> không có gì để đẩy
    return { hasLocalData: false, productCount: 0, weekCount: 0 }
  }
}

export type MigrationResult = {
  productsAdded: number
  productsSkipped: number
  weeksAdded: number
  weeksSkipped: number
}

export async function migrateLocalToCloud(): Promise<MigrationResult> {
  const result: MigrationResult = { productsAdded: 0, productsSkipped: 0, weeksAdded: 0, weeksSkipped: 0 }

  /* ---- 1) sản phẩm: bỏ qua SKU đã có trên máy chủ ---- */
  const localProducts = await localDb.products.toArray()
  const cloudProducts = await cloudDb.products.toArray()
  const cloudSkus = new Set(cloudProducts.map((p) => p.sku.toLowerCase()))

  // sku -> id trên cloud, dùng để nối weekRows sau này
  const skuToCloudId = new Map(cloudProducts.map((p) => [p.sku.toLowerCase(), p.id!]))

  for (const p of localProducts) {
    if (cloudSkus.has(p.sku.toLowerCase())) {
      result.productsSkipped++
      continue
    }
    const newId = await cloudDb.products.add({
      sku: p.sku,
      name: p.name,
      size: p.size,
      category: p.category,
      defaultStatus: p.defaultStatus as never,
      defaultPic: p.defaultPic,
      notes: p.notes,
      archived: p.archived,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })
    skuToCloudId.set(p.sku.toLowerCase(), newId)
    cloudSkus.add(p.sku.toLowerCase())
    result.productsAdded++
  }

  /* ---- 2) tuần: bỏ qua số tuần đã tồn tại trên máy chủ ---- */
  const localWeeks = await localDb.weeks.toArray()
  const cloudWeeks = await cloudDb.weeks.toArray()
  const cloudWeekNumbers = new Set(cloudWeeks.map((w) => w.weekNumber))

  for (const w of localWeeks) {
    if (cloudWeekNumbers.has(w.weekNumber)) {
      result.weeksSkipped++
      continue
    }
    const newWeekId = await pushWeek(w, skuToCloudId)
    if (newWeekId != null) result.weeksAdded++
  }

  return result
}

async function pushWeek(
  w: LocalWeek,
  skuToCloudId: Map<string, number>,
): Promise<number | null> {
  const localRows = await localDb.weekRows.where('weekId').equals(w.id!).sortBy('sortIndex')

  const newWeekId = await cloudDb.weeks.add({
    weekNumber: w.weekNumber,
    updatedAt: w.updatedAt,
    revised: w.revised,
    visibleDays: w.visibleDays,
    finalized: w.finalized,
    finalizedAt: w.finalizedAt,
    createdAt: w.createdAt,
  })

  const rowsToAdd: CloudWeekRow[] = []
  for (const r of localRows) {
    const cloudProductId = skuToCloudId.get(r.sku.toLowerCase())
    if (!cloudProductId) continue // sản phẩm không xác định được -> bỏ qua dòng này, không chặn cả tuần
    const days = emptyDays()
    for (const d of Object.keys(r.days) as DayKey[]) days[d] = r.days[d]
    rowsToAdd.push({
      weekId: newWeekId,
      productId: cloudProductId,
      productName: r.productName,
      sku: r.sku,
      size: r.size,
      nameColor: r.nameColor as never,
      days,
      pic: r.pic,
      remark: r.remark,
      sortIndex: r.sortIndex,
    })
  }
  if (rowsToAdd.length) await cloudDb.weekRows.bulkAdd(rowsToAdd)

  // Tuần đã chốt: đẩy luôn snapshot để cột "Last week" của các tuần sau vẫn đúng
  if (w.finalized) {
    const localSnaps = await localDb.snapshots.where('weekId').equals(w.id!).toArray()
    if (localSnaps.length) {
      await cloudDb.snapshots.bulkAdd(
        localSnaps
          .map((s) => {
            const row = localRows.find((r) => r.productId === s.productId)
            const cloudProductId = row ? skuToCloudId.get(row.sku.toLowerCase()) : undefined
            return cloudProductId
              ? { weekId: newWeekId, weekNumber: w.weekNumber, productId: cloudProductId, total: s.total }
              : null
          })
          .filter((s): s is NonNullable<typeof s> => s != null),
      )
    }
  }

  return newWeekId
}
