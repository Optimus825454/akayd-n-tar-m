
import React, { useState, useEffect } from 'react';
import type { BlogPost, SEOSettings, PageSEO } from '../types';
import BlogPostCard from '../components/BlogPostCard';
import SEOHead from '../components/SEOHead';
import { blogAPI, seoAPI } from '../services/api';

interface BlogPageProps {
  blogPosts: BlogPost[];
  seoSettings?: SEOSettings | null;
}

const BlogPage: React.FC<BlogPageProps> = ({ blogPosts, seoSettings }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

  // SEO verilerini yükle
  useEffect(() => {
    const loadPageSEO = async () => {
      try {
        const data = await seoAPI.getPageSEO('/blog');
        setPageSEO(data);
      } catch (error) {
        // SEO verileri yüklenemedi
      }
    };
    loadPageSEO();
  }, []);

  const handleReadMore = async (post: BlogPost) => {
    try {
      // Görüntülenme sayacını artır
      await blogAPI.incrementView(Number(post.id));
      setSelectedPost(post);
    } catch (error) {
      // Hata olsa bile modal'ı aç
      setSelectedPost(post);
    }
  };

  return (
    <>
      <SEOHead
        seoSettings={seoSettings || undefined}
        pageSEO={pageSEO || undefined}
        pageTitle="Blog"
        pageDescription="Akaydın Tarım blog sayfasında tarım, fındık üretimi ve organik tarım hakkındaki güncel yazılarımızı okuyun."
        pageKeywords="blog, tarım blog, fındık blog, organik tarım yazıları, tarım haberleri, hendek tarım"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-400 opacity-20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-400 to-green-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">
              <h2 className="text-lg font-semibold text-green-100 tracking-wide uppercase mb-4">📝 Blog</h2>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="block">Bilgi ve Deneyim</span>
                <span className="block text-yellow-300">Paylaşımları</span>
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed">
                Fındık ve tarım dünyasındaki son gelişmeler, ipuçları ve uzman görüşleri
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {blogPosts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onReadMore={() => handleReadMore(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz blog yazısı bulunmuyor</h3>
                <p className="text-gray-600 text-lg">
                  Yakında fındık ve tarım dünyasından güncel içeriklerle buradayız!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Blog Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500 flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedPost.date}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {selectedPost.author}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Image */}
                <div className="mb-6">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {selectedPost.title}
                </h1>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Özet</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedPost.summary}
                  </p>
                </div>

                {/* Content */}
                {selectedPost.content && (
                  <div className="prose prose-lg max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Detaylı İçerik</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedPost.content}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl border-t border-gray-200 p-6">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </>
  );
};

export default BlogPage;
