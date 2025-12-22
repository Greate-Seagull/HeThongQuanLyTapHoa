import { Request, Response } from "express";
import { logger } from "../../domain/services/logger.service";

export function controller<T extends { execute: (input: any) => Promise<any> }>(
  usecase: T
) {
  return async (req: Request, res: Response) => {
    try {
      console.log(`🔍 Controller called for usecase: ${usecase.constructor.name}`);
      
      // ✅ CRITICAL: Extract authId from middleware
      const authId = (req as any).authId;
      
      // ✅ FIX: Initialize req.body if undefined (happens with GET requests)
      if (!req.body || typeof req.body !== 'object') {
        req.body = {};
      }
      
      if (authId) {
        console.log(`✅ authId from middleware: ${authId}`);
        // ✅ Merge authId into body for usecases that need it
        req.body.authId = authId;
      }
      
      console.log(`📦 Request body:`, req.body);
      console.log(`📦 Request params:`, req.params);
      console.log(`📦 Request query:`, req.query);
      
      const output = await usecase.execute(req.body);
      
      console.log(`✅ Usecase completed:`, usecase.constructor.name);
      
      res.jsend.success(output);
    } catch (error: any) {
      console.error(`❌ Controller error:`, {
        usecase: usecase.constructor.name,
        message: error.message,
        stack: error.stack,
      });
      
      logger.error("Request failed", {
        usecase: usecase.constructor.name,
        error: {},
      });
      
      res.jsend.fail(error.message);
    }
  };
}
