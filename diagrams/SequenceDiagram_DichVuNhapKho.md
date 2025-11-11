```mermaid
sequenceDiagram
    actor Nhân viên nhập kho

    Nhân viên nhập kho->>+Giao diện: Nhập hàng
    Giao diện->>+Dịch vụ nhập hàng: Yêu cầu nhập hàng
    Dịch vụ nhập hàng->>+Hàng hóa: Tạo hàng hóa
    Hàng hóa-->>-Dịch vụ nhập hàng: Hàng hóa
    Dịch vụ nhập hàng->>+Kho hàng hóa: Cập nhật hàng hóa
    Kho hàng hóa-->>-Dịch vụ nhập hàng: Thông báo
    Dịch vụ nhập hàng->>+Phiếu nhập kho: Tạo phiếu nhập kho
    Phiếu nhập kho-->>-Dịch vụ nhập hàng: Phiếu nhập kho
    Dịch vụ nhập hàng->>+Kho lưu phiếu nhập: Lưu phiếu nhập kho
    Kho lưu phiếu nhập-->>-Dịch vụ nhập hàng: Thông báo
    Dịch vụ nhập hàng-->>-Giao diện: Phiếu nhập kho
    Giao diện->>Giao diện: Hiển thị phiếu nhập kho
    Giao diện-->>-Nhân viên nhập kho:
```
