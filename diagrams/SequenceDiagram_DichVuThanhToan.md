```mermaid

sequenceDiagram
    actor Cashier as Nhân viên bán hàng
    participant UI as Giao diện
    participant SearchingService as Dịch vụ tìm kiếm
    participant ProductRepository as Kho hàng hóa
    participant PaymentService as Dịch vụ thanh toán
    participant Invoice as Hóa đơn
    participant InvoiceRepository as Kho lưu hóa đơn

    Cashier->>+UI: Tìm hàng hóa
    UI->>+SearchingService: Yêu cầu tìm kiếm
    SearchingService->>+ProductRepository: Tìm hàng hóa theo bộ lọc
    ProductRepository-->>-SearchingService: Danh sách hàng hóa
    SearchingService-->>-UI: Danh sách hàng hóa
    UI->>UI: Hiển thị danh sách hàng hóa
    Cashier->>UI: Thanh toán
    UI->>+PaymentService: Yêu cầu thanh toán
    PaymentService->>+Invoice: Tạo hóa đơn
    Invoice-->>-PaymentService: hóa đơn
    PaymentService->>+InvoiceRepository: Lưu hóa đơn
    InvoiceRepository-->>-PaymentService: Thông báo
    PaymentService-->>-UI: hóa đơn
    UI->>UI: Hiển thị hóa đơn
    UI-->>-Cashier:
```
