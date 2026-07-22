/**
 * Song ngữ Việt – Anh.
 *
 * Cố ý viết tay thay vì kéo thêm thư viện i18n: app chỉ có 2 ngôn ngữ,
 * chuỗi tĩnh, không cần số nhiều phức tạp hay tải ngôn ngữ theo yêu cầu.
 *
 * Quy ước: khoá đặt theo màn hình (nav.*, plan.*, product.*, ...).
 * Tham số chèn bằng {tên} — xem hàm t() bên dưới.
 */

export const LANGS = ['vi', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_LABELS: Record<Lang, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
}

/** Locale để định dạng ngày tháng theo ngôn ngữ đang chọn. */
export const DATE_LOCALE: Record<Lang, string> = {
  vi: 'vi-VN',
  en: 'en-US',
}

const vi = {
  /* ---- điều hướng ---- */
  'nav.dashboard': 'Tổng quan',
  'nav.plan': 'Kế hoạch tuần',
  'nav.products': 'Dữ liệu sản phẩm',
  'nav.labels': 'In tem',
  'nav.groupMattress': 'Ngành Nệm',
  'nav.groupFoam': 'Ngành Foam',
  'nav.foamProducts': 'Mã sản phẩm Foam',
  'nav.foamInvoice': 'Lập invoice',
  'nav.foamLabels': 'In tem Foam',
  'nav.settings': 'Cài đặt',
  'nav.guide': 'Hướng dẫn sử dụng',
  'nav.collapse': 'Thu gọn',
  'nav.expandMenu': 'Mở rộng menu',
  'nav.collapseMenu': 'Thu gọn menu',
  'nav.language': 'Ngôn ngữ',
  'nav.logout': 'Đăng xuất',

  /* ---- dùng chung ---- */
  'common.loading': 'Đang tải…',
  'common.cancel': 'Huỷ',
  'common.save': 'Lưu',
  'common.close': 'Đóng',
  'common.edit': 'Sửa',
  'common.delete': 'Xoá',
  'common.search': 'Tìm kiếm',
  'common.all': 'Tất cả',
  'common.none': '— không đặt —',
  'common.skip': '— bỏ qua —',
  'common.week': 'Tuần',
  'common.finalized': 'đã chốt',
  'common.processing': 'Đang xử lý…',
  'common.connectionError':
    'Không tải được dữ liệu mới nhất — kiểm tra kết nối mạng. Đang hiện dữ liệu cũ nhất có sẵn.',

  /* ---- tổng quan ---- */
  'dash.title': 'Tổng quan — Tuần {week}',
  'dash.updatedAt': 'Cập nhật {date} · Số lần sửa (Revised): ',
  'dash.openPlan': 'Mở kế hoạch tuần',
  'dash.empty': 'Tuần này chưa có dữ liệu',
  'dash.emptyHint': 'Vào màn hình Kế hoạch tuần để thêm sản phẩm và nhập sản lượng.',
  'dash.totalThisWeek': 'Tổng kế hoạch tuần này',
  'dash.totalLastWeek': 'Tổng tuần trước',
  'dash.vsLastWeek': 'So với tuần trước',
  'dash.rowCount': 'Số dòng sản phẩm',
  'dash.unscheduled': '{n} dòng chưa xếp ngày',
  'dash.perDay': 'Sản lượng theo ngày',
  'dash.perDayTooltip': '{n} sản phẩm',
  'dash.output': 'Sản lượng',
  'dash.byStatus': 'Theo nhóm trạng thái',
  'dash.status': 'Trạng thái',
  'dash.cells': 'Số ô',
  'dash.products': 'Số SP',
  'dash.byStatusNote':
    '“Số ô” = số ô ngày được tô màu đó. “Số SP” tính cả sản phẩm được tô màu ở tên.',
  'dash.attention': 'Cần chú ý — {a} / {b}',
  'dash.attentionEmpty': 'Không có mục nào được đánh dấu {a} hoặc {b}.',
  'dash.product': 'Sản phẩm',
  'dash.marks': 'Đánh dấu',
  'dash.relatedQty': 'SL liên quan',
  'dash.note': 'Ghi chú',

  /* ---- kế hoạch tuần ---- */
  'plan.title': 'Kế hoạch tuần',
  'plan.newEmpty': 'Tuần mới trống',
  'plan.duplicate': 'Nhân bản tuần này',
  'plan.print': 'In / PDF (A4 ngang)',
  'plan.printTitle': 'In bảng kế hoạch ra giấy A4 nằm ngang',
  'plan.finalize': 'Chốt tuần',
  'plan.lockedBadge': 'ĐÃ CHỐT — chỉ xem',
  'plan.revisedHint': 'Tự tăng mỗi lần sửa',
  'plan.reset': 'Reset',
  'plan.resetTitle': 'Đặt lại về 0',
  'plan.dayCols': 'Số cột ngày:',
  'plan.dayColsMonThu': 'Mon–Thu',
  'plan.dayColsMonSun': 'Mon–Sun',
  'plan.dayColsN': '{n} ngày',
  'plan.legend': 'Chú thích màu',
  'plan.editLabels': 'Sửa nhãn',
  'plan.empty': 'Tuần này chưa có sản phẩm nào',
  'plan.emptyHint': 'Bấm “Thêm sản phẩm vào bảng” để chọn từ danh mục.',
  'plan.addProducts': 'Thêm sản phẩm vào bảng',
  'plan.totalRow': 'Tổng cộng',
  'plan.lastWeekTitle': 'Tổng của tuần trước đã chốt',
  'plan.nameColorTitle': 'Bấm để đổi màu chữ tên sản phẩm',
  'plan.cellColorTitle': 'Bấm để đổi màu nền ô',
  'plan.cellColorAria': 'Đổi màu nền ô',
  'plan.deleteRow': 'Xoá dòng',
  'plan.deleteRowTitle': 'Xoá dòng khỏi tuần này',
  'plan.nothingToPrint': 'Chưa có dòng nào để in.',
  'plan.nothingToFinalize': 'Chưa có dòng nào để chốt.',
  'plan.confirmFinalize':
    'Chốt tuần {week}?\n\nSau khi chốt, bảng bị khoá không sửa được nữa và tổng số của tuần này sẽ trở thành cột "Last week" của tuần kế tiếp.',
  'plan.finalized': 'Đã chốt tuần {week}.',
  'plan.duplicated': 'Đã tạo tuần mới từ tuần trước (giữ danh sách sản phẩm, xoá số lượng).',
  'plan.createdEmpty': 'Đã tạo tuần {week} trống.',
  'plan.weekExists': 'Tuần {n} đã tồn tại.',
  'plan.addedN': 'Đã thêm {n} sản phẩm vào kế hoạch.',
  'plan.alreadyIn': 'Các sản phẩm đã chọn đều có sẵn trong bảng.',
  'plan.export': 'Xuất tuần (.json)',
  'plan.exportTitle': 'Tải tuần này về máy dưới dạng file .json để sao lưu hoặc chuyển sang máy khác',
  'plan.import': 'Nhập tuần từ file',
  'plan.importTitle': 'Nạp một tuần từ file .json đã xuất trước đó',

  /* ---- chọn sản phẩm ---- */
  'picker.title': 'Chọn sản phẩm thêm vào kế hoạch',
  'picker.searchPlaceholder': 'Gõ để tìm theo tên hoặc SKU…',
  'picker.noResult': 'Không tìm thấy sản phẩm. Dùng ô “thêm nhanh” bên dưới.',
  'picker.inTable': 'đã có trong bảng',
  'picker.quickAdd': 'Thêm nhanh sản phẩm chưa có',
  'picker.create': 'Tạo & chọn',
  'picker.confirm': 'Thêm {n} sản phẩm',
  'picker.needBoth': 'Cần nhập cả mã SKU và tên sản phẩm.',
  'picker.skuExists': 'Mã SKU này đã tồn tại.',

  /* ---- sửa nhãn chú thích ---- */
  'legend.title': 'Sửa nhãn chú thích màu',
  'legend.note':
    'Chỉ đổi được chữ. Bốn màu là quy ước nghiệp vụ nên giữ cố định theo bảng Excel gốc.',
  'legend.saved': 'Đã lưu nhãn chú thích.',
  'legend.labelFor': 'Nhãn cho màu {k}',

  /* ---- xuất/nhập tuần ---- */
  'wimp.title': 'Nhập tuần từ file sao lưu',
  'wimp.chooseFile': 'Chọn file .json',
  'wimp.invalidFile': 'File không đúng định dạng sao lưu tuần của app này.',
  'wimp.summary': 'Tuần {week} — {matched}/{total} dòng khớp sản phẩm trong danh mục',
  'wimp.unmatchedNote':
    '{n} dòng có SKU chưa có trong danh mục. App sẽ tự tạo sản phẩm mới cho các dòng này khi nhập.',
  'wimp.overwriteWarning':
    'Tuần {week} đã có sẵn trong app. Nhập file này sẽ GHI ĐÈ toàn bộ dữ liệu tuần đó.',
  'wimp.finalizedBlock': 'Tuần {week} đã chốt, không thể ghi đè. Hãy đổi số tuần trong file hoặc chọn tuần khác.',
  'wimp.confirm': 'Nhập tuần {week}',
  'wimp.done': 'Đã nhập tuần {week}: {rows} dòng{created}.',
  'wimp.createdProducts': ', tạo mới {n} sản phẩm',
  'wimp.readError': 'Không đọc được file. Kiểm tra lại đúng file .json đã xuất từ app.',
  'wimp.doneShort': 'Đã nhập xong tuần {week}.',

  /* ---- dữ liệu sản phẩm ---- */
  'product.title': 'Dữ liệu sản phẩm',
  'product.subtitle': 'Danh mục này là nguồn để chọn sản phẩm khi lập kế hoạch tuần.',
  'product.import': 'Nhập từ Excel',
  'product.add': 'Thêm sản phẩm',
  'product.searchPlaceholder': 'Tên, SKU, size…',
  'product.line': 'Dòng sản phẩm',
  'product.showArchived': 'Hiện cả hàng đã lưu trữ',
  'product.count': '{shown}/{total} sản phẩm',
  'product.empty': 'Chưa có sản phẩm nào',
  'product.emptyHint':
    'Bấm “Nhập từ Excel” để nạp danh sách hàng loạt, hoặc “Thêm sản phẩm” để tạo từng cái.',
  'product.colSku': 'SKU',
  'product.colName': 'Tên sản phẩm',
  'product.colSize': 'Size',
  'product.colLine': 'Dòng SP',
  'product.colStatus': 'Màu mặc định',
  'product.colPic': 'PIC',
  'product.colNote': 'Ghi chú',
  'product.colActions': 'Thao tác',
  'product.archived': 'đã lưu trữ',
  'product.archive': 'Lưu trữ',
  'product.restore': 'Khôi phục',
  'product.formAdd': 'Thêm sản phẩm mới',
  'product.formEdit': 'Sửa sản phẩm',
  'product.fSku': 'Mã SKU *',
  'product.fSkuHint': 'Không trùng với sản phẩm khác',
  'product.fSize': 'Kích thước',
  'product.fName': 'Tên sản phẩm *',
  'product.fLine': 'Dòng sản phẩm',
  'product.fPic': 'Người phụ trách (PIC)',
  'product.fStatus': 'Màu trạng thái mặc định',
  'product.fNote': 'Ghi chú',
  'product.errSku': 'Phải nhập mã SKU.',
  'product.errName': 'Phải nhập tên sản phẩm.',
  'product.errDup': 'Mã SKU "{sku}" đã tồn tại ở sản phẩm khác.',
  'product.savedNew': 'Đã thêm sản phẩm mới.',
  'product.savedEdit': 'Đã cập nhật sản phẩm.',
  'product.archivedMsg': 'Đã lưu trữ sản phẩm (không xoá hẳn).',
  'product.restoredMsg': 'Đã khôi phục sản phẩm.',

  /* ---- nhập Excel ---- */
  'imp.title': 'Nhập sản phẩm từ file Excel',
  'imp.step1': 'Bước 1 — Chọn file',
  'imp.template': 'Tải file Excel mẫu',
  'imp.sheet': 'Sheet cần nhập',
  'imp.step2': 'Bước 2 — Ghép cột',
  'imp.step2Hint': 'App đã tự đoán. Kiểm tra lại, chọn “— bỏ qua —” nếu file không có cột đó.',
  'imp.step3': 'Bước 3 — Kiểm tra trước khi nạp',
  'imp.newCount': '{n} sản phẩm mới',
  'imp.dupExisting': '{n} trùng SKU đã có',
  'imp.dupFile': '{n} trùng trong file',
  'imp.errCount': '{n} dòng lỗi',
  'imp.dupQuestion': 'Với SKU đã tồn tại trong app:',
  'imp.dupSkip': 'Bỏ qua, giữ nguyên dữ liệu cũ',
  'imp.dupUpdate': 'Ghi đè bằng dữ liệu trong file',
  'imp.colRow': 'Dòng',
  'imp.colState': 'Tình trạng',
  'imp.willAdd': 'Sẽ thêm mới',
  'imp.willUpdate': 'Sẽ ghi đè',
  'imp.willSkipExisting': 'Đã có — bỏ qua',
  'imp.willSkipFileDup': 'Trùng SKU trong file — bỏ qua',
  'imp.preview300': 'Đang xem 300 dòng đầu trong tổng số {n} dòng. Khi nạp sẽ xử lý toàn bộ.',
  'imp.run': 'Nạp {n} sản phẩm',
  'imp.noRows': 'Sheet này không có dòng dữ liệu nào.',
  'imp.readFail': 'Không đọc được file.',
  'imp.runFail': 'Nạp dữ liệu thất bại.',
  'imp.done': 'Đã nạp {n} sản phẩm từ file Excel.',
  'imp.fMissingSku': 'Thiếu mã SKU',
  'imp.fMissingName': 'Thiếu tên sản phẩm',
  'imp.fieldSku': 'Mã SKU',
  'imp.fieldName': 'Tên sản phẩm',
  'imp.fieldSize': 'Kích thước',
  'imp.fieldCategory': 'Dòng sản phẩm',
  'imp.fieldPic': 'Người phụ trách (PIC)',
  'imp.fieldStatus': 'Màu trạng thái mặc định',
  'imp.fieldNotes': 'Ghi chú',

  /* ---- in tem ---- */
  'label.title': 'In tem',
  'label.subtitle': 'Khổ tem 4 × 2 inch nằm ngang, mỗi tem một trang.',
  'label.print': 'In',
  'label.printN': 'In {n} tem',
  'label.empty': 'Tuần này chưa có dòng nào có sản lượng',
  'label.emptyHint': 'Nhập số lượng ở màn hình Kế hoạch tuần trước khi in tem.',
  'label.pick': 'Chọn dòng cần in ({sel}/{total})',
  'label.splitByDay': 'Tách tem theo từng ngày',
  'label.selectAll': 'Chọn tất cả',
  'label.deselectAll': 'Bỏ chọn tất cả',
  'label.colTotal': 'Tổng',
  'label.preview': 'Xem trước',
  'label.previewN': 'Xem trước (tem 1/{n})',
  'label.previewEmpty': 'Chọn ít nhất một dòng để xem trước tem.',
  'label.printHint':
    'Khi bấm In, hộp thoại in của trình duyệt sẽ mở. Chọn khổ giấy 4×2 inch (hướng Ngang/Landscape) và đặt lề = 0 (Margins: None) để tem không bị co.',
  'label.fProduct': 'Sản phẩm',
  'label.fQty': 'Số lượng',
  'label.fDate': 'Ngày',
  'label.fWholeWeek': 'Cả tuần',
  'label.printedOn': 'In ngày {date}',

  /* ---- bản in kế hoạch ---- */
  'sheet.printedOn': 'In ngày {date}',
  'sheet.total': 'Tổng cộng',

  /* ---- cài đặt ---- */
  'set.title': 'Cài đặt',
  'set.subtitle':
    'Màu ở đây là nguồn duy nhất cho toàn bộ giao diện. Giá trị mặc định lấy từ file BRAND-CONFIG.md ở thư mục gốc dự án.',
  'set.brand': 'Thương hiệu',
  'set.brandName': 'Tên thương hiệu',
  'set.logo': 'Logo',
  'set.logoHint': 'PNG nền trong suốt, tối đa 1.5MB',
  'set.logoDefault': 'Dùng logo mặc định',
  'set.colors': 'Màu thương hiệu',
  'set.fonts': 'Font chữ',
  'set.fontBody': 'Font chữ thường',
  'set.fontBodyHint': 'Dùng cho toàn bộ chữ',
  'set.fontNum': 'Font số liệu',
  'set.fontNumHint': 'Dùng cho cột số trong bảng',
  'set.statusColors': 'Màu trạng thái sản xuất',
  'set.statusNote':
    'Bốn màu này là quy ước nghiệp vụ khớp bảng Excel gốc nên cố định, đổi màu thương hiệu không ảnh hưởng tới chúng. Nhãn chữ sửa được ở màn hình Kế hoạch tuần.',
  'set.saveBtn': 'Lưu cài đặt',
  'set.resetBtn': 'Khôi phục mặc định',
  'set.saved': 'Đã lưu cấu hình thương hiệu.',
  'set.resetDone': 'Đã khôi phục màu mặc định theo BRAND-CONFIG.md.',
  'set.logoTooBig': 'Ảnh quá lớn (giới hạn 1.5MB). Hãy nén bớt rồi thử lại.',
  'set.danger': 'Vùng nguy hiểm',
  'set.dangerNote':
    'Xoá toàn bộ dữ liệu DÙNG CHUNG trên máy chủ: sản phẩm, mọi tuần kế hoạch, tuần đã chốt và cài đặt — ảnh hưởng TẤT CẢ mọi người đang dùng app, không riêng máy này. Không khôi phục được.',
  'set.migration': 'Đẩy dữ liệu cũ lên máy chủ chung',
  'set.migrationNote':
    'Chỉ dùng MỘT LẦN lúc mới chuyển sang máy chủ chung: đọc dữ liệu đã nhập trước đây trên máy này (còn lưu cục bộ trong trình duyệt) và đẩy lên Supabase, để không phải nhập lại.',
  'set.migrationRun': 'Đẩy dữ liệu lên',
  'set.migrationNoLocalData': 'Không tìm thấy dữ liệu cũ trên máy này (trình duyệt chưa từng lưu gì cục bộ).',
  'set.migrationConfirm':
    'Đẩy {products} sản phẩm và {weeks} tuần từ máy này lên máy chủ chung?\n\nNếu trên máy chủ đã có sản phẩm trùng SKU, dữ liệu cũ trên máy chủ sẽ được giữ nguyên (không ghi đè).',
  'set.migrationDone': 'Đã đẩy xong: {products} sản phẩm mới, {weeks} tuần mới.',
  'set.migrationRunning': 'Đang đẩy dữ liệu…',
  'set.dangerConfirm': 'Gõ chính xác: XOA TAT CA',
  'set.dangerWord': 'XOA TAT CA',
  'set.dangerBtn': 'Xoá toàn bộ dữ liệu',
  'set.cPrimary': 'Primary',
  'set.cPrimaryHint': 'Thanh nav, nút chính, tiêu đề bảng',
  'set.cOnPrimary': 'Chữ trên nền Primary',
  'set.cOnPrimaryHint': 'Thường để trắng',
  'set.cSecondary': 'Secondary',
  'set.cSecondaryHint': 'Badge, nhấn phụ',
  'set.cAccent': 'Accent',
  'set.cAccentHint': 'Số liệu nổi bật',
  'set.cBackground': 'Nền tổng thể',
  'set.cForeground': 'Màu chữ chính',
  'set.cMuted': 'Muted',
  'set.cMutedHint': 'Nền phụ, viền nhạt',
  'set.cBorder': 'Viền bảng',
  'set.cDestructive': 'Màu lỗi',
  'set.cDestructiveHint': 'Cảnh báo hệ thống',

  /* ---- hướng dẫn ---- */
  'guide.source':
    'Nội dung này lấy từ file {file} ở thư mục app — sửa file đó là trang này đổi theo.',

  /* ---- lỗi ---- */
  'err.title': 'Ứng dụng gặp lỗi',
  'err.intro':
    'Rất tiếc, màn hình này không hiển thị được. Dữ liệu của bạn vẫn còn nguyên — lỗi này chỉ ở phần hiển thị.',
  'err.steps': 'Hãy thử theo thứ tự:',
  'err.step1': 'Bấm nút “Tải lại app” bên dưới.',
  'err.step2': 'Nếu vẫn lỗi, đóng hẳn trình duyệt rồi mở lại app.',
  'err.step3': 'Nếu vẫn chưa được, chụp màn hình phần chữ đỏ bên dưới và gửi cho người phụ trách.',
  'err.reload': 'Tải lại app',
  'err.goHome': 'Về màn hình Tổng quan',

  /* ---- đăng nhập ---- */
  'login.title': 'Đăng nhập',
  'login.subtitle': 'Nhập mật khẩu dùng chung của xưởng để mở kế hoạch sản xuất.',
  'login.password': 'Mật khẩu',
  'login.submit': 'Đăng nhập',
  'login.submitting': 'Đang kiểm tra…',
  'login.wrongPassword': 'Sai mật khẩu. Hỏi lại người quản trị nếu quên.',
  'login.networkError': 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.',
  'login.notConfigured':
    'App chưa được nối với máy chủ dữ liệu chung (Supabase). Người phụ trách kỹ thuật cần điền thông tin kết nối rồi build lại app.',
} as const

