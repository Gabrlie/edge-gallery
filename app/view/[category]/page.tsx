'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import imageMapData from '@/data/imageMap.json';

type ImageMap = { [key: string]: { folder: string; files: string[] } };
const imageMap = imageMapData as ImageMap;

export default function ViewPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const data = imageMap[category.toLowerCase()];

  const randomize = () => {
    if (!data) return;
    setIsLoading(true);
    const files = data.files;
    const randomFile = files[Math.floor(Math.random() * files.length)];
    
    const img = new Image();
    const src = `/${data.folder}/${randomFile}`;
    img.src = src;
    img.onload = () => {
      setCurrentUrl(src);
      setIsLoading(false);
    };
  };

  useEffect(() => {
    if (!data) {
      router.replace('/');
    } else {
      randomize();
    }
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null;

  return (
    <div onClick={randomize} className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110" style={{ backgroundImage: currentUrl ? `url(${currentUrl})` : 'none' }} />

      {isLoading && <div className="absolute z-20 text-white/50 text-xs animate-pulse">LOADING...</div>}

      <img 
        src={currentUrl} 
        className={`relative z-10 max-w-[95vw] max-h-[90vh] object-contain rounded shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />

      <button 
        onClick={(e) => { e.stopPropagation(); router.push('/'); }}
        className="absolute top-6 left-6 z-30 px-4 py-2 bg-black/40 text-white rounded-full text-sm backdrop-blur border border-white/10"
      >
        Back
      </button>
    </div>
  );
}