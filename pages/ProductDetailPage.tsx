import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product, ContactPageContent, SEOSettings, PageSEO } from '../types';
import SEOHead from '../components/SEOHead';
import { productsAPI, seoAPI } from '../services/api';

interface ProductDetailPageProps {
    contactContent: ContactPageContent;
    seoSettings?: SEOSettings | null;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ contactContent, seoSettings }) => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

    // SEO verilerini yükle
    useEffect(() => {
        const loadPageSEO = async () => {
            try {
                const data = await seoAPI.getPageSEO(`/urun/${id}`);
                setPageSEO(data);
            } catch (error) {
                // SEO verileri yüklenemedi
            }
        };
        if (id) {
            loadPageSEO();
        }
    }, [id]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;

            try {
                const products = await productsAPI.getAll();
                const foundProduct = products.find((p: any) => p.id.toString() === id);

                if (foundProduct) {
                    const mappedProduct: Product = {
                        id: foundProduct.id.toString(),
                        name: foundProduct.name,
                        description: foundProduct.description,
                        category: foundProduct.category,
                        price: foundProduct.price || 0,
                        isFeatured: foundProduct.is_featured || false,
                        imageUrl: foundProduct.image_url && foundProduct.image_url.startsWith('/uploads/')
                            ? `http://localhost:3003${foundProduct.image_url}`
                            : foundProduct.image_url || 'https://picsum.photos/600/400?random=1',
                        images: foundProduct.images && Array.isArray(foundProduct.images)
                            ? foundProduct.images.map((img: string) =>
                                img.startsWith('/uploads/') ? `http://localhost:3003${img}` : img
                            )
                            : []
                    };
                    setProduct(mappedProduct);
                }
            } catch (error) {
                // Ürün detayları alınamadı
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Yükleniyor...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h1>
                    <p className="text-gray-600 mb-8">Aradığınız ürün mevcut değil.</p>
                    <Link
                        to="/urunler"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Ürünlere Geri Dön
                    </Link>
                </div>
            </div>
        );
    }

    // Ürün resimlerini belirle
    const productImages = product.images && product.images.length > 0
        ? product.images
        : [product.imageUrl];

    const handleImageNavigation = (direction: 'prev' | 'next') => {
        if (productImages.length <= 1) return;

        if (direction === 'next') {
            setCurrentImageIndex((prev) =>
                prev === productImages.length - 1 ? 0 : prev + 1
            );
        } else {
            setCurrentImageIndex((prev) =>
                prev === 0 ? productImages.length - 1 : prev - 1
            );
        }
    };

    return (
        <>
            <SEOHead
                seoSettings={seoSettings || undefined}
                pageSEO={pageSEO || undefined}
                pageTitle={`${product.name} - Ürün Detayı`}
                pageDescription={product.description}
                pageKeywords={`${product.name}, ${product.category}, ürün detayı, akaydın tarım`}
                ogImage={product.imageUrl}
            />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                        <Link to="/" className="hover:text-blue-600">Ana Sayfa</Link>
                        <span>/</span>
                        <Link to="/urunler" className="hover:text-blue-600">Ürünler</Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Ürün Görselleri */}
                        <div className="space-y-4">
                            {/* Ana Görsel */}
                            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
                                <div className="w-full aspect-[4/3] relative">
                                    <img
                                        src={productImages[currentImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Navigation arrows (sadece birden fazla resim varsa) */}
                                {productImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => handleImageNavigation('prev')}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => handleImageNavigation('next')}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail'ler */}
                            {productImages.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {productImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${index === currentImageIndex
                                                ? 'ring-2 ring-blue-500 shadow-lg'
                                                : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover object-center"
                                                loading="lazy"
                                            />
                                            {/* Seçili thumbnail işareti */}
                                            {index === currentImageIndex && (
                                                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ürün Bilgileri */}
                        <div className="space-y-6">
                            {/* Başlık ve Kategori */}
                            <div>
                                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-3">
                                    {product.category}
                                </span>
                                {product.isFeatured && (
                                    <span className="inline-block bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full mb-3 ml-2">
                                        ⭐ Öne Çıkan
                                    </span>
                                )}
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                    {product.name}
                                </h1>
                            </div>

                            {/* Açıklama */}
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Özellikler */}
                            <div className="bg-gray-100 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Özellikleri</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Yüksek kalite standartları
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Uzman ekip tarafından önerilir
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Hızlı teslimat
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        7/24 müşteri desteği
                                    </li>
                                </ul>
                            </div>

                            {/* İletişim Butonları */}
                            <div className="space-y-4">
                                <a
                                    href={`https://wa.me/${contactContent.phone.replace(/[^\d]/g, '')}?text=Merhaba, ${product.name} ürünü hakkında detaylı bilgi almak istiyorum.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors duration-300 w-full"
                                >
                                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                                    </svg>
                                    WhatsApp ile İletişime Geç
                                </a>

                                <a
                                    href={`tel:${contactContent.phone}`}
                                    className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors duration-300 w-full"
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Hemen Ara: {contactContent.phone}
                                </a>
                            </div>

                            {/* Geri Dön Butonu */}
                            <div className="pt-4">
                                <Link
                                    to="/urunler"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Tüm Ürünlere Geri Dön
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetailPage;
