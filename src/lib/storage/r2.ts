import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Kiểm tra cấu hình Cloudflare R2
const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;

const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucketName);

let s3Client: S3Client | null = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
}

export interface UploadResult {
  url: string;
  storage: 'r2' | 'local';
  filename: string;
  warning?: string;
}

/**
 * Upload file ảnh lên Cloudflare R2 (hoặc local fallback nếu chưa thiết lập keys)
 */
export async function uploadImage(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<UploadResult> {
  const ext = path.extname(originalFilename) || '.png';
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const safeBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `items/${safeBase}_${timestamp}_${randomStr}${cleanExt}`;

  // 1. Nếu đã cấu hình Cloudflare R2
  if (isR2Configured && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: contentType || 'image/png',
      });

      await s3Client.send(command);

      const baseUrl = publicUrl ? publicUrl.replace(/\/$/, '') : `https://${bucketName}.r2.dev`;
      return {
        url: `${baseUrl}/${filename}`,
        storage: 'r2',
        filename,
      };
    } catch (err: any) {
      console.error('Lỗi upload lên Cloudflare R2, chuyển sang local fallback:', err);
    }
  }

  // 2. Local Fallback (Lưu vào /public/uploads/...)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFile = path.basename(filename);
  const targetPath = path.join(uploadsDir, localFile);
  fs.writeFileSync(targetPath, buffer);

  return {
    url: `/uploads/${localFile}`,
    storage: 'local',
    filename: localFile,
    warning: isR2Configured
      ? 'Upload R2 gặp sự cố kết nối, đã lưu tạm thời tại local storage.'
      : 'Cloudflare R2 chưa cấu hình biến môi trường, ảnh được lưu tạm thời tại /public/uploads/.',
  };
}
