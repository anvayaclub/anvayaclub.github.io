import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function getCloudinaryClient() {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
}

export function generateCloudinarySignature(folder = 'anvaya') {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured.'
    );
  }
  getCloudinaryClient();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

export interface UploadResult {
  fileUrl: string;
  filename: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export async function uploadMediaBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  folder = 'anvaya'
): Promise<UploadResult> {
  const isVideo =
    mimetype.startsWith('video/') ||
    originalFilename.toLowerCase().endsWith('.mp4') ||
    originalFilename.toLowerCase().endsWith('.webm');
  const resourceType = isVideo ? 'video' : 'auto';

  // 1. If Cloudinary is configured, stream buffer directly to Cloudinary
  if (isCloudinaryConfigured()) {
    const client = getCloudinaryClient();
    return new Promise((resolve, reject) => {
      const uploadStream = client.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(error?.message || 'Failed to upload media to Cloudinary.'));
          }
          resolve({
            fileUrl: result.secure_url,
            filename: result.original_filename || originalFilename,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
          });
        }
      );

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  // 2. Resilient fallback for local development or server environments with writable filesystem
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(originalFilename).toLowerCase();
    const uniqueName = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const targetPath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(targetPath, buffer);

    return {
      fileUrl: `/uploads/${uniqueName}`,
      filename: uniqueName,
      bytes: buffer.length,
      resourceType: isVideo ? 'video' : 'image',
    };
  } catch (fsError: any) {
    console.error('Filesystem write failed and Cloudinary not configured:', fsError);
    throw new Error(
      'Media storage service requires Cloudinary credentials in serverless production. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project environment variables.'
    );
  }
}
