import { PrismaTransactionManager } from '../../../infrastructure/transaction';
import { PasswordService } from '../../../domain/services/encrypt.service';
import z from 'zod';

const inputSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có tối thiểu 6 ký tự'),
});

export class ChangeManagerPasswordUsecase {
  constructor(
    private readonly transactionManager: PrismaTransactionManager,
    private readonly passwordService: PasswordService
  ) {}

  async execute(input: any) {
    const parsed = inputSchema.parse(input);

    return this.transactionManager.transaction(async (tx) => {
      // Lấy employeeAccount theo id
      const account = await tx.employeeAccount.findFirst({
        where: { employeeId: parsed.id },
        select: { id: true, passwordHash: true, salt: true },
      });
      if (!account) throw new Error('Không tìm thấy tài khoản');

      // Kiểm tra mật khẩu hiện tại
      const isValid = await this.passwordService.comparePassword(
        parsed.currentPassword,
        account.passwordHash
      );
      if (!isValid) throw new Error('Mật khẩu hiện tại không đúng');

      // Hash mật khẩu mới
      const newHash = await this.passwordService.hashPassword(
        parsed.newPassword,
        account.salt
      );

      // Update mật khẩu
      await tx.employeeAccount.update({
        where: { id: account.id },
        data: { passwordHash: newHash },
      });

      return { message: 'Đổi mật khẩu thành công' };
    });
  }
}