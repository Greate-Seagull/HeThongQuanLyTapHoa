import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../../uploads/avatars");
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: user-{id}-{timestamp}.{ext}
    const authId = (req as any).authId || Date.now();
    const ext = path.extname(file.originalname);
    const filename = `user-${authId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Validate file
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Chỉ chấp nhận ảnh
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// POST /users/avatar - Upload avatar
router.post(
  "/avatar",
  authenticationMiddleware,
  upload.single("avatar"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).jsend.fail("No file uploaded");
      }

      // Tạo URL cho avatar (relative path)
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      return res.status(200).jsend.success({
        avatarUrl,
        message: "Avatar uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return res.status(500).jsend.error(error.message || "Failed to upload avatar");
    }
  }
);

export default router;
