import { prisma } from '../../../composition-root';
import z from 'zod';

const inputSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  username: z.string().min(1),
  avatar: z.string().optional(),
});

const outputSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  position: z.string(),
  avatar: z.string().nullable().optional().default(null), // ✅ Default to null
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
      // Update name and avatar
      const updatedEmployee = await prisma.employee.update({
        where: { id: parsed.id },
        data: { 
          name: parsed.name,
          ...(parsed.avatar !== undefined && { avatar: parsed.avatar }),
        },
        select: {
          id: true,
          name: true,
          position: true,
          avatar: true, // ✅ Select avatar từ database sau khi update
        }
      });
      
      // Update username in employee_account
      const updatedAccount = await prisma.employeeAccount.updateMany({
        where: { employeeId: parsed.id },
        data: { username: parsed.username },
      });
      
      // Return updated profile
      const result = {
        id: parsed.id,
        name: updatedEmployee.name,
        username: parsed.username,
        position: updatedEmployee.position,
        avatar: updatedEmployee.avatar || null, // ✅ Convert undefined to null
      };
      
      return outputSchema.parse(result);
    } catch (error) {
      console.error('[UpdateManagerProfileUsecase] Error:', error && (error.message || error));
      throw error;
    }
  }
}
