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
  
  // 获取当前域名协议
  const url = new URL(request.url);
  const imageUrl = `${url.origin}/${data.folder}/${randomFile}`;

  try {
    // 内部 Fetch 获取图片流
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Fetch failed');
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.redirect(imageUrl);
  }
}