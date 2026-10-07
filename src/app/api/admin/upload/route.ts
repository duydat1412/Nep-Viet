import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/storage/r2';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file tải lên.' },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng file ảnh
    const mimeType = file.type;
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận định dạng ảnh (PNG, JPEG, WEBP, SVG).' },
        { status: 400 }
      );
    }

    // Giới hạn kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Kích thước file vượt quá giới hạn cho phép (10MB).' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImage(buffer, file.name, mimeType);

    return NextResponse.json({
      success: true,
      url: result.url,
      storage: result.storage,
      filename: result.filename,
      warning: result.warning,
    });
  } catch (error: any) {
    console.error('Lỗi API Upload:', error);
    return NextResponse.json(
      { error: 'Lỗi trong quá trình upload file.', message: error.message },
      { status: 500 }
    );
  }
}
