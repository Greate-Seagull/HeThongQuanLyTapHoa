import { Request, Response, NextFunction } from "express";
import { tokenService, prisma } from "../../composition-root";
import { authenticationTokenSchema } from "../../domain/services/encrypt.service";

export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('🔐 Authentication middleware called');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({
        status: "fail",
        data: { message: "Missing authorization header" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      console.log('❌ No token after Bearer prefix');
      return res.status(401).json({
        status: "fail",
        data: { message: "Missing token" },
      });
    }

    console.log('🔍 Verifying token...');
    const decoded = tokenService.verifyJwt(token);
    console.log('🔍 Decoded token:', decoded);
    
    const parsed = authenticationTokenSchema.parse(decoded);
    console.log('✅ Parsed payload:', parsed);

    const accountId = parsed.id;
    const position = parsed.position; // May be undefined for customer tokens
    
    // ✅ CRITICAL FIX: Try EmployeeAccount first, fallback to Account (Customer)
    console.log(`🔍 Attempting to resolve account ID: ${accountId}`);
    
    // Try EmployeeAccount first (for staff)
    const employeeAccount = await prisma.employeeAccount.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        employeeId: true,
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
    
    if (employeeAccount) {
      // ✅ EMPLOYEE TOKEN
      console.log('👨‍💼 Resolved as EMPLOYEE');
      
      (req as any).accountId = accountId;
      (req as any).authId = employeeAccount.employeeId;
      (req as any).position = employeeAccount.employee.position;
      (req as any).employeeData = employeeAccount.employee;
      (req as any).userType = 'EMPLOYEE';
      
      console.log('✅ Employee authenticated:', {
        accountId,
        employeeId: employeeAccount.employeeId,
        position: employeeAccount.employee.position,
      });
      
      return next();
    }
    
    // Try Account (for customers)
    const customerAccount = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        userId: true,
        phoneNumber: true,
        user: {
          select: {
            id: true,
            name: true,
            point: true,
          },
        },
      },
    });
    
    if (customerAccount) {
      // ✅ CUSTOMER TOKEN
      console.log('👤 Resolved as CUSTOMER');
      
      (req as any).accountId = customerAccount.id;
      (req as any).userId = customerAccount.userId;
      (req as any).authId = customerAccount.userId;  // For usecases expecting authId
      (req as any).position = 'CUSTOMER';
      (req as any).userData = customerAccount.user;
      (req as any).userType = 'CUSTOMER';
      
      console.log('✅ Customer authenticated:', {
        accountId: customerAccount.id,
        userId: customerAccount.userId,
        name: customerAccount.user.name,
        point: customerAccount.user.point,
      });
      
      return next();
    }
    
    // Neither found
    console.log('❌ Account not found in any table');
    return res.status(401).json({
      status: "fail",
      data: { message: "Account not found" },
    });

  } catch (error: any) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({
      status: "fail",
      data: { message: "Invalid or expired token" },
    });
  }
}
