'use client';

import imageMapData from '@/data/imageMap.json';
import { useState, useEffect, useRef } from 'react';
import ImageModal from './components/ImageModal';

type ImageMap = {
  [key: string]: {
    folder: string;
    files: string[];
  };
};

const imageMap = imageMapData as ImageMap;

// 懒加载图片组件
function LazyImage({ src, alt, index }: { src: string; alt: string; index: number }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative w-full h-full bg-gray-200">
      {!isLoaded && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          height="100%" 
          viewBox="0 0 280 250"
          className="absolute inset-0"
        >
          <rect width="280" height="250" fill="#e0e0e0"/>
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontFamily="Arial, sans-serif" 
            fontSize="16" 
            fill="#9e9e9e"
          >
            Loading...
          </text>
        </svg>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

export default function Home() {
  const categories = Object.entries(imageMap);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    category: string;
    index: number;
  } | null>(null);

  // 获取当前分类的所有图片
  const getCurrentCategoryImages = () => {
    if (!selectedImage) return [];
    const category = categories.find(([key]) => key === selectedImage.category);
    return category ? category[1].files : [];
  };

  // 导航到下一张图片
  const handleNext = () => {
    if (!selectedImage) return;
    const images = getCurrentCategoryImages();
    const nextIndex = (selectedImage.index + 1) % images.length;
    const category = categories.find(([key]) => key === selectedImage.category);
    if (category) {
      setSelectedImage({
        url: `/${category[1].folder}/${images[nextIndex]}`,
        category: selectedImage.category,
        index: nextIndex,
      });
    }
  };

  // 导航到上一张图片
  const handlePrev = () => {
    if (!selectedImage) return;
    const images = getCurrentCategoryImages();
    const prevIndex = (selectedImage.index - 1 + images.length) % images.length;
    const category = categories.find(([key]) => key === selectedImage.category);
    if (category) {
      setSelectedImage({
        url: `/${category[1].folder}/${images[prevIndex]}`,
        category: selectedImage.category,
        index: prevIndex,
      });
    }
  };

  // 切换分类选择
  const toggleCategory = (categoryKey: string) => {
    setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部固定导航栏 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between h-16 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">
              Image Gallery
            </h1>
            <div className="text-sm text-gray-500">
              {categories.length} 个分类 · {categories.reduce((sum, [_, data]) => sum + data.files.length, 0)} 张图片
            </div>
          </div>
          
          {/* 分类导航标签 */}
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map(([key, data]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={`
                  px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap 
                  transition-all duration-200 flex-shrink-0 category-btn
                  ${selectedCategory === key
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }
                `}
              >
                <span className="capitalize">{key}</span>
                <span className="ml-2 text-xs opacity-75">({data.files.length})</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        {categories.map(([key, data]) => {
          // 只显示选中的分类
          if (selectedCategory !== key) return null;
          
          return (
            <section 
              key={key} 
              id={`category-${key}`}
              className="animate-fadeIn"
            >
              {/* 分类标题 */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 capitalize">
                  {key} 图片集
                </h2>
                <p className="text-gray-500 mt-2">
                  共 {data.files.length} 张图片
                </p>
              </div>

              {/* 图片网格 - 自适应布局，每行最多4张 */}
              <div 
                className="gap-4"
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}
              >
                {data.files.map((file, index) => (
                  <div 
                    key={file}
                    className="group relative w-full overflow-hidden rounded-xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    style={{ height: '300px' }}
                    onClick={() => setSelectedImage({
                      url: `/${data.folder}/${file}`,
                      category: key,
                      index: index,
                    })}
                  >
                    <LazyImage
                      src={`/${data.folder}/${file}`}
                      alt={`图片 ${index + 1}`}
                      index={index}
                    />
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    {/* 图片序号 */}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1} / {data.files.length}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        
        {/* 如果没有选中分类，显示欢迎界面 */}
        {!selectedCategory && (
          <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                欢迎来到图片画廊
              </h2>
              <p className="text-gray-500 mb-6">
                请从上方导航栏选择一个分类开始浏览精美图片
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.slice(0, 3).map(([key]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    浏览 {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 图片模态框 */}
      <ImageModal
        isOpen={selectedImage !== null}
        imageUrl={selectedImage?.url || ''}
        onClose={() => setSelectedImage(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
}