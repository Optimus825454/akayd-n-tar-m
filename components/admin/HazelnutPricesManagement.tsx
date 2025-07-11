import React from 'react';
import type { Notification } from '../../types';
import { useHazelnutPrices } from '../../hooks/useAdmin';

interface HazelnutPricesManagementProps {
    addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const HazelnutPricesManagement: React.FC<HazelnutPricesManagementProps> = ({
    addNotification
}) => {
    const {
        hazelnutPrices,
        pricesHistory,
        pricesForm,
        setPricesForm,
        loadingPrices,
        isAutoUpdateActive,
        loadHazelnutPrices,
        loadPricesHistory,
        handlePricesUpdate,
        handleScrapePrice,
        handleApplyScrapedPrice,
        toggleUpdateMode
    } = useHazelnutPrices(addNotification);

    React.useEffect(() => {
        loadHazelnutPrices();
        loadPricesHistory();
    }, []);

    return (
        <div className="space-y-6">
            {/* Current Prices Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">🌰 Fındık Fiyatları Yönetimi</h2>

                {hazelnutPrices && (
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                        {/* Serbest Piyasa Fiyatı */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-8 text-center">
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-purple-600 text-3xl mr-3">💰</span>
                                <h3 className="text-2xl font-semibold text-purple-800">Fındık Serbest Piyasa Fiyatı</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="text-6xl font-bold text-purple-600">{Number(hazelnutPrices.price || 0).toFixed(2)} ₺</div>
                                <div className="text-lg text-purple-600">kg başına</div>
                            </div>
                            <div className="mt-6 flex items-center justify-center">
                                <div className={`text-3xl font-semibold ${Number(hazelnutPrices.daily_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Number(hazelnutPrices.daily_change || 0) >= 0 ? '+' : ''}{Number(hazelnutPrices.daily_change || 0).toFixed(2)} ₺
                                </div>
                            </div>
                            <div className="text-sm text-purple-500 mt-2">günlük değişim</div>
                            <div className="mt-2">
                                <span className={`px-3 py-1 text-sm rounded-full ${hazelnutPrices.source === 'scraped' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {hazelnutPrices.source === 'scraped' ? '🤖 Otomatik Çekildi' : '✋ Manuel Girdi'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Price Update Info */}
                {hazelnutPrices && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Son Güncellenme: {new Date(hazelnutPrices.updated_at).toLocaleString('tr-TR')}</span>
                            <span className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${Number(hazelnutPrices.daily_change || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span>
                                    {Number(hazelnutPrices.change_percentage || 0) >= 0 ? '+' : ''}{Number(hazelnutPrices.change_percentage || 0).toFixed(2)}% değişim
                                </span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Price Update Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Fiyat Güncelleme</h3>

                <form onSubmit={handlePricesUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">💰 Serbest Piyasa Fiyatı (₺/kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={pricesForm.price}
                                onChange={(e) => setPricesForm({ ...pricesForm, price: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📊 Günlük Değişim (₺)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={pricesForm.daily_change}
                                onChange={(e) => setPricesForm({ ...pricesForm, daily_change: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📈 Değişim Yüzdesi (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={pricesForm.change_percentage}
                                onChange={(e) => setPricesForm({ ...pricesForm, change_percentage: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📝 Notlar (İsteğe bağlı)</label>
                            <textarea
                                placeholder="Fiyat değişikliği hakkında not ekleyebilirsiniz..."
                                value={pricesForm.notes}
                                onChange={(e) => setPricesForm({ ...pricesForm, notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loadingPrices}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors flex-1"
                        >
                            {loadingPrices ? '⏳ Güncelleniyor...' : '✅ Fiyatları Güncelle'}
                        </button>

                        <button
                            type="button"
                            onClick={loadHazelnutPrices}
                            disabled={loadingPrices}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            🔄 Yenile
                        </button>
                    </div>
                </form>
            </div>

            {/* Automatic Price Scraping Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Otomatik Fiyat Çekme Sistemi</h3>

                <div className="space-y-4">
                    {/* Update Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Güncelleme Modu</h4>
                            <p className="text-sm text-gray-600">
                                {isAutoUpdateActive ? 'Otomatik: Çekilen fiyatlar doğrudan uygulanır' : 'Manuel: Çekilen fiyatlar onay bekler'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleUpdateMode}
                            disabled={loadingPrices}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${isAutoUpdateActive
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                } disabled:opacity-50`}
                        >
                            {isAutoUpdateActive ? '🟢 Otomatik' : '🔘 Manuel'}
                        </button>
                    </div>

                    {/* Scraping Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">🌐 Fiyat Çekme İşlemleri</h4>
                            <p className="text-sm text-gray-600">FindikTV.com'dan güncel fiyatları çekin</p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleScrapePrice}
                                    disabled={loadingPrices}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium transition-colors flex-1"
                                >
                                    {loadingPrices ? '⏳ Çekiliyor...' : '📥 Fiyat Çek'}
                                </button>

                                {hazelnutPrices?.scraped_price && (
                                    <button
                                        type="button"
                                        onClick={handleApplyScrapedPrice}
                                        disabled={loadingPrices}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors"
                                    >
                                        ✅ Uygula
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">📊 Çekilen Fiyat Bilgisi</h4>
                            {hazelnutPrices?.scraped_price ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600 mb-2">
                                        {Number(hazelnutPrices.scraped_price).toFixed(2)} ₺
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        Son çekilen fiyat
                                    </div>
                                    {hazelnutPrices.last_scraped_at && (
                                        <div className="text-xs text-blue-500 mt-1">
                                            {new Date(hazelnutPrices.last_scraped_at).toLocaleString('tr-TR')}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="text-gray-500 text-center">
                                        Henüz fiyat çekilmedi
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Automatic Schedule Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-yellow-600">⏰</span>
                            <h4 className="font-medium text-yellow-800">Otomatik Çekme Programı</h4>
                        </div>
                        <p className="text-sm text-yellow-700">
                            Sistem her 4 saatte bir otomatik olarak fiyatları çeker.
                            {isAutoUpdateActive ? ' Otomatik modda çekilen fiyatlar doğrudan uygulanır.' : ' Manuel modda çekilen fiyatlar onayınızı bekler.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Price History & Analytics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Fiyat Analizi</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-blue-500 text-xl">📈</span>
                            <div>
                                <div className="text-sm font-medium text-blue-800">Haftalık Trend</div>
                                <div className="text-xs text-blue-600">
                                    {(hazelnutPrices?.daily_change || 0) >= 0 ? 'Yükseliş' : 'Düşüş'} eğiliminde
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-500 text-xl">💰</span>
                            <div>
                                <div className="text-sm font-medium text-green-800">Güncel Fiyat</div>
                                <div className="text-xs text-green-600">
                                    {Number(hazelnutPrices?.price || 0).toFixed(2)} ₺/kg
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-purple-500 text-xl">🎯</span>
                            <div>
                                <div className="text-sm font-medium text-purple-800">Piyasa Durumu</div>
                                <div className="text-xs text-purple-600">
                                    {(hazelnutPrices?.daily_change || 0) >= 0 ? 'Pozitif' : 'Negatif'} seyir
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">ℹ️ Fiyat Güncellemesi Hakkında</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Fiyatlar FindikTV.com'dan otomatik olarak çekilir</li>
                        <li>• Sistem 4 saatte bir otomatik fiyat kontrolü yapar</li>
                        <li>• Manuel modda çekilen fiyatları onaylamanız gerekir</li>
                        <li>• Otomatik modda çekilen fiyatlar doğrudan uygulanır</li>
                    </ul>
                </div>
            </div>

            {/* Price History Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Fiyat Geçmişi</h3>

                {pricesHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Fiyat (₺/kg)</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Günlük Değişim</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Değişim %</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Kaynak</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Tarih</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Notlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricesHistory.map((record, index) => (
                                    <tr key={record.id} className={index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">{record.id}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm font-semibold">
                                            {Number(record.price || 0).toFixed(2)} ₺
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                            <span className={`${Number(record.daily_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Number(record.daily_change || 0) >= 0 ? '+' : ''}{Number(record.daily_change || 0).toFixed(2)} ₺
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                            <span className={`${Number(record.change_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Number(record.change_percentage || 0) >= 0 ? '+' : ''}{Number(record.change_percentage || 0).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                            <span className={`px-2 py-1 text-xs rounded-full ${record.source === 'scraped' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {record.source === 'scraped' ? '🤖 Otomatik' : '✋ Manuel'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                            {new Date(record.created_at).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Henüz fiyat geçmişi bulunamadı.</p>
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <button
                        onClick={loadPricesHistory}
                        disabled={loadingPrices}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
                    >
                        🔄 Geçmişi Yenile
                    </button>
                    <p className="text-sm text-gray-500">Son 50 kayıt gösteriliyor</p>
                </div>
            </div>
        </div>
    );
};

export default HazelnutPricesManagement;
