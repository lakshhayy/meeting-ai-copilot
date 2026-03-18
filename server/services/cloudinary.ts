import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary with our environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and returns the secure URL.
 * It automatically deletes the local file after processing.
 */
export async function uploadAudioToCloudinary(filePath: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Cloudinary uses 'video' for both audio and video files
      folder: 'meeting-copilot', // Organizes files in your Cloudinary dashboard
    });
    
    // Clean up the local file after successful upload so we don't run out of disk space
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result.secure_url;
  } catch (error) {
    // Ensure we clean up even if the upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload media file.");
  }
}