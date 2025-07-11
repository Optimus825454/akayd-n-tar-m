
import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaLinkedinIn,
    FaYoutube,
    FaPhone,
    FaWhatsapp,
    FaEnvelope,
    FaMapMarkerAlt
} from 'react-icons/fa';
import type { ContactPageContent } from '../types';

interface FooterProps {
    content: ContactPageContent;
}

const Footer: React.FC<FooterProps> = ({ content }) => {
    const socialLinks = [
        {
            name: 'Facebook',
            icon: FaFacebookF,
            href: content.facebook_url || '#',
            color: 'hover:text-blue-500',
            bgColor: 'hover:bg-blue-500'
        },
        {
            name: 'Instagram',
            icon: FaInstagram,
            href: content.instagram_url || '#',
            color: 'hover:text-pink-500',
            bgColor: 'hover:bg-pink-500'
        },
        {
            name: 'Twitter',
            icon: FaTwitter,
            href: content.twitter_url || '#',
            color: 'hover:text-blue-400',
            bgColor: 'hover:bg-blue-400'
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedinIn,
            href: content.linkedin_url || '#',
            color: 'hover:text-blue-600',
            bgColor: 'hover:bg-blue-600'
        },
        {
            name: 'YouTube',
            icon: FaYoutube,
            href: content.youtube_url || '#',
            color: 'hover:text-red-500',
            bgColor: 'hover:bg-red-500'
        },
    ].filter(social => social.href !== '#'); // Sadece dolu olan linkleri göster

    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-3">
                            <img
                                src="/akaylogo.png"
                                alt="Akaydın Tarım Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <span className="text-xl font-bold font-serif">Akaydın Tarım</span>
                        </Link>
                        <p className="text-gray-400 text-sm">
                            Fındık ve tarım sektöründe yenilikçi çözümlerle geleceğin tarımını bugünden inşa ediyoruz.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Hızlı Erişim</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/hakkimizda" className="text-base text-gray-400 hover:text-white">Hakkımızda</Link></li>
                            <li><Link to="/hizmetlerimiz" className="text-base text-gray-400 hover:text-white">Hizmetlerimiz</Link></li>
                            <li><Link to="/urunler" className="text-base text-gray-400 hover:text-white">Ürünler</Link></li>
                            <li><Link to="/blog" className="text-base text-gray-400 hover:text-white">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">İletişim</h3>
                        <ul className="mt-4 space-y-3 text-gray-400 text-sm">
                            <li className="flex items-start">
                                <FaMapMarkerAlt className="w-4 h-4 mr-3 mt-1 shrink-0 text-green-400" />
                                <span>{content.address}</span>
                            </li>
                            <li className="flex items-center">
                                <FaPhone className="w-4 h-4 mr-3 shrink-0 text-green-400" />
                                <a href={`tel:${content.phone}`} className="hover:text-green-400 transition-colors">
                                    {content.phone}
                                </a>
                            </li>
                            {content.whatsapp_phone && (
                                <li className="flex items-center">
                                    <FaWhatsapp className="w-4 h-4 mr-3 shrink-0 text-green-400" />
                                    <a
                                        href={`https://wa.me/${content.whatsapp_phone.replace(/[^\d]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-green-400 transition-colors"
                                    >
                                        WhatsApp: {content.whatsapp_phone}
                                    </a>
                                </li>
                            )}
                            <li className="flex items-center">
                                <FaEnvelope className="w-4 h-4 mr-3 shrink-0 text-green-400" />
                                <a href={`mailto:${content.email}`} className="hover:text-green-400 break-all transition-colors">
                                    {content.email}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Bizi Takip Edin</h3>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {socialLinks.map((social) => {
                                const IconComponent = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 transform hover:scale-110 ${social.bgColor} hover:text-white group`}
                                        title={social.name}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </a>
                                );
                            })}
                            {socialLinks.length === 0 && (
                                <div className="text-center p-4 bg-gray-700 rounded-lg">
                                    <p className="text-gray-500 text-sm mb-2">Sosyal medya hesapları henüz eklenmemiş.</p>
                                    <p className="text-xs text-gray-600">Admin panelinden sosyal medya hesaplarınızı ekleyebilirsiniz.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-700 pt-8 text-center">
                    <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} Akaydın Tarım. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;