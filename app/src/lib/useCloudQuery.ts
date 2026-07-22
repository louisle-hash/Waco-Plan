import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

/**
 * Thay thế cho useLiveQuery của Dexie: gọi lại queryFn() khi có thay đổi
 * TRÊN BẤT KỲ MÁY NÀO đối với các bảng được liệt kê trong `tables` — đây là
 * chỗ tạo ra "đồng bộ thời gian thực" giữa nhiều máy.
 *
 * Chọn refetch-toàn-bộ thay vì vá từng phần: dữ liệu ở đây nhỏ (vài trăm sản
 * phẩm, vài chục dòng mỗi tuần) nên refetch rẻ, và đổi lại code đơn giản,
 * đúng-luôn-đúng thay vì phải tự hợp nhất state từng sự kiện realtime.
 */
export function useCloudQuery<T>(
  queryFn: () => Promise<T>,
  tables: string[],
  deps: React.DependencyList,
  initial: T,
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const gen = useRef(0)

  /*
   * Vì sao phải giữ queryFn trong ref:
   * useEffect đăng ký realtime bên dưới chỉ chạy MỘT LẦN (deps chỉ có tên bảng),
   * nên nó "đóng băng" queryFn của lần render đầu tiên. Ở lần render đó, các
   * state như weekId thường còn null -> queryFn cũ luôn trả về mảng rỗng.
   * Hậu quả (đã gặp thật): mỗi khi máy khác sửa dữ liệu, sự kiện realtime gọi
   * queryFn cũ và XOÁ TRẮNG bảng đang hiển thị. Ref bảo đảm luôn gọi bản mới nhất.
   */
  const queryFnRef = useRef(queryFn)
  queryFnRef.current = queryFn

  const load = useCallback(() => {
    const myGen = ++gen.current
    setLoading(true)
    queryFnRef
      .current()
      .then((result) => {
        if (myGen !== gen.current) return // câu trả lời cũ tới muộn -> bỏ qua
        setData(result)
        setError(null)
      })
      .catch((e: unknown) => {
        if (myGen !== gen.current) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (myGen === gen.current) setLoading(false)
      })
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, deps)

  useEffect(() => {
    if (!tables.length) return
    const channel = supabase.channel(`live:${tables.join(',')}:${Math.random().toString(36).slice(2)}`)
    for (const table of tables) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => load())
    }
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(','), load])

  return { data, loading, error, refetch: load }
}
