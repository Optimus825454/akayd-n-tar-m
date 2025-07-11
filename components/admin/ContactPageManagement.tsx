import React from 'react';
import type { ContactPageContent } from '../../types';

interface ContactPageManagementProps {
    contactContent: ContactPageContent;
    onUpdateContact: (updatedContact: ContactPageContent) => Promise<void>;
    loading: boolean;
}

const ContactPageManagement: React.FC<ContactPageManagementProps> = ({
    contactContent,
    onUpdateContact,
    loading
}) => {
    const [contactForm, setContactForm] = React.useState<ContactPageContent>(contactContent);

    React.useEffect(() => {
        setContactForm(contactContent);
    }, [contactContent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submit ediliyor, contactForm state:', contactForm);
        await onUpdateContact(contactForm);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-xl">📧</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">İletişim Sayfası Yönetimi</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🏢 Şirket Adı</label>
                            <input
                                type="text"
                                value={contactForm.company_name || ''}
                                onChange={(e) => setContactForm({ ...contactForm, company_name: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Akaydın Tarım"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🌐 Website</label>
                            <input
                                type="url"
                                value={contactForm.website || ''}
                                onChange={(e) => {
                                    console.log('Website değişiyor:', e.target.value);
                                    setContactForm({ ...contactForm, website: e.target.value });
                                }}
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="https://www.akaydintarim.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📍 Adres</label>
                        <textarea
                            value={contactForm.address}
                            onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 h-24 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Şirket adresinizi yazın..."
                            required
                        />
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📞 Telefon</label>
                            <input
                                type="text"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="+90 555 123 45 67"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📱 WhatsApp Sipariş Hattı</label>
                            <input
                                type="text"
                                value={contactForm.whatsapp_phone || ''}
                                onChange={(e) => {
                                    console.log('WhatsApp numarası değişiyor:', e.target.value);
                                    setContactForm({ ...contactForm, whatsapp_phone: e.target.value });
                                }}
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="+90 555 123 45 67"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ürün kartlarındaki WhatsApp butonu için kullanılacak telefon numarası</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📧 E-posta</label>
                        <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="info@akaydintarim.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">⏰ Çalışma Saatleri</label>
                        <input
                            type="text"
                            value={contactForm.working_hours || ''}
                            onChange={(e) => setContactForm({ ...contactForm, working_hours: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Pazartesi - Cumartesi: 08:00 - 18:00"
                        />
                    </div>

                    {/* Sosyal Medya Hesapları */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Sosyal Medya Hesapları</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">📘 Facebook</label>
                                <input
                                    type="url"
                                    value={contactForm.facebook_url || ''}
                                    onChange={(e) => setContactForm({ ...contactForm, facebook_url: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://facebook.com/akaydintarim"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">📷 Instagram</label>
                                <input
                                    type="url"
                                    value={contactForm.instagram_url || ''}
                                    onChange={(e) => setContactForm({ ...contactForm, instagram_url: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://instagram.com/akaydintarim"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">🐦 Twitter</label>
                                <input
                                    type="url"
                                    value={contactForm.twitter_url || ''}
                                    onChange={(e) => setContactForm({ ...contactForm, twitter_url: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://twitter.com/akaydintarim"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">💼 LinkedIn</label>
                                <input
                                    type="url"
                                    value={contactForm.linkedin_url || ''}
                                    onChange={(e) => setContactForm({ ...contactForm, linkedin_url: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://linkedin.com/company/akaydintarim"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">🎥 YouTube</label>
                                <input
                                    type="url"
                                    value={contactForm.youtube_url || ''}
                                    onChange={(e) => setContactForm({ ...contactForm, youtube_url: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://youtube.com/@akaydintarim"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Harita Embed */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Harita Embed</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed Kodu</label>
                            <textarea
                                value={contactForm.map_embed || ''}
                                onChange={(e) => setContactForm({ ...contactForm, map_embed: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 h-24 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="<iframe src='...' width='100%' height='300'></iframe>"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Google Maps'ten iframe embed kodunu kopyalayıp buraya yapıştırın.
                                Örnk: Google Maps → Konum → Paylaş → Harita yerleştir
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    <span>Güncelleniyor...</span>
                                </>
                            ) : (
                                <>
                                    <span>✅</span>
                                    <span>İletişim Bilgilerini Güncelle</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactPageManagement;
