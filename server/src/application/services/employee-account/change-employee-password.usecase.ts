import { prisma } from '../../../composition-root';
import bcrypt from 'bcryptjs';

export class ChangeEmployeePasswordUsecase {
  async execute({ id, currentPassword, newPassword }: { id: number; currentPassword: string; newPassword: string }) {
    // Lấy account theo id
    const account = await prisma.employeeAccount.findUnique({ where: { id } });
    if (!account) throw new Error('Tài khoản không tồn tại');

    // Kiểm tra mật khẩu hiện tại
    const isMatch = bcrypt.compareSync(currentPassword, account.passwordHash);
    if (!isMatch) throw new Error('Mật khẩu hiện tại không đúng');

    // Hash mật khẩu mới
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    // Cập nhật mật khẩu
    await prisma.employeeAccount.update({
      where: { id },
      data: { passwordHash: newHash, salt },
    });
    return { success: true };
  }
}
