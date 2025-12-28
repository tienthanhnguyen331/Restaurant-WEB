📌 KẾ HOẠCH HOÀN THIỆN PROJECT (PHIÊN BẢN CHUẨN NỘP)
1️⃣ PHÂN LOẠI CÔNG VIỆC & ƯU TIÊN
🔹 Backend
•	User / Auth module (JWT, Google OAuth)
•	Order module (CRUD, trạng thái, liên kết table, user)
•	Payment module (Stripe / MoMo)
•	Review module
•	Report module (doanh thu, best seller)
•	Websocket (order status, notification)
•	Seed / mock data
•	Dockerfile, CI/CD
🔹 Frontend
•	Đăng ký, đăng nhập, profile, order history
•	Màn chi tiết món ăn, review
•	UI waiter / kitchen
•	Payment UI, tích hợp payment gateway
•	Dashboard & báo cáo admin
•	Paging, sort, fuzzy search menu
•	Loading / empty / error state
•	i18n
🔹 Database
•	Thiết kế & migrate bảng: user, order, payment, review
•	Seed / mock data
🔹 Authentication / Authorization
•	Đăng ký, đăng nhập, JWT, Google OAuth
•	Role-based access control
🔹 UI / UX
•	Responsive, mobile-first
•	Tối ưu trải nghiệm người dùng
•	Loading / error / empty state
🔹 Documentation / Report
•	README chi tiết
•	API docs
•	Báo cáo
•	Video demo
________________________________________
2️⃣ LẬP LỊCH TRÌNH THEO TUẦN (ĐÃ ĐIỀU CHỈNH)
________________________________________
🟩 TUẦN 1
📅 28/12/2025 – 04/01/2026
🎯 Mục tiêu: Hoàn thiện Authentication, Database, các module nền tảng
Backend
•	Thiết kế & migrate bảng: user, order, payment, review
•	Xây dựng User module: entity, controller, service
•	Xây dựng Auth module: đăng ký, đăng nhập, JWT, Google OAuth
•	Bổ sung seed/mock data cơ bản
Frontend
•	Màn hình đăng ký, đăng nhập, profile
•	Kết nối API auth & user
Database / Logic
•	Viết migration/schema cho các bảng mới
•	Seed dữ liệu mẫu ban đầu
Documentation / Khác
•	Cập nhật README: setup project, DB, auth
•	Tách rõ các folder: frontend, backend, database (nếu chưa rõ ràng)
•	Tạo folder database chứa migration, seed, hướng dẫn import
•	Viết hướng dẫn triển khai (deployment) cơ bản cho frontend, backend, database (local)
•	Đảm bảo có file hướng dẫn cài đặt, chạy thử, cấu hình biến môi trường
✅ Kết quả mong đợi cuối tuần
•	Đăng ký / đăng nhập / phân quyền hoạt động ổn định
•	Database đầy đủ bảng, có seed data
•	Backend & frontend auth hoạt động đồng bộ
•	Cấu trúc thư mục, database, hướng dẫn setup cơ bản đã hoàn thiện
________________________________________
🟩 TUẦN 2
📅 05/01/2026 – 11/01/2026
🎯 Mục tiêu: Hoàn thiện toàn bộ chức năng chính (CODE TUẦN CUỐI)
Backend
•	Order module: CRUD, trạng thái, liên kết user / table
•	Payment module: tích hợp Stripe / MoMo
•	Review module
•	Report module (doanh thu, best seller)
•	Websocket cho cập nhật trạng thái order
Frontend
•	Order, payment, order history
•	Màn chi tiết món ăn, review
•	UI waiter / kitchen
•	Dashboard & báo cáo admin
•	Paging, sort, fuzzy search menu
•	Loading / empty / error state
Database / Logic
•	Seed dữ liệu: order, payment, review
Documentation / Khác
•	Cập nhật API docs cho order, payment, review (mức cơ bản)
•	Viết hướng dẫn triển khai chi tiết (local & internet) cho toàn bộ project
•	Hoàn thiện folder database: migration, seed, hướng dẫn import
•	Bắt đầu chuẩn bị Teamwork Report.pdf (chụp screenshot commit, phân công, teamwork)
•	Bắt đầu chuẩn bị Final Project Report.pdf (bản nháp: mô tả hệ thống, thành viên, tiến độ, chức năng, thiết kế DB, UI/UX, hướng dẫn sử dụng & triển khai)
•	Bắt đầu chuẩn bị Project Self-assessment Report.pdf (bản nháp: đánh giá tiêu chí, bằng chứng, điểm tổng, Pie chart, phân tích đóng góp)
•	Lên kịch bản video demo, phân vai trình bày
✅ Kết quả mong đợi cuối tuần
•	HOÀN THÀNH TOÀN BỘ CODE
•	Đủ luồng:
Đăng nhập → Order → Payment → Review → Admin / Waiter quản lý
•	Project sẵn sàng freeze code
•	Hướng dẫn triển khai, database, báo cáo teamwork/final/self-assessment bản nháp, kịch bản video demo đã chuẩn bị xong
________________________________________
🟥 TUẦN 3 
📅 12/01/2026 – 20/01/2026
🎯 Mục tiêu: Chuẩn bị nộp bài (TÀI LIỆU – VIDEO – BÁO CÁO)
Documentation / Report
•	Review lại toàn bộ SELF_ASSESSMENT_REPORT
•	Viết báo cáo chính thức
•	Hoàn thiện README & API docs
•	Chuẩn hóa cấu trúc nộp bài
•	Hoàn thiện Teamwork Report.pdf (có screenshot commit, phân công, teamwork)
•	Hoàn thiện Final Project Report.pdf (đủ các mục yêu cầu)
•	Hoàn thiện Project Self-assessment Report.pdf (đánh giá, bằng chứng, Pie chart, phân tích đóng góp)
Video Demo
•	Viết kịch bản demo
•	Quay & chỉnh sửa video demo
•	Đảm bảo demo đủ các flow:
o	Guest → Order → Payment
o	Admin quản lý
o	Waiter / Kitchen
•	Mở đầu: Giới thiệu nhóm, thành viên, phân công (có minh chứng: GitHub, commit, Jira, tài liệu)
•	Mỗi thành viên trình bày phần mình làm
•	Demo trên website public (nếu có)
Chuẩn bị nộp bài
•	Kiểm tra link deploy
•	Đóng gói source code
•	Backup dữ liệu
•	Kiểm tra lần cuối
•	Đảm bảo tài liệu rõ ràng, đúng cấu trúc yêu cầu
•	Đóng gói source code, database, báo cáo, video demo vào đúng thư mục
•	Kiểm tra lại link deploy, backup dữ liệu
•	In Project Self-assessment Report để nộp khi bảo vệ
•	Chuẩn bị link GitHub, highlight Contributors, phân tích vai trò từng thành viên
•	Chuẩn bị kịch bản trình bày, demo trực tiếp các chức năng chính
✅ Kết quả mong đợi cuối tuần
•	Báo cáo hoàn chỉnh
•	Video demo đầy đủ
•	Project sẵn sàng nộp
•	Đóng gói đúng cấu trúc, checklist nộp bài hoàn thiện, sẵn sàng oral defense
________________________________________
3️⃣ MỐC HOÀN THÀNH QUAN TRỌNG (MILESTONES)
•	✅ 11/01/2026: Hoàn thành toàn bộ code & chức năng
•	❄️ 12/01/2026: Freeze code – KHÔNG chỉnh code nữa
•	📝 15/01/2026: Hoàn thành báo cáo
•	🎥 17/01/2026: Hoàn thành video demo
•	📦 19/01/2026: Đóng gói & kiểm tra lần cuối
•	📤 20/01/2026: Nộp đồ án
________________________________________
4️⃣ CHECKLIST TỔNG HỢP
[ ] Backend – đủ module (auth, order, payment, review)
[ ] Frontend – đủ màn hình chính
[ ] Authentication & Authorization
[ ] UI/UX ổn định
[ ] Seed / mock data
[ ] README & API docs
[ ] Báo cáo
[ ] Video demo
[ ] Đóng gói & nộp bài
________________________________________
5️⃣ GIẢ ĐỊNH
•	2 thành viên
•	Mỗi người 2–3h/ngày
•	Backend & Frontend làm song song
•	Tuần cuối chỉ làm tài liệu & demo

________________________________________
6️⃣ BỔ SUNG ĐẦU VIỆC ĐÁP ỨNG FINAL PROJECT GUIDELINES

