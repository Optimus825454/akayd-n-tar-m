
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ContactPageContent } from '../types';

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `relative px-4 py-3 rounded-xl font-medium transition-all duration-300 block text-center lg:inline-block lg:text-left ${isActive
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`
            }
        >
            {children}
        </NavLink>
    );
};

interface HeaderProps {
    contactContent: ContactPageContent;
}

const Header: React.FC<HeaderProps> = ({ contactContent }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMobileMenuItemClick = () => {
        setIsOpen(false); // Mobil menüyü kapat
    };

    return (
        <>
            {/* Top Contact Bar - Sadece masaüstünde görünür */}
            <div className="hidden lg:block bg-green-600 text-white py-2 text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{contactContent.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{contactContent.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{contactContent.address.split(',').slice(-2).join(',').trim()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <header className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <NavLink to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                                <div className="group-hover:scale-105 transition-transform duration-300">
                                    <img
                                        src="/akaylogo.png"
                                        alt="Akaydın Tarım Logo"
                                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-xl sm:text-2xl font-bold text-gray-900">Akaydın Tarım</span>
                                    <p className="text-xs sm:text-sm text-green-600 font-medium">Fındık Uzmanı</p>
                                </div>
                            </NavLink>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:block">
                            <div className="flex items-center space-x-2">
                                <NavItem to="/">Ana Sayfa</NavItem>
                                <NavItem to="/hakkimizda">Hakkımızda</NavItem>
                                <NavItem to="/hizmetlerimiz">Hizmetlerimiz</NavItem>
                                <NavItem to="/urunler">Ürünlerimiz</NavItem>
                                <NavItem to="/blog">Blog</NavItem>
                                <NavItem to="/iletisim">İletişim</NavItem>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl text-gray-600 hover:text-green-600 transition-all duration-300"
                            >
                                <span className="sr-only">Menüyü aç</span>
                                {isOpen ? (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="lg:hidden border-t border-gray-100">
                        <div className="px-4 pt-4 pb-6 space-y-2 bg-white">
                            <div className="flex flex-col space-y-3">
                                <NavItem to="/" onClick={handleMobileMenuItemClick}>Ana Sayfa</NavItem>
                                <NavItem to="/hakkimizda" onClick={handleMobileMenuItemClick}>Hakkımızda</NavItem>
                                <NavItem to="/hizmetlerimiz" onClick={handleMobileMenuItemClick}>Hizmetlerimiz</NavItem>
                                <NavItem to="/urunler" onClick={handleMobileMenuItemClick}>Ürünlerimiz</NavItem>
                                <NavItem to="/blog" onClick={handleMobileMenuItemClick}>Blog</NavItem>
                                <NavItem to="/iletisim" onClick={handleMobileMenuItemClick}>İletişim</NavItem>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobil İletişim Bilgileri Bandı - Sadece mobilsde görünür */}
            <div className="lg:hidden bg-gradient-to-r from-green-600 to-green-700 text-white py-2 overflow-hidden">
                <div className="flex animate-ticker">
                    <div className="flex items-center space-x-8 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2 animate-fade-in">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>📞 {contactContent.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 animate-fade-in delay-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>✉️ {contactContent.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 animate-fade-in delay-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>📍 {contactContent.address.split(',').slice(-2).join(',').trim()}</span>
                        </div>
                        {contactContent.whatsapp_phone && (
                            <div className="flex items-center space-x-2 animate-fade-in delay-300">
                                <span>📱 WhatsApp: {contactContent.whatsapp_phone}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-2 animate-fade-in delay-300">
                            <span>⏰ Pazartesi-Cumartesi: 08:00-18:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;