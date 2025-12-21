import { prisma } from '../../../composition-root';
import z from 'zod';

const inputSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  username: z.string().min(1),
});

export class UpdateManagerProfileUsecase {
    async execute(input: any) {
           console.log('[UpdateManagerProfileUsecase] Payload input:', input);
        try {
 
      const parsed = inputSchema.parse(input);
      // Update employee name and username for manager
      // Find employee by id and check position
      const employee = await prisma.employee.findUnique({
        where: { id: parsed.id },
      });
      if (!employee || employee.position !== 'MANAGER') {
        throw new Error('Manager not found');
      }
      // Update name
      await prisma.employee.update({
        where: { id: parsed.id },
        data: { name: parsed.name },
      });
      // Update username in employee_account
      await prisma.employeeAccount.updateMany({
        where: { employeeId: parsed.id },
        data: { username: parsed.username },
      });
      // Return updated profile
      return {
        id: parsed.id,
        name: parsed.name,
        username: parsed.username,
        position: 'MANAGER',
      };
    } catch (error) {
      console.error('[UpdateManagerProfileUsecase] Error:', error && (error.message || error));
      throw error;
    }
  }
}
