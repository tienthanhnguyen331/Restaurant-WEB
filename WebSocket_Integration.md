# Tài liệu Tích hợp WebSocket (WebSocket Integration)

Tài liệu này mô tả chi tiết kiến trúc và luồng hoạt động của WebSocket trong hệ thống Restaurant WEB. Tài liệu nhằm phục vụ cho mục đích trả lời vấn đáp và hiểu rõ cơ chế thời gian thực (real-time) của ứng dụng.

## 1. Tổng quan Kiến trúc

Hệ thống sử dụng thư viện **Socket.io** để thực hiện giao tiếp thời gian thực hai chiều giữa client (Frontend - React) và server (Backend - NestJS).

*   **Backend**: Sử dụng NestJS WebSockets module với `@WebSocketGateway`.
*   **Frontend**: Sử dụng `socket.io-client` để kết nối.

Hệ thống phân chia luồng giao tiếp thành các **Namespace** riêng biệt để quản lý kết nối hiệu quả hơn:

| Namespace | Mục đích | Đối tượng sử dụng |
| :--- | :--- | :--- |
| `/` (Default) | Thông báo chung về đơn hàng và thanh toán | Khách hàng, Admin |
| `/waiter` | Thông báo dành riêng cho phục vụ | Nhân viên phục vụ (Waiter) |
| `/kitchen` | Thông báo dành riêng cho nhà bếp | Nhân viên bếp (Kitchen) |

---

## 2. Chi tiết các Gateway (Backend)

Hệ thống có 3 Gateway chính xử lý các sự kiện khác nhau.

### 2.1. OrderGateway (Global Namespace)
*   **File**: `src/modules/order/order.gateway.ts`
*   **Nhiệm vụ**: Phát các sự kiện liên quan đến thay đổi trạng thái đơn hàng chung.
*   **Các sự kiện phát đi (Server Emits):**
    *   `new_order`: Khi có đơn hàng mới được tạo.
    *   `order_status_update`: Khi trạng thái đơn hàng thay đổi (VD: PENDING -> CONFIRMED).
    *   `payment_status_update`: Khi trạng thái thanh toán thay đổi.

### 2.2. WaiterGateway (Namespace `/waiter`)
*   **File**: `src/modules/waiter/waiter.gateway.ts`
*   **Nhiệm vụ**: Thông báo cho waiter về các đơn hàng mới cần xử lý hoặc món ăn đã sẵn sàng phục vụ.
*   **Các sự kiện phát đi (Server Emits):**
    *   `newOrder`: Thông báo có đơn hàng mới cần xác nhận.
    *   `order_status_update`: Thông báo trạng thái đơn thay đổi để cập nhật giao diện.
    *   `orderReady`: Thông báo món ăn đã nấu xong ("READY"), cần bưng ra bàn.
*   **Sự kiện nhận (Subscribe):**
    *   `joinWaiterRoom`: Client yêu cầu tham gia vào room "waiters" (tuy nhiên trong code hiện tại chủ yếu dùng namespace support).

### 2.3. KitchenGateway (Namespace `/kitchen`)
*   **File**: `src/modules/kitchen/kitchen.gateway.ts`
*   **Nhiệm vụ**: Thông báo cho nhà bếp khi có món ăn cần chế biến.
*   **Các sự kiện phát đi (Server Emits):**
    *   `orderToKitchen`: Khi Waiter gửi đơn hàng xuống bếp (`sent_to_kitchen`).
*   **Sự kiện nhận (Subscribe):**
    *   `joinKitchenRoom`: Client yêu cầu tham gia room "kitchens".

---

## 3. Luồng Hoạt động (Frontend Integration)

Dưới đây là cách Frontend lắng nghe và phản hồi lại các sự kiện.

### 3.1. Waiter Dashboard (`WaiterDashboard.tsx`)
*   **Kết nối**: `io(${wsUrl}/waiter)`
*   **Cơ chế hoạt động**:
    *   Lắng nghe sự kiện `newOrder`: Gọi hàm `fetchOrders()` để tải lại danh sách đơn hàng mới nhất từ API.
    *   Lắng nghe sự kiện `order_status_update`: Gọi hàm `fetchOrders()` để cập nhật lại trạng thái các đơn hàng trên giao diện.

### 3.2. Kitchen Dashboard (`KitchenDashboard.tsx`)
*   **Kết nối**: `io(${wsUrl}/kitchen)`
*   **Cơ chế hoạt động**:
    *   Lắng nghe sự kiện `orderToKitchen`: Nhận trực tiếp object `order` từ sự kiện và cập nhật ngay lập tức vào state của React (`setOrders`) để hiển thị món mới mà không cần gọi lại API (giúp phản hồi nhanh hơn).

### 3.3. Client/Customer (`useOrderSocket.ts`)
*   **Kết nối**: `io(SOCKET_URL)` (Namespace mặc định).
*   Thường được sử dụng ở trang thái đơn hàng của khách (Guest Order Status) để nhận cập nhật khi đơn hàng chuyển từ "Đang chuẩn bị" sang "Đã xong".

---

## 4. Kịch bản Ví dụ (Use Case Flow)

### Kịch bản: Khách đặt món -> Bếp nhận đơn

1.  **Khách hàng (Guest)** quét mã QR và đặt món.
    *   API Backend tạo đơn hàng (Status: `PENDING`).
    *   **OrderGateway** emit `new_order`.
    *   **WaiterGateway** emit `newOrder`.

2.  **Phục vụ (Waiter)** nhận thông báo.
    *   Socket tại `WaiterDashboard` nhận sự kiện `newOrder`.
    *   App tự động gọi API lấy danh sách đơn mới.
    *   Waiter bấm "Chấp nhận" (Status: `CONFIRMED`) -> sau đó bấm "Gửi bếp" (Status: `PREPARING` / Action: `send_to_kitchen`).

3.  **Nhà bếp (Kitchen)** nhận đơn.
    *   Khi Waiter bấm "Gửi bếp", Backend gọi `kitchenGateway.notifyOrderToKitchen(order)`.
    *   Socket tại `KitchenDashboard` nhận sự kiện `orderToKitchen`.
    *   Đơn hàng hiện ngay lập tức lên màn hình bếp.

4.  **Nhà bếp hoàn thành món**.
    *   Đầu bếp bấm "Sẵn sàng" (Status: `READY`).
    *   Backend cập nhật DB và gọi `waiterGateway.notifyOrderReady`.
    *   Waiter nhận thông báo để mang món ra cho khách.
