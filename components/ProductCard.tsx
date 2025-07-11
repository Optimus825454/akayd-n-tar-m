
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
    product: Product;
    contactPhone?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, contactPhone = '905397751517' }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Ürün resimlerini belirle (çoklu resim varsa onları kullan, yoksa ana resmi)
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
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden h-full flex flex-col transform transition-all duration-500 border border-gray-100">
            {/* Ürün detayına giden link - sadece görsel ve içerik alanı */}
            <Link to={`/urun/${product.id}`} className="flex-grow flex flex-col">
                {/* Görsel alanı - sabit aspect ratio */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={productImages[currentImageIndex]?.startsWith('/uploads')
                            ? `http://localhost:3003${productImages[currentImageIndex]}`
                            : productImages[currentImageIndex]
                        }
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Navigation arrows (sadece birden fazla resim varsa) */}
                    {productImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageNavigation('prev');
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageNavigation('next');
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Dot indicators */}
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {productImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                                            ? 'bg-white shadow-lg'
                                            : 'bg-white/50 hover:bg-white/70'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Featured badge */}
                    {product.isFeatured && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-amber-800 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full shadow-lg">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Öne Çıkan
                            </span>
                        </div>
                    )}
                </div>

                {/* İçerik alanı */}
                <div className="p-6 flex-grow flex flex-col">
                    {/* Kategori etiketi */}
                    <div className="mb-3">
                        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            {product.category}
                        </span>
                    </div>

                    {/* Başlık */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {product.name}
                    </h3>

                    {/* Açıklama */}
                    <p className="text-gray-600 text-sm flex-grow leading-relaxed line-clamp-3">
                        {product.description}
                    </p>
                </div>
            </Link>

            {/* WhatsApp Butonu - Link dışında */}
            <div className="p-6 pt-0">
                <a
                    href={`https://wa.me/${contactPhone}?text=Merhaba, ${product.name} ürünü hakkında bilgi almak istiyorum.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 w-full font-medium"
                    onClick={(e) => e.stopPropagation()} // Link'in üzerine tıklama olayını durdur
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                    </svg>
                    WhatsApp Sipariş
                </a>
            </div>
        </div>
    );
};

export default ProductCard;
