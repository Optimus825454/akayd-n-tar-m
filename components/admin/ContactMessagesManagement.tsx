import React, { useEffect } from 'react';
import type { ContactMessage } from '../../types';
import { useContactMessages } from '../../hooks/useAdmin';

const ContactMessagesManagement: React.FC = () => {
    const {
        contactMessages,
        loadingMessages,
        isMessageModalOpen,
        setIsMessageModalOpen,
        selectedMessage,
        setSelectedMessage,
        loadContactMessages,
        handleMarkAsRead,
        handleDeleteMessage
    } = useContactMessages();

    useEffect(() => {
        loadContactMessages();
    }, []);

    const openMessageModal = (message: ContactMessage) => {
        setSelectedMessage(message);
        setIsMessageModalOpen(true);
        if (!message.is_read) {
            handleMarkAsRead(message.id);
        }
    };

    const closeMessageModal = () => {
        setSelectedMessage(null);
        setIsMessageModalOpen(false);
    };

    const unreadCount = contactMessages.filter(msg => !msg.is_read).length;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">💬 İletişim Mesajları</h2>
                        <button
                            onClick={loadContactMessages}
                            disabled={loadingMessages}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            {loadingMessages ? '⏳ Yükleniyor...' : '🔄 Yenile'}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-blue-500 text-xl">💬</span>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{contactMessages.length}</div>
                                    <div className="text-sm text-blue-600">Toplam Mesaj</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-amber-500 text-xl">🔔</span>
                                <div>
                                    <div className="text-2xl font-bold text-amber-600">{unreadCount}</div>
                                    <div className="text-sm text-amber-600">Okunmamış</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500 text-xl">✅</span>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{contactMessages.length - unreadCount}</div>
                                    <div className="text-sm text-green-600">Okunmuş</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Mesajlar ({contactMessages.length})
                    </h3>

                    {loadingMessages ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <span className="ml-3 text-gray-600">Mesajlar yükleniyor...</span>
                        </div>
                    ) : contactMessages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📬</div>
                            <p className="text-gray-500 text-lg">Henüz mesaj bulunmuyor.</p>
                            <p className="text-gray-400 text-sm mt-2">Müşterilerden gelen mesajlar burada görünecek.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contactMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${message.is_read
                                            ? 'border-gray-200 bg-gray-50'
                                            : 'border-amber-200 bg-amber-50 shadow-sm'
                                        }`}
                                    onClick={() => openMessageModal(message)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="font-semibold text-gray-900">{message.name}</h4>
                                                {!message.is_read && (
                                                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Yeni
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-600 mb-2">
                                                📧 {message.email} • 📞 {message.phone}
                                            </div>

                                            <p className="text-gray-700 line-clamp-2">
                                                {message.message}
                                            </p>

                                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                                <span>📅 {new Date(message.created_at).toLocaleString('tr-TR')}</span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openMessageModal(message);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                                                    >
                                                        👁️ Görüntüle
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMessage(message.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                                                    >
                                                        🗑️ Sil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Message Modal */}
            {isMessageModalOpen && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedMessage.name}</h3>
                                    <p className="text-gray-600">{selectedMessage.email}</p>
                                </div>
                                <button
                                    onClick={closeMessageModal}
                                    className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">📧 E-posta</label>
                                    <p className="text-gray-900">{selectedMessage.email}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">📞 Telefon</label>
                                    <p className="text-gray-900">{selectedMessage.phone}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Gönderim Tarihi</label>
                                <p className="text-gray-900">{new Date(selectedMessage.created_at).toLocaleString('tr-TR')}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">💬 Mesaj İçeriği</label>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-2">
                                    {selectedMessage.is_read ? (
                                        <span className="flex items-center space-x-1 text-green-600 text-sm">
                                            <span>✅</span>
                                            <span>Okundu</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1 text-amber-600 text-sm">
                                            <span>🔔</span>
                                            <span>Okunmamış</span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            window.location.href = `mailto:${selectedMessage.email}?subject=Re: İletişim Formu&body=Merhaba ${selectedMessage.name},%0D%0A%0D%0A`;
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        📧 E-posta Gönder
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.location.href = `tel:${selectedMessage.phone}`;
                                        }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        📞 Ara
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactMessagesManagement;
