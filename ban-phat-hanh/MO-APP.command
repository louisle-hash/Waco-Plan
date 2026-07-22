#!/bin/bash
# ============================================================
#  MỞ APP KẾ HOẠCH SẢN XUẤT WACO
#  Bấm đúp vào file này để chạy app.
#  (Cách này chạy qua localhost nên dữ liệu luôn được lưu an toàn.)
# ============================================================

cd "$(dirname "$0")" || exit 1

PORT=8777

# Tìm python3 (macOS có sẵn) hoặc node
if command -v python3 >/dev/null 2>&1; then
  SERVER_CMD="python3 -m http.server $PORT --bind 127.0.0.1"
elif [ -x "$HOME/.local/bin/node" ]; then
  SERVER_CMD="$HOME/.local/bin/npx --yes serve -l $PORT ."
else
  echo "Không tìm thấy python3 hoặc node trên máy này."
  echo "Hãy mở trực tiếp file WACO-KeHoachSanXuat.html bằng trình duyệt."
  read -r -p "Nhấn Enter để đóng..."
  exit 1
fi

# Nếu cổng đang bận thì coi như app đã chạy sẵn
if lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "App đã chạy sẵn. Đang mở trình duyệt..."
  open "http://localhost:$PORT/WACO-KeHoachSanXuat.html"
  exit 0
fi

echo "============================================"
echo " APP KẾ HOẠCH SẢN XUẤT WACO"
echo "============================================"
echo ""
echo "Đang khởi động... trình duyệt sẽ tự mở sau 2 giây."
echo ""
echo ">>> ĐỪNG ĐÓNG CỬA SỔ NÀY trong lúc dùng app. <<<"
echo "    Đóng cửa sổ này = tắt app."
echo ""

( sleep 2; open "http://localhost:$PORT/WACO-KeHoachSanXuat.html" ) &

exec $SERVER_CMD
