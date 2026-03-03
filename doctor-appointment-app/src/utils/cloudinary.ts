/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'drs9qu7ch',
  api_key: '881513522789742',
  api_secret: 'qYF6sf5BbFmwtkB69hQt6qoN3mY',
});

// --- 1. IMAGE OPTIONS (Preserves Format) ---
const IMAGE_OPTS = {
  quality: 'auto:best',  // Intelligent compression
  width: 1200,           // Resize huge images down to 1200px max width
  crop: 'limit',         // Ensure it only scales down, never up
  // No 'format' specified -> Preserves original (PNG/JPG)
};

// --- 2. VIDEO OPTIONS (Forces MP4) ---
const VIDEO_OPTS = {
  resource_type: 'video',
  width: 1080,           // Resize 4K video to 1080p to save space
  crop: 'limit',
  quality: 'auto:best',
  format: 'mp4',         // 👈 Forces MP4 for React Native compatibility
};

// Helper: Detect if file is video
const isVideo = (filename: string) => {
  return filename.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i);
};

// Upload Function
export async function uploadToCloudinary(filePath: string) {
  try {
    // Check file type to apply correct optimization
    const options = isVideo(filePath) ? VIDEO_OPTS : IMAGE_OPTS;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'centers',
      resource_type: 'auto',
      ...options, // Apply specific options
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Cloudinary upload failed');
  }
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename: string,
) {
  return new Promise<{ secure_url: string; public_id: string; resource_type: string }>(
    (resolve, reject) => {
      // Check file type to apply correct optimization
      const options = isVideo(filename) ? VIDEO_OPTS : IMAGE_OPTS;

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'centers',
          resource_type: 'auto',
          public_id: filename.replace(/\.[^/.]+$/, ''), // remove extension for public_id
          ...options, // Apply specific options
        },
        (
          error: unknown,
          result: { secure_url: string; public_id: string; resource_type: string } | undefined,
        ) => {
          if (error) {
            console.error('Cloudinary buffer upload failed:', error);
            return reject(new Error('Cloudinary upload failed'));
          }
          if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
            });
          }
        },
      );
      stream.end(buffer);
    },
  );
}

export const deleteFromCloudinary = async (imageUrl: string) => {
  try {
    // Robust ID extraction
    const parts = imageUrl.split('/');
    const filename = parts.pop()?.split('.')[0];
    const folder = parts.includes('centers') ? 'centers/' : ''; 
    const publicId = folder + filename;

    // Detect if it's a video based on URL structure to delete correctly
    const resourceType = imageUrl.includes('/video/upload/') ? 'video' : 'image';

    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
  }
};