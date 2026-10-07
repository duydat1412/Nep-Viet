import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ItemSchema } from '@/lib/schema/data.schema';

const itemsFilePath = path.join(process.cwd(), 'data', 'items.json');

function getItems(): any[] {
  if (!fs.existsSync(itemsFilePath)) return [];
  const content = fs.readFileSync(itemsFilePath, 'utf8');
  return JSON.parse(content);
}

function saveItems(items: any[]) {
  fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2), 'utf8');
}

// GET /api/admin/products - Lấy toàn bộ danh sách sản phẩm
export async function GET(request: Request) {
  try {
    const items = getItems();
    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Không thể đọc danh sách sản phẩm.', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Thêm sản phẩm mới thủ công
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Tự sinh ID nếu chưa có hoặc làm sạch ID
    if (!body.id && body.name_vi) {
      const slug = body.name_vi
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      body.id = `${body.group || 'item'}_${slug}_${Date.now().toString().slice(-4)}`;
    }

    // Mặc định status là draft để an toàn văn hóa
    if (!body.status) {
      body.status = 'draft';
    }

    // Mặc định source_ids nếu chưa có
    if (!body.source_ids || !Array.isArray(body.source_ids)) {
      body.source_ids = ['N1'];
    }

    const validation = ItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dữ liệu sản phẩm không hợp lệ.', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const items = getItems();
    const existingIndex = items.findIndex((i) => i.id === validation.data.id);
    if (existingIndex >= 0) {
      return NextResponse.json(
        { error: `Mã sản phẩm (ID) '${validation.data.id}' đã tồn tại trong danh mục.` },
        { status: 409 }
      );
    }

    items.unshift(validation.data);
    saveItems(items);

    return NextResponse.json({
      success: true,
      message: 'Đã thêm sản phẩm thành công vào hệ sinh thái Nếp Việt.',
      item: validation.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi khi lưu sản phẩm mới.', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products - Chỉnh sửa cập nhật sản phẩm
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validation = ItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dữ liệu chỉnh sửa không hợp lệ.', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const items = getItems();
    const index = items.findIndex((i) => i.id === validation.data.id);
    if (index === -1) {
      return NextResponse.json(
        { error: `Không tìm thấy sản phẩm với ID: '${validation.data.id}'.` },
        { status: 404 }
      );
    }

    items[index] = validation.data;
    saveItems(items);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin sản phẩm thành công.',
      item: validation.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật sản phẩm.', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products - Xóa sản phẩm khỏi danh mục
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp mã sản phẩm (ID) cần xóa.' },
        { status: 400 }
      );
    }

    const items = getItems();
    const initialLen = items.length;
    const filtered = items.filter((i) => i.id !== id);

    if (filtered.length === initialLen) {
      return NextResponse.json(
        { error: `Không tìm thấy sản phẩm có ID '${id}' để xóa.` },
        { status: 404 }
      );
    }

    saveItems(filtered);

    return NextResponse.json({
      success: true,
      message: `Đã xóa sản phẩm '${id}' thành công.`,
      remaining_count: filtered.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi khi xóa sản phẩm.', message: error.message },
      { status: 500 }
    );
  }
}
