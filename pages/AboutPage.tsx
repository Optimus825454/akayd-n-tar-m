
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { AboutPageContent, SEOSettings, PageSEO } from '../types';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface AboutPageProps {
  content: AboutPageContent;
  seoSettings?: SEOSettings | null;
}

const AboutPage: React.FC<AboutPageProps> = ({ content, seoSettings }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

  // SEO verilerini yükle
  useEffect(() => {
    const loadPageSEO = async () => {
      try {
        const data = await seoAPI.getPageSEO('/hakkimizda');
        setPageSEO(data);
      } catch (error) {
        // SEO verileri yüklenemedi
      }
    };
    loadPageSEO();
  }, []);

  // Görseller varsa slider otomatik geçişi
  useEffect(() => {
    if (content.images && content.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === content.images!.length - 1 ? 0 : prev + 1
        );
      }, 4000); // 4 saniyede bir değiş

      return () => clearInterval(interval);
    }
  }, [content.images]);

  // Görseller için fallback
  const images = content.images && content.images.length > 0
    ? content.images
    : ['https://picsum.photos/800/600?random=30'];

  return (
    <>
      <SEOHead
        seoSettings={seoSettings || undefined}
        pageSEO={pageSEO || undefined}
        pageTitle="Hakkımızda"
        pageDescription="Akaydın Tarım olarak modern teknolojilerle kaliteli fındık üretimi yapıyoruz. Misyonumuz, vizyonumuz ve değerlerimizi keşfedin."
        pageKeywords="hakkımızda, akaydın tarım, misyon, vizyon, fındık üretimi, tarım, hendek, sakarya"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-400 opacity-20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400 to-blue-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold ">
                <span className="block">{content.title || 'Toprağın Gücü'}</span>
                <span className="block text-yellow-300">Teknolojinin Aklı</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-medium">
                {content.content || 'Akaydın Tarım'}
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Misyonumuz</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {content.mission}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-xl">🚀</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Vizyonumuz</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {content.vision}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                  {/* Image Slider */}
                  <div className="relative w-full h-[500px] overflow-hidden">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${index === currentImageIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                          }`}
                        src={image}
                        alt={`Akaydın Tarım ${index + 1}`}
                      />
                    ))}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Slider Controls */}
                    {images.length > 1 && (
                      <>
                        {/* Previous Button */}
                        <button
                          onClick={() => setCurrentImageIndex(
                            currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
                          )}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Next Button */}
                        <button
                          onClick={() => setCurrentImageIndex(
                            currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
                          )}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white/50 hover:bg-white/70'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <h4 className="text-xl font-bold mb-2">Akaydın Tarım </h4>
                    <p className="text-sm opacity-90">Hendek'te tarımın geleceğini şekillendiriyoruz.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-5 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center pb-5 ">

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Her kararımıza ve hizmetimize rehberlik eden temel<span className="text-blue-600"> değerlerimiz</span>
              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-t-4 border-blue-500">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🏆</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Kalite</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Sunduğumuz her ürün ve hizmette en yüksek kalite standartlarını hedefleriz.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-t-4 border-green-500">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🤝</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Güven</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Çiftçilerimiz ve iş ortaklarımızla şeffaf ve güvene dayalı ilişkiler kurarız.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-t-4 border-purple-500">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Yenilikçilik</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Sektördeki en son gelişmeleri takip eder ve sürekli olarak kendimizi yenileriz.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">15+</div>
                  <div className="text-blue-100">Yıllık Deneyim</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
                  <div className="text-blue-100">Mutlu Müşteri</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
                  <div className="text-blue-100">Farklı Ürün</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">7/24</div>
                  <div className="text-blue-100">Destek Hizmeti</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Bizimle Çalışmaya Hazır mısınız?
              </h3>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Tarımsal projelerinizde size nasıl yardımcı olabileceğimizi konuşalım.
                Deneyimli ekibimiz sizin için en uygun çözümleri geliştirmeye hazır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/iletisim"
                  className="group bg-white hover:bg-gray-100 text-indigo-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Hemen Konuşalım
                  </span>
                </Link>
                <Link
                  to="/hizmetlerimiz"
                  className="group border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Hizmetlerimizi Gör
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;