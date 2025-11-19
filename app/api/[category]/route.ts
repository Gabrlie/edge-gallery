import { NextResponse } from 'next/server';
// 如果 @ 别名报错，请尝试使用相对路径: import imageMapData from '../../../../data/imageMap.json';
import imageMapData from '@/data/imageMap.json';

type ImageMap = {
  [key: string]: {
    folder: string;
    files: string[];
  };
};

const imageMap = imageMapData as ImageMap;

export const dynamic = 'force-dynamic'; // 必须强制动态，否则不随机

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const key = category.toLowerCase();
  const data = imageMap[key];

  if (!data) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const files = data.files;
  const randomFile = files[Math.floor(Math.random() * files.length)];
  
  // 使用相对路径，不包含域名
  const imagePath = `/${data.folder}/${randomFile}`;

  try {
    // 获取请求的 origin，确保使用正确的域名
    const url = new URL(request.url);
    const imageUrl = new URL(imagePath, url.origin).href;
    
    // 内部 Fetch 获取图片流
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Fetch failed');
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/webp';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // 重定向到相对路径，而不是绝对 URL
    return NextResponse.redirect(new URL(imagePath, request.url));
  }
}