export type TKey = keyof typeof vi

const en: Record<TKey, string> = {
  /* ---- navigation ---- */
  'nav.dashboard': 'Overview',
  'nav.plan': 'Weekly Plan',
  'nav.products': 'Product Data',
  'nav.labels': 'Labels',
  'nav.groupMattress': 'Mattress',
  'nav.groupFoam': 'Foam',
  'nav.foamProducts': 'Foam Products',
  'nav.foamInvoice': 'Invoice',
  'nav.foamLabels': 'Foam Labels',
  'nav.settings': 'Settings',
  'nav.guide': 'User Guide',
  'nav.collapse': 'Collapse',
  'nav.expandMenu': 'Expand menu',
  'nav.collapseMenu': 'Collapse menu',
  'nav.language': 'Language',
  'nav.logout': 'Log out',

  /* ---- shared ---- */
  'common.loading': 'Loading…',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.search': 'Search',
  'common.all': 'All',
  'common.none': '— none —',
  'common.skip': '— skip —',
  'common.week': 'Week',
  'common.finalized': 'finalized',
  'common.processing': 'Working…',
  'common.connectionError':
    'Could not load the latest data — check your network connection. Showing the last data available.',

  /* ---- dashboard ---- */
  'dash.title': 'Overview — Week {week}',
  'dash.updatedAt': 'Updated {date} · Revised: ',
  'dash.openPlan': 'Open weekly plan',
  'dash.empty': 'No data for this week yet',
  'dash.emptyHint': 'Go to the Weekly Plan screen to add products and enter quantities.',
  'dash.totalThisWeek': 'Planned this week',
  'dash.totalLastWeek': 'Last week total',
  'dash.vsLastWeek': 'vs. last week',
  'dash.rowCount': 'Product rows',
  'dash.unscheduled': '{n} rows not scheduled',
  'dash.perDay': 'Output by day',
  'dash.perDayTooltip': '{n} units',
  'dash.output': 'Output',
  'dash.byStatus': 'By status group',
  'dash.status': 'Status',
  'dash.cells': 'Cells',
  'dash.products': 'Products',
  'dash.byStatusNote':
    '“Cells” = number of day cells filled with that colour. “Products” includes items colour-coded on the name.',
  'dash.attention': 'Needs attention — {a} / {b}',
  'dash.attentionEmpty': 'Nothing is flagged {a} or {b}.',
  'dash.product': 'Product',
  'dash.marks': 'Flags',
  'dash.relatedQty': 'Qty involved',
  'dash.note': 'Remark',

  /* ---- weekly plan ---- */
  'plan.title': 'Weekly Plan',
  'plan.newEmpty': 'New empty week',
  'plan.duplicate': 'Duplicate this week',
  'plan.print': 'Print / PDF (A4 landscape)',
  'plan.printTitle': 'Print the plan on A4 landscape paper',
  'plan.finalize': 'Finalize week',
  'plan.lockedBadge': 'FINALIZED — read only',
  'plan.revisedHint': 'Increases on every edit',
  'plan.reset': 'Reset',
  'plan.resetTitle': 'Reset to 0',
  'plan.dayCols': 'Day columns:',
  'plan.dayColsMonThu': 'Mon–Thu',
  'plan.dayColsMonSun': 'Mon–Sun',
  'plan.dayColsN': '{n} days',
  'plan.legend': 'Colour legend',
  'plan.editLabels': 'Edit labels',
  'plan.empty': 'No products in this week yet',
  'plan.emptyHint': 'Click “Add products to table” to pick from the catalogue.',
  'plan.addProducts': 'Add products to table',
  'plan.totalRow': 'TOTAL',
  'plan.lastWeekTitle': 'Total from the previous finalized week',
  'plan.nameColorTitle': 'Click to change the product name colour',
  'plan.cellColorTitle': 'Click to change the cell background colour',
  'plan.cellColorAria': 'Change cell background colour',
  'plan.deleteRow': 'Remove row',
  'plan.deleteRowTitle': 'Remove this row from the week',
  'plan.nothingToPrint': 'Nothing to print yet.',
  'plan.nothingToFinalize': 'Nothing to finalize yet.',
  'plan.confirmFinalize':
    'Finalize week {week}?\n\nOnce finalized the table is locked from editing, and this week’s totals become the "Last week" column for the next week.',
  'plan.finalized': 'Week {week} finalized.',
  'plan.duplicated': 'New week created from the previous one (products kept, quantities cleared).',
  'plan.createdEmpty': 'Empty week {week} created.',
  'plan.weekExists': 'Week {n} already exists.',
  'plan.addedN': '{n} products added to the plan.',
  'plan.alreadyIn': 'All selected products are already in the table.',
  'plan.export': 'Export week (.json)',
  'plan.exportTitle': 'Download this week as a .json file for backup or to move it to another machine',
  'plan.import': 'Import week from file',
  'plan.importTitle': 'Load a week from a previously exported .json file',

  /* ---- product picker ---- */
  'picker.title': 'Pick products to add',
  'picker.searchPlaceholder': 'Type to search by name or SKU…',
  'picker.noResult': 'No product found. Use the quick-add box below.',
  'picker.inTable': 'already in table',
  'picker.quickAdd': 'Quick-add a missing product',
  'picker.create': 'Create & select',
  'picker.confirm': 'Add {n} products',
  'picker.needBoth': 'Both SKU and product name are required.',
  'picker.skuExists': 'That SKU already exists.',

  /* ---- legend editor ---- */
  'legend.title': 'Edit colour legend labels',
  'legend.note':
    'Only the text can change. The four colours are a shop-floor convention and stay fixed to match the original Excel sheet.',
  'legend.saved': 'Legend labels saved.',
  'legend.labelFor': 'Label for colour {k}',

  /* ---- week export/import ---- */
  'wimp.title': 'Import week from backup file',
  'wimp.chooseFile': 'Choose .json file',
  'wimp.invalidFile': 'This file is not a valid week backup for this app.',
  'wimp.summary': 'Week {week} — {matched}/{total} rows matched a product in the catalogue',
  'wimp.unmatchedNote':
    '{n} rows have a SKU not in the catalogue yet. The app will create new products for them on import.',
  'wimp.overwriteWarning': 'Week {week} already exists in the app. Importing this file will OVERWRITE all of its data.',
  'wimp.finalizedBlock': 'Week {week} is finalized and cannot be overwritten. Change the week number in the file or pick another week.',
  'wimp.confirm': 'Import week {week}',
  'wimp.done': 'Week {week} imported: {rows} rows{created}.',
  'wimp.createdProducts': ', {n} new products created',
  'wimp.readError': 'Could not read the file. Make sure it is a .json file exported from this app.',
  'wimp.doneShort': 'Week {week} imported.',

  /* ---- product data ---- */
  'product.title': 'Product Data',
  'product.subtitle': 'This catalogue is the source for picking products in the weekly plan.',
  'product.import': 'Import from Excel',
  'product.add': 'Add product',
  'product.searchPlaceholder': 'Name, SKU, size…',
  'product.line': 'Product line',
  'product.showArchived': 'Show archived items',
  'product.count': '{shown}/{total} products',
  'product.empty': 'No products yet',
  'product.emptyHint':
    'Click “Import from Excel” to load a list in bulk, or “Add product” to create them one by one.',
  'product.colSku': 'SKU',
  'product.colName': 'Product name',
  'product.colSize': 'Size',
  'product.colLine': 'Line',
  'product.colStatus': 'Default colour',
  'product.colPic': 'PIC',
  'product.colNote': 'Remark',
  'product.colActions': 'Actions',
  'product.archived': 'archived',
  'product.archive': 'Archive',
  'product.restore': 'Restore',
  'product.formAdd': 'Add new product',
  'product.formEdit': 'Edit product',
  'product.fSku': 'SKU *',
  'product.fSkuHint': 'Must be unique',
  'product.fSize': 'Size',
  'product.fName': 'Product name *',
  'product.fLine': 'Product line',
  'product.fPic': 'Person in charge (PIC)',
  'product.fStatus': 'Default status colour',
  'product.fNote': 'Remark',
  'product.errSku': 'SKU is required.',
  'product.errName': 'Product name is required.',
  'product.errDup': 'SKU "{sku}" is already used by another product.',
  'product.savedNew': 'Product added.',
  'product.savedEdit': 'Product updated.',
  'product.archivedMsg': 'Product archived (not deleted).',
  'product.restoredMsg': 'Product restored.',

  /* ---- Excel import ---- */
  'imp.title': 'Import products from Excel',
  'imp.step1': 'Step 1 — Choose file',
  'imp.template': 'Download Excel template',
  'imp.sheet': 'Sheet to import',
  'imp.step2': 'Step 2 — Map columns',
  'imp.step2Hint':
    'The app has guessed these. Check them, and choose “— skip —” for columns your file does not have.',
  'imp.step3': 'Step 3 — Review before importing',
  'imp.newCount': '{n} new products',
  'imp.dupExisting': '{n} existing SKUs',
  'imp.dupFile': '{n} duplicated in file',
  'imp.errCount': '{n} invalid rows',
  'imp.dupQuestion': 'For SKUs that already exist in the app:',
  'imp.dupSkip': 'Skip, keep existing data',
  'imp.dupUpdate': 'Overwrite with data from the file',
  'imp.colRow': 'Row',
  'imp.colState': 'Status',
  'imp.willAdd': 'Will be added',
  'imp.willUpdate': 'Will be overwritten',
  'imp.willSkipExisting': 'Already exists — skipped',
  'imp.willSkipFileDup': 'Duplicate SKU in file — skipped',
  'imp.preview300': 'Showing the first 300 of {n} rows. All rows are processed on import.',
  'imp.run': 'Import {n} products',
  'imp.noRows': 'This sheet has no data rows.',
  'imp.readFail': 'Could not read the file.',
  'imp.runFail': 'Import failed.',
  'imp.done': '{n} products imported from Excel.',
  'imp.fMissingSku': 'Missing SKU',
  'imp.fMissingName': 'Missing product name',
  'imp.fieldSku': 'SKU',
  'imp.fieldName': 'Product name',
  'imp.fieldSize': 'Size',
  'imp.fieldCategory': 'Product line',
  'imp.fieldPic': 'Person in charge (PIC)',
  'imp.fieldStatus': 'Default status colour',
  'imp.fieldNotes': 'Remark',

  /* ---- labels ---- */
  'label.title': 'Print Labels',
  'label.subtitle': 'Landscape 4 × 2 inch label, one per page.',
  'label.print': 'Print',
  'label.printN': 'Print {n} labels',
  'label.empty': 'No row in this week has a quantity yet',
  'label.emptyHint': 'Enter quantities on the Weekly Plan screen before printing labels.',
  'label.pick': 'Pick rows to print ({sel}/{total})',
  'label.splitByDay': 'One label per day',
  'label.selectAll': 'Select all',
  'label.deselectAll': 'Clear selection',
  'label.colTotal': 'Total',
  'label.preview': 'Preview',
  'label.previewN': 'Preview (label 1 of {n})',
  'label.previewEmpty': 'Select at least one row to preview a label.',
  'label.printHint':
    'Clicking Print opens the browser print dialog. Choose 4×2 inch paper (Landscape) and set margins to None so the label is not scaled down.',
  'label.fProduct': 'Product',
  'label.fQty': 'Quantity',
  'label.fDate': 'Day',
  'label.fWholeWeek': 'Whole week',
  'label.printedOn': 'Printed {date}',

  /* ---- plan print sheet ---- */
  'sheet.printedOn': 'Printed {date}',
  'sheet.total': 'TOTAL',

  /* ---- settings ---- */
  'set.title': 'Settings',
  'set.subtitle':
    'These colours are the single source for the whole interface. Defaults come from BRAND-CONFIG.md in the project root.',
  'set.brand': 'Brand',
  'set.brandName': 'Brand name',
  'set.logo': 'Logo',
  'set.logoHint': 'PNG with transparent background, max 1.5MB',
  'set.logoDefault': 'Use default logo',
  'set.colors': 'Brand colours',
  'set.fonts': 'Fonts',
  'set.fontBody': 'Body font',
  'set.fontBodyHint': 'Used for all text',
  'set.fontNum': 'Numeric font',
  'set.fontNumHint': 'Used for number columns in tables',
  'set.statusColors': 'Production status colours',
  'set.statusNote':
    'These four colours are a shop-floor convention matching the original Excel sheet, so they are fixed — changing brand colours does not affect them. Their text labels can be edited on the Weekly Plan screen.',
  'set.saveBtn': 'Save settings',
  'set.resetBtn': 'Restore defaults',
  'set.saved': 'Brand settings saved.',
  'set.resetDone': 'Default colours from BRAND-CONFIG.md restored.',
  'set.logoTooBig': 'Image too large (1.5MB limit). Please compress it and try again.',
  'set.danger': 'Danger zone',
  'set.dangerNote':
    'Deletes all SHARED data on the server: products, all weekly plans, finalized weeks and settings — affects EVERYONE using the app, not just this machine. This cannot be undone.',
  'set.migration': 'Push old data to the shared server',
  'set.migrationNote':
    'One-time use only, right after switching to the shared server: reads data entered on this machine before the switch (still stored locally in this browser) and pushes it to Supabase, so it does not need to be re-entered.',
  'set.migrationRun': 'Push data',
  'set.migrationNoLocalData': 'No old data found on this machine (this browser never stored anything locally).',
  'set.migrationConfirm':
    'Push {products} products and {weeks} weeks from this machine to the shared server?\n\nIf a product with the same SKU already exists on the server, the server copy is kept (not overwritten).',
  'set.migrationDone': 'Done: {products} new products, {weeks} new weeks.',
  'set.migrationRunning': 'Pushing data…',
  'set.dangerConfirm': 'Type exactly: DELETE ALL',
  'set.dangerWord': 'DELETE ALL',
  'set.dangerBtn': 'Delete all data',
  'set.cPrimary': 'Primary',
  'set.cPrimaryHint': 'Nav bar, main buttons, table headers',
  'set.cOnPrimary': 'Text on primary',
  'set.cOnPrimaryHint': 'Usually white',
  'set.cSecondary': 'Secondary',
  'set.cSecondaryHint': 'Badges, secondary emphasis',
  'set.cAccent': 'Accent',
  'set.cAccentHint': 'Highlighted figures',
  'set.cBackground': 'Page background',
  'set.cForeground': 'Main text colour',
  'set.cMuted': 'Muted',
  'set.cMutedHint': 'Secondary fills, light borders',
  'set.cBorder': 'Table borders',
  'set.cDestructive': 'Error colour',
  'set.cDestructiveHint': 'System warnings',

  /* ---- guide ---- */
  'guide.source': 'This page is rendered from {file} in the app folder — edit that file to change it.',

  /* ---- errors ---- */
  'err.title': 'Something went wrong',
  'err.intro':
    'Sorry, this screen could not be displayed. Your data is safe — this is a display problem only.',
  'err.steps': 'Try these in order:',
  'err.step1': 'Click “Reload app” below.',
  'err.step2': 'If it still fails, close the browser completely and reopen the app.',
  'err.step3':
    'If it still fails, screenshot the red text below and send it to whoever maintains the app.',
  'err.reload': 'Reload app',
  'err.goHome': 'Go to Overview',

  /* ---- login ---- */
  'login.title': 'Log in',
  'login.subtitle': "Enter the plant's shared password to open the production plan.",
  'login.password': 'Password',
  'login.submit': 'Log in',
  'login.submitting': 'Checking…',
  'login.wrongPassword': 'Wrong password. Ask your admin if you forgot it.',
  'login.networkError': 'Could not reach the server. Check your connection and try again.',
  'login.notConfigured':
    'The app is not yet connected to the shared data server (Supabase). Whoever set up the app needs to fill in the connection details and rebuild.',
}

const DICT: Record<Lang, Record<TKey, string>> = { vi, en }

const STORAGE_KEY = 'waco-lang'

export function loadLang(): Lang {
  const v = localStorage.getItem(STORAGE_KEY)
  return LANGS.includes(v as Lang) ? (v as Lang) : 'vi'
}

export function saveLang(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang)
}

/** Dịch một khoá, thay {tham_số} bằng giá trị truyền vào. */
export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>): string {
  let s: string = DICT[lang][key] ?? DICT.vi[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}
