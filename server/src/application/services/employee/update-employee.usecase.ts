import { prisma } from '../../../composition-root';
import z from 'zod';

const inputSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  position: z.enum(['SALES', 'INVENTORY', 'RECEIVING', 'MANAGER']),
});

export class UpdateEmployeeUsecase {
  async execute(input: any) {
    const parsed = inputSchema.parse(input);
    const updated = await prisma.employee.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        position: parsed.position as any, // Đảm bảo đúng kiểu enum
      },
    });
    return updated;
  }
}
