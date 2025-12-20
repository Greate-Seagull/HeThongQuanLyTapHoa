import { PrismaClient } from "@prisma/client";

export class EmployeeAccountReadAccessor {
  constructor(private readonly prisma: PrismaClient) {}

  async existByUsername(username: string) {
    const count = await this.prisma.employeeAccount.count({
      where: {
        username: username,
      },
    });

    return count === 1;
  }

  async getAll() {
    // Lấy tất cả account cùng employee
    const accounts = await this.prisma.employeeAccount.findMany({
      select: {
        id: true,
        username: true,
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });

    // Lấy danh sách employeeId
    const employeeIds = accounts.map(acc => acc.employee.id);
    // Lấy map employeeId -> có hoạt động không
    const [invoiceCounts, goodReceiptCounts, stocktakingCounts] = await Promise.all([
      this.prisma.invoice.groupBy({
        by: ['employeeId'],
        where: { employeeId: { in: employeeIds } },
        _count: { employeeId: true },
      }),
      this.prisma.goodReceipt.groupBy({
        by: ['employeeId'],
        where: { employeeId: { in: employeeIds } },
        _count: { employeeId: true },
      }),
      this.prisma.stocktaking.groupBy({
        by: ['employeeId'],
        where: { employeeId: { in: employeeIds } },
        _count: { employeeId: true },
      }),
    ]);

    const hasActivityMap = new Map();
    invoiceCounts.forEach(row => { hasActivityMap.set(row.employeeId, true); });
    goodReceiptCounts.forEach(row => { hasActivityMap.set(row.employeeId, true); });
    stocktakingCounts.forEach(row => { hasActivityMap.set(row.employeeId, true); });

    // Gắn hasActivity vào từng employee
    return accounts.map(acc => ({
      ...acc,
      employee: {
        ...acc.employee,
        hasActivity: !!hasActivityMap.get(acc.employee.id)
      }
    }));
  }
}
