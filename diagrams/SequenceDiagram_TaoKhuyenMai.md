```mermaid
sequenceDiagram
    actor MA as Quản lý
    participant UI as Giao diện
    participant PS as Dịch vụ tạo khuyến mãi
    participant PE as Khuyến mãi
    participant PP as Kho khuyến mãi

    MA->>+UI: Tạo khuyến mãi
    UI->>+PS: Yêu cầu tạo khuyến mãi
    PS->>PS: Kiểm tra ngày bắt đầu, ngày kết thúc
    PS->>PS: Kiểm tra giá trị khuyến mãi
    PS->>PS: Kiểm tra mã loại khuyến mãi
    PS->>+PE: Tạo khuyến mãi
    PE-->>-PS: Khuyến mãi
    PS->>+PP: Lưu khuyến mãi
    PP-->>-PS:
    PS-->>-UI: Khuyến mãi
    UI->>UI: Hiển thị khuyến mãi
    UI-->>-MA:
```
