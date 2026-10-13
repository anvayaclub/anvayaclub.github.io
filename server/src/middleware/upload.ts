import multer from 'multer';
import path from 'path';

// Memory storage keeps file buffers in memory for direct Cloudinary streaming or safe saving,
// eliminating EROFS (read-only filesystem) errors on Vercel and serverless containers.
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.mp4', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.includes(ext) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext || file.mimetype}. Allowed formats: jpg, png, webp, svg, gif, mp4, webm.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (for short event videos)
  },
  fileFilter,
});
