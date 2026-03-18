import multer from 'multer';
import os from 'os';
import path from 'path';

// We use the Operating System's temporary directory to store files.
// This is much safer than memory storage (RAM) for large 500MB media files.
const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure Multer with size limits and file type validation
export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max size limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept audio and video mime types
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  }
});