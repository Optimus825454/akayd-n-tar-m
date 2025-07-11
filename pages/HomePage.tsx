import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Service, Product, HeroContent, ContactPageContent, SEOSettings, PageSEO } from '../types';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import HazelnutPriceTicker from '../components/HazelnutPriceTicker';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface HomePageProps {
    services: Service[];
    products: Product[];
    heroContents: HeroContent[];
    contactContent: ContactPageContent;
    seoSettings?: SEOSettings | null;
}

const HomePage: React.FC<HomePageProps> = ({ services, products, heroContents, contactContent, seoSettings }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

    // SEO verilerini yükle
    useEffect(() => {
        const loadPageSEO = async () => {
            try {
                const data = await seoAPI.getPageSEO('/');
                setPageSEO(data);
            } catch (error) {
                // SEO verileri yüklenemedi
            }
        };
        loadPageSEO();
    }, []);

    // Hero içeriğini veritabanından al, yoksa varsayılan içeriği kullan
    const defaultHeroContent = [
        {
            id: "1",
            title: "Fındık Üretiminizi",
            subtitle: "Bir Sonraki Seviyeye Taşıyın",
            description: "Modern tarım teknikleri ve uzman danışmanlık hizmetleriyle verimliliğinizi artırın.",
            cta: "Hemen Başlayın",
            backgroundGradient: "from-green-600 via-green-700 to-blue-800",
            backgroundImage: "",
            isActive: true,
            order: 1
        },
        {
            id: "2",
            title: "Organomineral Gübreler ile",
            subtitle: "Doğal ve Verimli Üretim",
            description: "Çevre dostu gübre çözümlerimizle hem toprağınızı hem de ürününüzü koruyun.",
            cta: "Ürünlerimizi Keşfedin",
            backgroundGradient: "from-blue-600 via-purple-700 to-green-800",
            backgroundImage: "",
            isActive: true,
            order: 2
        },
        {
            id: "3",
            title: "Uzman Danışmanlık ile",
            subtitle: "Bilinçli Tarım Yapın",
            description: "Tarım mühendisleri ve uzmanlarımızdan 7/24 profesyonel destek alın.",
            cta: "Uzmanlarla Konuşun",
            backgroundGradient: "from-purple-600 via-blue-700 to-green-800",
            backgroundImage: "",
            isActive: true,
            order: 3
        }
    ];

    // Aktif hero içeriklerini sıraya göre getir
    const activeHeroContents = heroContents && heroContents.length > 0
        ? heroContents.filter(h => h.isActive).sort((a, b) => a.order - b.order)
        : defaultHeroContent;

    useEffect(() => {
        setIsVisible(true);

        // Auto-slide for hero content
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % activeHeroContents.length);
        }, 5000);

        return () => {
            clearInterval(slideInterval);
        };
    }, [activeHeroContents.length]);

    const currentContent = activeHeroContents[currentSlide];

    // Neden biz seçilmeliyiz bölümü
    const whyChooseUs = [
        {
            icon: "🎯",
            title: "Hedef Odaklı Çözümler",
            description: "Her üreticinin kendine özgü ihtiyaçlarına yönelik kişiselleştirilmiş çözümler sunuyoruz."
        },
        {
            icon: "🔬",
            title: "Bilimsel Yaklaşım",
            description: "Tarım mühendisleri ve uzmanlarımızla bilimsel veriler ışığında danışmanlık hizmeti veriyoruz."
        },
        {
            icon: "🚀",
            title: "Yenilikçi Teknolojiler",
            description: "En son tarım teknolojilerini takip ederek üreticilerimize en güncel çözümleri sunuyoruz."
        },
        {
            icon: "🏆",
            title: "Kanıtlanmış Başarı",
            description: "25 yıllık deneyimimiz ve binlerce memnun müşterimizle sektörde güvenilir bir marka olduk."
        },
        {
            icon: "🌿",
            title: "Sürdürülebilir Tarım",
            description: "Çevre dostu ve sürdürülebilir tarım uygulamaları ile gelecek nesillere yaşanabilir bir dünya bırakıyoruz."
        },
        {
            icon: "📞",
            title: "7/24 Destek",
            description: "Üreticilerimize kesintisiz teknik destek ve danışmanlık hizmeti sunuyoruz."
        }
    ];

    return (
        <>
            <SEOHead
                seoSettings={seoSettings || undefined}
                pageSEO={pageSEO || undefined}
                pageTitle="Ana Sayfa"
                pageDescription="Hendek/Sakarya'da kaliteli fındık üretimi. Organik tarım ürünleri ve güncel fındık fiyatları."
                pageKeywords="ana sayfa, fındık, tarım, hendek, sakarya, organik fındık, fındık fiyatları"
            />
            <div className="min-h-screen">
                {/* Advanced Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Image/Gradient */}
                    <div className="absolute inset-0">
                        {currentContent.backgroundImage ? (
                            <>
                                <img
                                    src={currentContent.backgroundImage}
                                    alt="Hero Background"
                                    className="w-full h-full object-cover transition-opacity duration-1000"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                            </>
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentContent.backgroundGradient} transition-all duration-1000`}></div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>

                    {/* Animated Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white bg-opacity-10 rounded-full blur-3xl animate-float"></div>
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white bg-opacity-10 rounded-full blur-3xl animate-float-delayed"></div>
                        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-300 bg-opacity-20 rounded-full blur-2xl animate-pulse"></div>
                    </div>

                    {/* Hero Content */}
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-6xl mx-auto">


                            {/* Dynamic Titles */}
                            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                                {currentContent.title}
                                <span className="block text-yellow-300 mt-2 text-3xl md:text-5xl lg:text-6xl">
                                    {currentContent.subtitle}
                                </span>
                            </h1>

                            <p className={`text-xl md:text-2xl text-gray-100 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                                {currentContent.description}
                            </p>

                            {/* CTA Buttons */}
                            <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                                <Link
                                    to="/iletisim"
                                    className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold shadow-2xl overflow-hidden"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        {currentContent.cta}
                                    </span>
                                </Link>

                                <Link
                                    to="/hizmetlerimiz"
                                    className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-bold backdrop-blur-sm"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Hizmetleri Keşfedin
                                    </span>
                                </Link>
                            </div>

                            {/* Slide indicators */}
                            <div className="flex justify-center mt-16 space-x-3">
                                {activeHeroContents.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
                                            ? 'bg-yellow-400 scale-125'
                                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-white bg-opacity-70 rounded-full mt-2 animate-ping"></div>
                        </div>
                    </div>
                </section>



                {/* Info Widgets Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">


                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Price Ticker */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">📈</span>
                                    Güncel Fındık Fiyatları
                                </h3>
                                <HazelnutPriceTicker />

                                {/* Önemli Uyarı */}
                                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-orange-800">Önemli Uyarı</h4>
                                            <div className="mt-2 text-sm text-orange-700">
                                                <p>
                                                    Listelenen fiyatlar çeşitli kaynaklardan derlenen genel piyasa fiyatlandır.
                                                    Tüccar alımlarında stopaj, borsa tescili gibi kesintiler nedeniyle fiyatlar
                                                    değişiklik gösterebilir. Özellikle sezon dönemlerinde fiyatlar günlük
                                                    değişebildiği için <strong>mutlaka firmamızdan güncel fiyat talep ediniz</strong>. Bu
                                                    fiyatların herhangi bir bağlayıcılığı yoktur, tamamen bilgilendirme amaçlıdır.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weather Radar - Genişletilmiş */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🌧️</span>
                                    Hendek Hava Durumu Radarı
                                </h3>

                                {/* Windy.com Hendek Radar Embed - Genişletilmiş */}
                                <div className="relative h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-inner border border-gray-200">
                                    <iframe
                                        src="https://embed.windy.com/embed2.html?lat=40.8&lon=30.8&detailLat=40.8&detailLon=30.8&width=850&height=600&zoom=10&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
                                        className="w-full h-full border-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        title="Hendek Hava Radarı"
                                    ></iframe>
                                </div>

                                {/* Kullanım Açıklaması */}
                                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Nasıl Kullanılır?
                                    </h4>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• <strong>Yağış:</strong> Mavi-yeşil alanlar yağış gösterir</li>
                                        <li>• <strong>Zaman:</strong> Alt çubuktan gelecek saatleri görün</li>
                                        <li>• <strong>Yakınlaştırma:</strong> Mouse ile haritayı büyütebilirsiniz</li>
                                        <li>• <strong>Katmanlar:</strong> Sağ üstten rüzgar, sıcaklık seçebilirsiniz</li>
                                    </ul>
                                    <div className="mt-2 text-xs text-blue-600">
                                        <span className="font-medium">💡 İpucu:</span> Fındık hasadı öncesi hava durumunu takip edin!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Neden Akaydın Tarım?
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Modern, Teknolojik, Yenilikçi yaklaşımımızla bugüne kadar doğru bilinen yanlışları düzeltiyor Tecrübemiz ve Dinamik yapımızla üretiminizi yeni bir aşamaya taşıyoruz.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {whyChooseUs.map((item, index) => (
                                <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50">
                                    <div className="text-5xl mb-6">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Fındık İşleme Hizmetleri - Özel Bölüm */}
                <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200 to-orange-200 opacity-20 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-yellow-200 to-amber-200 opacity-20 rounded-full filter blur-3xl"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                                <span className="mr-2 text-lg">🏆</span>
                                HENDEK'TE İLK DEFA!
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                <span className="text-amber-600">Fındık İşleme</span> Hizmetleri
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
                                Hendek'te ilk defa <span className="text-amber-600 font-bold">Akaydın Tarım</span> tarafından sunulan
                                <span className="text-orange-600 font-bold"> ev kullanımı için özel fındık işleme hizmeti!</span>
                            </p>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
                                Özellikle evleriniz için ayırdığınız değerli fındıklarınız artık çürümeyecek, tadı bozulmayacak!
                            </p>
                        </div>

                        {/* İşleme Aşamaları */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            {/* Kırma */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-amber-200">
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-3xl text-white">🔨</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fındık Kırma</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Son teknoloji makinelerimizle fındıklarınızı özenle kırıyor, kaliteyi koruyoruz.
                                </p>
                                <div className="mt-6 bg-amber-50 rounded-lg p-4">
                                    <span className="text-amber-800 font-semibold">✓ Hasarsız Kırma</span>
                                </div>
                            </div>

                            {/* Kavurma */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-orange-200">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-3xl text-white">🔥</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Kavurma</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Profesyonel kavurma ile fındığın lezzetini artırıyor, hem hediyelik hem ev kullanımı için hazırlıyoruz.
                                </p>
                                <div className="mt-6 bg-orange-50 rounded-lg p-4">
                                    <span className="text-orange-800 font-semibold">✓ Lezzet Artışı</span>
                                </div>
                            </div>

                            {/* Vakumlama */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-blue-200">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-3xl text-white">📦</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Vakumlu Paketleme</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Vakumlu paketleme ile raf ömrünü uzatıyor, çürümeyi %100 engelliyoruz.
                                </p>
                                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                    <span className="text-blue-800 font-semibold">✓ Uzun Raf Ömrü</span>
                                </div>
                            </div>

                            {/* Koruma */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-green-200">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-3xl text-white">🛡️</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Kalite Koruma</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Kabuklu bekletilirse çürüyebilecek fındıklarınızın kalitesini ve değerini koruyoruz.
                                </p>
                                <div className="mt-6 bg-green-50 rounded-lg p-4">
                                    <span className="text-green-800 font-semibold">✓ Değer Koruması</span>
                                </div>
                            </div>
                        </div>

                        {/* Özellikler ve Avantajlar */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-16">
                            <div className="text-center mb-12">
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    Neden <span className="text-amber-600">Akaydın Tarım</span> Fındık İşleme?
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">1</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Hendek'te İlk ve Tek</h4>
                                        <p className="text-gray-600">Ev kullanımı için fındık işleme hizmeti sunan ilk ve tek firma</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Son Teknoloji</h4>
                                        <p className="text-gray-600">Modern makineler ile hijyenik ve kaliteli işleme</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Değer Koruma</h4>
                                        <p className="text-gray-600">Her geçen gün artan fındık değerini koruyoruz</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">4</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Çok Amaçlı</h4>
                                        <p className="text-gray-600">Hem hediyelik hem de ev kullanımı için ideal</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">5</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Uzun Ömür</h4>
                                        <p className="text-gray-600">Vakumlu paketleme ile aylarca taze kalır</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">6</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Çürüme Engeli</h4>
                                        <p className="text-gray-600">Kabuklu bekletme riskini tamamen ortadan kaldırıyoruz</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Çağrı Butonu */}
                        <div className="text-center">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    Fındıklarınızı Bize Emanet Edin!
                                </h3>
                                <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
                                    Evleriniz için ayırdığınız değerli fındıklarınızı profesyonel işleme hizmetimizle
                                    daha uzun süre, daha lezzetli şekilde saklayın.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/iletisim"
                                        className="bg-white text-amber-600 px-8 py-4 rounded-xl text-lg font-bold shadow-xl"
                                    >
                                        <span className="flex items-center justify-center">
                                            <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Hemen Bilgi Alın
                                        </span>
                                    </Link>
                                    <Link
                                        to="/hizmetlerimiz"
                                        className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-bold"
                                    >
                                        <span className="flex items-center justify-center">
                                            <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Detaylı Bilgi
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Diğer Hizmetlerimiz
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Fındık üretiminin her aşamasında yanınızdayız.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {services.slice(0, 6).map(service => (
                                <div key={service.id}>
                                    <ServiceCard service={service} />
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link
                                to="/hizmetlerimiz"
                                className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl"
                            >
                                <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Tüm Hizmetleri Görüntüle
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Products Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Öne Çıkan Ürünlerimiz
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Kaliteli organomineral gübreler ve bitki besleme ürünleriyle verimliliğinizi artırın.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            {products.filter(p => p.isFeatured).slice(0, 4).map(product => (
                                <div key={product.id}>
                                    <ProductCard
                                        product={product}
                                        contactPhone={contactContent.phone.replace(/[^\d]/g, '')}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Eğer öne çıkan ürün yoksa */}
                        {products.filter(p => p.isFeatured).length === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                                {products.slice(0, 4).map(product => (
                                    <div key={product.id}>
                                        <ProductCard
                                            product={product}
                                            contactPhone={contactContent.phone.replace(/[^\d]/g, '')}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-center">
                            <Link
                                to="/urunler"
                                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl"
                            >
                                <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Tüm Ürünleri Görüntüle
                            </Link>
                        </div>
                    </div>
                </section>



                {/* Final CTA Section */}
                <section className="py-20 bg-gradient-to-br from-green-700 via-green-800 to-blue-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
                                Fındık Üretiminde
                                <span className="block text-yellow-300 mt-2">Verimliliğinizi Artırmaya</span>
                                <span className="block mt-2">Hazır mısınız?</span>
                            </h2>

                            <p className="text-xl md:text-2xl text-green-100 mb-12 leading-relaxed">
                                Akaydın Tarım uzmanları, modern tarım çözümleriyle fındık üretiminizi
                                <span className="font-bold text-yellow-300"> bir üst seviyeye taşımak</span> için yanınızda.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link
                                    to="/iletisim"
                                    className="bg-white text-green-800 px-10 py-5 rounded-xl text-xl font-bold shadow-xl"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Hemen İletişime Geçin
                                    </span>
                                </Link>

                                <Link
                                    to="/hizmetlerimiz"
                                    className="border-2 border-white text-white px-10 py-5 rounded-xl text-xl font-bold"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Hizmetleri İnceleyin
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

export default HomePage;