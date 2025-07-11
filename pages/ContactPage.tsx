
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ContactPageContent, SEOSettings, PageSEO } from '../types';
import SEOHead from '../components/SEOHead';
import { contactMessagesAPI, seoAPI } from '../services/api';

interface ContactPageProps {
  content: ContactPageContent;
  seoSettings?: SEOSettings | null;
}

const ContactPage: React.FC<ContactPageProps> = ({ content, seoSettings }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

  // SEO verilerini yükle
  useEffect(() => {
    const loadPageSEO = async () => {
      try {
        const data = await seoAPI.getPageSEO('/iletisim');
        setPageSEO(data);
      } catch (error) {
        // SEO verileri yüklenemedi
      }
    };
    loadPageSEO();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const messageData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string || undefined,
      message: formData.get('message') as string,
    };

    try {
      await contactMessagesAPI.create(messageData);
      setSubmitted(true);
      // Form'u temizle
      e.currentTarget.reset();
    } catch (error) {
      setError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        seoSettings={seoSettings || undefined}
        pageSEO={pageSEO || undefined}
        pageTitle="İletişim"
        pageDescription="Akaydın Tarım ile iletişime geçin. Adres, telefon, e-posta bilgilerimiz ve iletişim formu."
        pageKeywords="iletişim, adres, telefon, e-posta, mesaj gönder, akaydın tarım iletişim, hendek tarım"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <section className="relative py-10 lg:py-16 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-96 h-50 bg-gradient-to-br from-emerald-400 to-green-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-teal-400 to-emerald-400 opacity-20 rounded-full filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="block">Bize</span>
                <span className="block text-yellow-300">Ulaşın</span>
              </h1>
              <p className="text-xl md:text-2xl text-emerald-100 max-w-4xl mx-auto leading-relaxed font-medium">
                Sorularınız, önerileriniz veya işbirliği talepleriniz için bizimle iletişime geçmekten çekinmeyin.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form or Success Message */}
              {submitted ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl text-white">✅</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Teşekkürler!</h3>
                  <p className="text-lg text-gray-700 mb-8">
                    Mesajınız başarıyla gönderildi. En kısa sürede size geri döneceğiz.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors duration-300"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-xl">✉️</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Mesaj Gönderin</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Adınız Soyadınız *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-300"
                          placeholder="Adınızı ve soyadınızı girin"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          E-posta Adresiniz *
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-300"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon Numaranız
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-300"
                        placeholder="0555 123 45 67"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Konu
                      </label>
                      <select
                        name="subject"
                        id="subject"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-300"
                      >
                        <option value="">Konu seçin</option>
                        <option value="findik-isleme">Fındık İşleme Hizmeti</option>
                        <option value="urun-bilgi">Ürün Bilgileri</option>
                        <option value="hizmet-talep">Hizmet Talebi</option>
                        <option value="genel">Genel Bilgi</option>
                        <option value="diger">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Mesajınız *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-300 resize-none"
                        placeholder="Mesajınızı buraya yazın..."
                      ></textarea>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <span className="flex items-center justify-center">
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              Mesajı Gönder
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Contact Info & Map */}
              <div className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📍</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">İletişim Bilgilerimiz</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">📍</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Adres</h4>
                        <p className="text-gray-600">{content.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">📞</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Telefon</h4>
                        <p className="text-gray-600">{content.phone}</p>
                        <p className="text-sm text-gray-500 mt-1">7/24 Arayabilirsiniz</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">✉️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">E-posta</h4>
                        <p className="text-gray-600">{content.email}</p>
                        <p className="text-sm text-gray-500 mt-1">24 saat içinde yanıtlıyoruz</p>
                      </div>
                    </div>

                    {content.whatsapp_phone && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">📱</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">WhatsApp Sipariş Hattı</h4>
                          <a
                            href={`https://wa.me/${content.whatsapp_phone.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            {content.whatsapp_phone}
                          </a>
                          <p className="text-sm text-gray-500 mt-1">Hızlı sipariş için WhatsApp</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">⏰</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Çalışma Saatleri</h4>
                        {content.working_hours ? (
                          <p className="text-gray-600">{content.working_hours}</p>
                        ) : (
                          <>
                            <p className="text-gray-600">Pazartesi - Cumartesi: 08:00 - 18:00</p>
                            <p className="text-gray-600">Pazar: 09:00 - 15:00</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sosyal Medya Bölümü */}
                    {(content.facebook_url || content.instagram_url || content.twitter_url || content.linkedin_url || content.youtube_url) && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">🌐</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-3">Sosyal Medya</h4>
                          <div className="flex flex-wrap gap-3">
                            {content.facebook_url && (
                              <a
                                href={content.facebook_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <span>📘</span>
                                <span>Facebook</span>
                              </a>
                            )}
                            {content.instagram_url && (
                              <a
                                href={content.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors text-sm"
                              >
                                <span>📷</span>
                                <span>Instagram</span>
                              </a>
                            )}
                            {content.twitter_url && (
                              <a
                                href={content.twitter_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 bg-blue-400 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition-colors text-sm"
                              >
                                <span>🐦</span>
                                <span>Twitter</span>
                              </a>
                            )}
                            {content.linkedin_url && (
                              <a
                                href={content.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                              >
                                <span>💼</span>
                                <span>LinkedIn</span>
                              </a>
                            )}
                            {content.youtube_url && (
                              <a
                                href={content.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <span>🎥</span>
                                <span>YouTube</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-500">
                    <h4 className="text-xl font-bold text-white">📍 Konumumuz</h4>
                    <p className="text-emerald-100">{content.address}</p>
                  </div>
                  <div className="h-80">
                    {content.map_embed ? (
                      <div dangerouslySetInnerHTML={{ __html: content.map_embed }} className="w-full h-full" />
                    ) : (
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1510.27850536581!2d30.74360289255156!3d40.793752100200535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x409d8f614e52c30d%3A0x25ed3a760cc228ca!2zQWtheWTEsW4gdGFyxLFt!5e0!3m2!1str!2str!4v1752202785920!5m2!1str!2str"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Akaydın Tarım - Başpınar Mahallesi, Hendek/Sakarya">
                      </iframe>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Hemen Aramak İster misiniz?
              </h3>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                Acil sorularınız için direkt telefon ile arayabilirsiniz.
                Uzman ekibimiz size hemen yardımcı olmaya hazır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`tel:${content.phone}`}
                  className="group bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hemen Ara: {content.phone}
                  </span>
                </a>

                {content.whatsapp_phone && (
                  <a
                    href={`https://wa.me/${content.whatsapp_phone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="mr-3 w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487" />
                      </svg>
                      WhatsApp: {content.whatsapp_phone}
                    </span>
                  </a>
                )}
                <Link
                  to="/hizmetlerimiz"
                  className="group border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

export default ContactPage;