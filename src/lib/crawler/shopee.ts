export interface ShopeeProductData {
  name: string;
  description: string;
  price: number;
  priceMin?: number;
  priceMax?: number;
  currency: string;
  images: string[];
  mainImage?: string;
  location?: string;
  brandName?: string;
  url: string;
}

/**
 * Kiểm tra xem URL có phải là liên kết Shopee không
 */
export function isShopeeUrl(url: string): boolean {
  if (!url) return false;
  return /shopee\.vn|shope\.ee|s\.shopee\.vn/i.test(url);
}

/**
 * Phân tích và trích xuất dữ liệu sản phẩm từ Shopee
 */
export async function extractShopeeProduct(url: string): Promise<ShopeeProductData | null> {
  try {
    let targetUrl = url;

    // 1. Nếu là shortlink (shope.ee hoặc s.shopee.vn), resolve URL đích
    if (/shope\.ee|s\.shopee\.vn/i.test(url)) {
      try {
        const headRes = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          },
        });
        targetUrl = headRes.url;
      } catch (err) {
        console.warn('Không thể resolve shortlink Shopee:', err);
      }
    }

    // 2. Trích xuất shopid và itemid từ URL
    // Format thường gặp: ...-i.12345678.987654321 hoặc /product/12345678/987654321
    const match = targetUrl.match(/i\.(\d+)\.(\d+)/) || targetUrl.match(/\/product\/(\d+)\/(\d+)/);
    if (!match) {
      console.warn('Không tìm thấy Shop ID và Item ID từ URL Shopee:', targetUrl);
      return null;
    }

    const shopId = match[1];
    const itemId = match[2];

    // 3. Gọi API nội bộ của Shopee
    const apiUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': targetUrl,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!apiRes.ok) {
      console.warn(`Shopee API trả về mã lỗi: ${apiRes.status}`);
      return null;
    }

    const json = await apiRes.json();
    const data = json.data;
    if (!data) {
      console.warn('Shopee API không trả về dữ liệu data hợp lệ:', json);
      return null;
    }

    // 4. Chuẩn hóa giá và ảnh (Shopee scale giá nhân 100.000)
    const rawPrice = data.price || data.price_min || 0;
    const price = rawPrice > 0 ? Math.round(rawPrice / 100000) : 0;
    const priceMin = data.price_min ? Math.round(data.price_min / 100000) : price;
    const priceMax = data.price_max ? Math.round(data.price_max / 100000) : price;

    // Shopee CDN: https://down-vn.img.susercontent.com/file/${hash}
    const rawImages: string[] = Array.isArray(data.images) ? data.images : [];
    const images = rawImages.map((hash: string) => `https://down-vn.img.susercontent.com/file/${hash}`);
    const mainImage = images[0] || (data.image ? `https://down-vn.img.susercontent.com/file/${data.image}` : undefined);

    return {
      name: data.name || '',
      description: data.description || '',
      price,
      priceMin,
      priceMax,
      currency: 'VND',
      images,
      mainImage,
      location: data.shop_location || 'Shopee Việt Nam',
      brandName: data.brand && data.brand !== 'No Brand' ? data.brand : 'Shop Cổ Phục Shopee',
      url: targetUrl,
    };
  } catch (err) {
    console.error('Lỗi khi extract Shopee product:', err);
    return null;
  }
}
