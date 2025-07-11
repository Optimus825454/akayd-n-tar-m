
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Service, SEOSettings, PageSEO } from '../types';
import ServiceCard from '../components/ServiceCard';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface ServicesPageProps {
  services: Service[];
  seoSettings?: SEOSettings | null;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ services, seoSettings }) => {
  const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

  // SEO verilerini yükle
  useEffect(() => {
    const loadPageSEO = async () => {
      try {
        const data = await seoAPI.getPageSEO('/hizmetlerimiz');
        setPageSEO(data);
      } catch (error) {
        // SEO verileri yüklenemedi
      }
    };
    loadPageSEO();
  }, []);

  return (
    <>
      <SEOHead
        seoSettings={seoSettings || undefined}
        pageSEO={pageSEO || undefined}
        pageTitle="Hizmetlerimiz"
        pageDescription="Akaydın Tarım olarak sunduğumuz profesyonel tarım danışmanlığı, fındık üretimi ve modern tarım hizmetlerini keşfedin."
        pageKeywords="hizmetlerimiz, tarım danışmanlığı, fındık üretimi, modern tarım, organik tarım, hendek, sakarya"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <section className="relative py-10 lg:py-16 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-400 opacity-20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-400 to-green-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="block">Size Nasıl</span>
                <span className="block text-yellow-300">Yardımcı Olabiliriz?</span>
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed font-medium mb-8">
                Topraktan sofraya, fındık üretiminin her aşamasında profesyonel çözümler sunuyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/iletisim"
                  className="group bg-yellow-400 hover:bg-yellow-300 text-green-900 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hemen İletişime Geçin
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                <span className="mr-2 text-lg">⚡</span>
                TÜM HİZMETLERİMİZ
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Kapsamlı <span className="text-green-600">Tarım Çözümleri</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Modern teknoloji ve deneyimli ekibimizle, fındık üretiminin her aşamasında yanınızdayız.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mb-16">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="transform hover:scale-105 transition-all duration-500 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Özel Bir Hizmet mi Arıyorsunuz?
              </h3>
              <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
                İhtiyaçlarınıza özel çözümler geliştirebiliriz. Bizimle iletişime geçin ve projelerinizi birlikte planlayalım.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/iletisim"
                  className="group bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Projemi Konuşalım
                  </span>
                </Link>
                <Link
                  to="/hakkimizda"
                  className="group border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hakkımızda Bilgi Al
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Add CSS animations */}
        <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    </>
  );
};

export default ServicesPage;
