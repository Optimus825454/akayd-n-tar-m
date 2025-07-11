import React, { useState, useEffect } from 'react';
import type { AboutPageContent, Notification } from '../../types';
import { aboutAPI } from '../../services/api';

interface AboutManagementProps {
    aboutContent: AboutPageContent;
    setAboutContent: React.Dispatch<React.SetStateAction<AboutPageContent>>;
    addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const AboutManagement: React.FC<AboutManagementProps> = ({
    aboutContent,
    setAboutContent,
    addNotification
}) => {
    const [aboutForm, setAboutForm] = useState<AboutPageContent>(aboutContent);
    const [aboutImages, setAboutImages] = useState<File[]>([]);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // AboutForm'u aboutContent ile senkronize et
    useEffect(() => {
        setAboutForm(aboutContent);
    }, [aboutContent]);

    // About resim silme fonksiyonu
    const handleAboutImageDelete = async (imagePath: string) => {
        try {
            setLoading(true);

            // Backend'den resmi sil
            const response = await aboutAPI.deleteImage(imagePath);

            // Backend'den dönen güncel image listesini kullan
            if (response.images) {
                const updatedAboutContent = { ...aboutContent, images: response.images };
                setAboutContent(updatedAboutContent);
                setAboutForm(updatedAboutContent);
            }

            addNotification('success', 'Başarılı!', 'Resim silindi.');
        } catch (error) {
            console.error('Resim silinirken hata:', error);
            addNotification('error', 'Hata!', 'Resim silinirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAboutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', aboutForm.title || '');
            formData.append('content', aboutForm.content || '');
            formData.append('mission', aboutForm.mission || '');
            formData.append('vision', aboutForm.vision || '');

            // Yalnızca yeni seçilen görselleri gönder
            aboutImages.forEach((image) => {
                formData.append(`images`, image);
            });

            // Silinen görselleri gönder
            if (deletedImages.length > 0) {
                formData.append('deletedImages', JSON.stringify(deletedImages));
            }

            const updatedAbout = await aboutAPI.update(formData);

            // Güncellenen about içeriğini state'e ekle
            const newAboutContent = {
                ...aboutForm,
                images: updatedAbout.images || aboutContent.images || []
            };

            setAboutContent(newAboutContent);
            setAboutImages([]);
            setDeletedImages([]);
            addNotification('success', 'Başarılı!', 'Hakkımızda sayfası güncellendi.');
        } catch (error) {
            console.error('Hakkımızda sayfası güncellenirken hata:', error);
            addNotification('error', 'Hata!', 'Hakkımızda sayfası güncellenirken hata oluştu.');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ℹ️ Hakkımızda Sayfası Yönetimi</h2>
                <form onSubmit={handleAboutSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📄 Başlık</label>
                            <input
                                type="text"
                                value={aboutForm.title || ''}
                                onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Hakkımızda sayfası başlığı..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📝 İçerik</label>
                            <textarea
                                value={aboutForm.content || ''}
                                onChange={(e) => setAboutForm({ ...aboutForm, content: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 h-24 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Genel açıklama..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Misyon</label>
                            <textarea
                                value={aboutForm.mission}
                                onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 h-32 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Şirketinizin misyonunu yazın..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🔮 Vizyon</label>
                            <textarea
                                value={aboutForm.vision}
                                onChange={(e) => setAboutForm({ ...aboutForm, vision: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 h-32 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Şirketinizin vizyonunu yazın..."
                                required
                            />
                        </div>
                    </div>

                    {/* Çoklu Görsel Yükleme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Hakkımızda Görselleri</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setAboutImages(Array.from(e.target.files || []))}
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Birden fazla görsel seçebilirsiniz. Seçilen görseller slider olarak gösterilecektir.
                        </p>
                    </div>

                    {/* Mevcut Görseller Preview */}
                    {aboutContent.images && aboutContent.images.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📷 Mevcut Görseller</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {aboutContent.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <div className="w-full h-24 rounded-lg overflow-hidden">
                                            <img
                                                src={image.startsWith('/uploads') ? `http://localhost:3003${image}` : image}
                                                alt={`Hakkımızda görseli ${index + 1}`}
                                                className="w-full h-full object-cover border border-gray-300 group-hover:opacity-75 transition-opacity"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAboutImageDelete(image)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Yeni Seçilen Görseller Preview */}
                    {aboutImages.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🆕 Yeni Seçilen Görseller</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {aboutImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <div className="w-full h-24 rounded-lg overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Yeni görsel ${index + 1}`}
                                                className="w-full h-full object-cover border border-gray-300 group-hover:opacity-75 transition-opacity"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAboutImages(aboutImages.filter((_, i) => i !== index))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                    >
                        {loading ? '⏳ Güncelleniyor...' : '✅ Hakkımızda Sayfasını Güncelle'}
                    </button>
                </form>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👁️ Önizleme</h3>
                <div className="space-y-4">
                    {aboutForm.title && (
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">{aboutForm.title}</h4>
                        </div>
                    )}

                    {aboutForm.content && (
                        <div>
                            <p className="text-gray-700">{aboutForm.content}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="text-lg font-semibold text-green-800 mb-2">🎯 Misyon</h5>
                            <p className="text-green-700">{aboutForm.mission || 'Misyon belirtilmemiş...'}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="text-lg font-semibold text-blue-800 mb-2">🔮 Vizyon</h5>
                            <p className="text-blue-700">{aboutForm.vision || 'Vizyon belirtilmemiş...'}</p>
                        </div>
                    </div>

                    {aboutContent.images && aboutContent.images.length > 0 && (
                        <div>
                            <h5 className="text-lg font-semibold text-gray-800 mb-2">🖼️ Görseller</h5>
                            <div className="flex space-x-2 overflow-x-auto">
                                {aboutContent.images.slice(0, 3).map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.startsWith('/uploads') ? `http://localhost:3003${image}` : image}
                                        alt={`Preview ${index + 1}`}
                                        className="w-32 h-20 object-cover rounded border"
                                    />
                                ))}
                                {aboutContent.images.length > 3 && (
                                    <div className="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-sm">
                                        +{aboutContent.images.length - 3} daha
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AboutManagement;
