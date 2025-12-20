import { PrismaTransactionManager } from "../../../infrastructure/transaction";
import { PasswordService } from "../../../domain/services/encrypt.service";
import { logger } from "../../../domain/services/logger.service";
import z from "zod";

const inputSchema = z.object({
  id: z.union([z.string(), z.number()])
    .transform((val) => typeof val === 'string' ? Number(val) : val),
  currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có tối thiểu 6 ký tự"),
});

export class ChangeCustomerPasswordUsecase {
  constructor(
    private readonly transactionManager: PrismaTransactionManager,
    private readonly passwordService: PasswordService
  ) {}

  async execute(input: any) {
    const parsed = inputSchema.parse(input);
    const log = logger.child({
      task: "Change customer password",
      id: parsed.id,
    });
    log.info("Task started");

    await this.transactionManager.transaction(async (tx) => {
      // Lấy account theo userId
      const account = await tx.account.findFirst({
        where: { userId: parsed.id },
        select: { id: true, passwordHash: true, salt: true },
      });
      if (!account) throw new Error("Account not found");

      // Kiểm tra mật khẩu hiện tại
      const isValid = this.passwordService.comparePassword(
        parsed.currentPassword,
        account.passwordHash
      );
      if (!isValid) throw new Error("Mật khẩu hiện tại không đúng");

      // Hash mật khẩu mới
      const newSalt = this.passwordService.generateSalt();
      const newHash = await this.passwordService.hashPassword(parsed.newPassword, newSalt);

      // Update mật khẩu
      await tx.account.update({
        where: { id: account.id },
        data: { passwordHash: newHash, salt: newSalt },
      });
    });

    log.info("Task completed");
    return { message: "Đổi mật khẩu thành công" };
  }
}
