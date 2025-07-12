import React, { useState, useEffect } from 'react';
import { FaUsers, FaGlobe, FaDesktop, FaMobile, FaTablet, FaEye, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

interface ActiveVisitor {
    session_id: string;
    ip_address: string;
    country: string;
    city: string;
    device_type: string;
    browser: string;
    operating_system: string;
    visitor_fingerprint: string;
    is_return_visitor: boolean;
    first_visit: string;
    last_activity_at: string;
    current_page: string;
    current_page_title: string;
    session_duration: number;
    total_page_views: number;
    last_page_view: string;
}

interface RealtimeStats {
    active_visitors: number;
    todays_unique_visitors: number;
    current_popular_pages: Array<{
        page_path: string;
        page_title: string;
        views: number;
    }>;
    top_referrers: Array<{
        referrer: string;
        count: number;
    }>;
    last_updated: string;
}

const ActiveVisitorsManagement: React.FC = () => {
    const [activeVisitors, setActiveVisitors] = useState<ActiveVisitor[]>([]);
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVisitor, setSelectedVisitor] = useState<ActiveVisitor | null>(null);

    // Fetch active visitors
    const fetchActiveVisitors = async () => {
        try {
            const response = await fetch('http://localhost:3003/api/analytics/realtime/active-visitors');
            if (!response.ok) throw new Error('Aktif ziyaretçiler yüklenemedi');

            const data = await response.json();
            setActiveVisitors(data.active_visitors || []);
        } catch (err) {
            console.error('Aktif ziyaretçiler yükleme hatası:', err);
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        }
    };

    // Fetch realtime stats
    const fetchRealtimeStats = async () => {
        try {
            const response = await fetch('http://localhost:3003/api/analytics/realtime-stats');
            if (!response.ok) throw new Error('Gerçek zamanlı istatistikler yüklenemedi');

            const data = await response.json();
            setRealtimeStats(data);
        } catch (err) {
            console.error('Gerçek zamanlı istatistikler yükleme hatası:', err);
        }
    };

    // Load data initially
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchActiveVisitors(), fetchRealtimeStats()]);
            setLoading(false);
        };

        loadData();
    }, []);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchActiveVisitors();
            fetchRealtimeStats();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}dk`;
        return `${Math.floor(seconds / 3600)}sa ${Math.floor((seconds % 3600) / 60)}dk`;
    };

    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
        return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile': return <FaMobile className="text-blue-500" />;
            case 'tablet': return <FaTablet className="text-green-500" />;
            default: return <FaDesktop className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-red-600 text-center">
                    <p>Hata: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Yenile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Real-time Stats Cards */}
            {realtimeStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Aktif Ziyaretçi</p>
                                <p className="text-2xl font-bold">{realtimeStats.active_visitors}</p>
                            </div>
                            <FaUsers className="text-3xl text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Bugünkü Benzersiz</p>
                                <p className="text-2xl font-bold">{realtimeStats.todays_unique_visitors}</p>
                            </div>
                            <FaEye className="text-3xl text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Popüler Sayfalar</p>
                                <p className="text-2xl font-bold">{realtimeStats.current_popular_pages?.length || 0}</p>
                            </div>
                            <FaGlobe className="text-3xl text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Son Güncelleme</p>
                                <p className="text-sm font-medium">{formatTimeAgo(realtimeStats.last_updated)}</p>
                            </div>
                            <FaClock className="text-3xl text-orange-200" />
                        </div>
                    </div>
                </div>
            )}

            {/* Active Visitors Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-blue-500" />
                        Aktif Ziyaretçiler
                        <span className="text-sm font-normal text-gray-500">
                            (Son 5 dakika - {activeVisitors?.length || 0} ziyaretçi)
                        </span>
                    </h2>
                </div>

                {!activeVisitors || activeVisitors.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FaUsers className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p>Şu anda aktif ziyaretçi bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ziyaretçi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Konum
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cihaz
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mevcut Sayfa
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        İlk Ziyaret
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Son Aktivite
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Oturum Süresi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sayfa Görüntüleme
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durum
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeVisitors?.map((visitor) => (
                                    <tr
                                        key={visitor.session_id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setSelectedVisitor(visitor)}
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                                                <div>
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {visitor.ip_address}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {visitor.visitor_fingerprint.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                                {visitor.country && visitor.city ? `${visitor.city}, ${visitor.country}` : 'Bilinmiyor'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getDeviceIcon(visitor.device_type)}
                                                <div className="ml-2">
                                                    <div className="text-sm text-gray-900">{visitor.browser}</div>
                                                    <div className="text-xs text-gray-500">{visitor.operating_system}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900">
                                                {visitor.current_page_title || visitor.current_page}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {visitor.current_page}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(visitor.first_visit).toLocaleDateString('tr-TR')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(visitor.first_visit).toLocaleTimeString('tr-TR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatTimeAgo(visitor.last_activity_at)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(visitor.last_activity_at).toLocaleTimeString('tr-TR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDuration(visitor.session_duration)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {visitor.total_page_views} sayfa
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${visitor.is_return_visitor
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {visitor.is_return_visitor ? 'Tekrar Ziyaretçi' : 'Yeni'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Popular Pages */}
            {realtimeStats && realtimeStats.current_popular_pages && realtimeStats.current_popular_pages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Popüler Sayfalar (Son 30 dakika)
                    </h3>
                    <div className="space-y-2">
                        {realtimeStats.current_popular_pages.map((page, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {page.page_title || page.page_path}
                                    </div>
                                    <div className="text-sm text-gray-500">{page.page_path}</div>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                                    {page.views} görüntüleme
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Visitor Details Modal */}
            {selectedVisitor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Ziyaretçi Detayları</h3>
                            <button
                                onClick={() => setSelectedVisitor(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>IP Adresi:</strong> {selectedVisitor.ip_address}
                            </div>
                            <div>
                                <strong>Konum:</strong> {selectedVisitor.city}, {selectedVisitor.country}
                            </div>
                            <div>
                                <strong>Cihaz:</strong> {selectedVisitor.device_type}
                            </div>
                            <div>
                                <strong>Tarayıcı:</strong> {selectedVisitor.browser}
                            </div>
                            <div>
                                <strong>İşletim Sistemi:</strong> {selectedVisitor.operating_system}
                            </div>
                            <div>
                                <strong>İlk Ziyaret:</strong> {formatTimeAgo(selectedVisitor.first_visit)}
                            </div>
                            <div>
                                <strong>Son Aktivite:</strong> {formatTimeAgo(selectedVisitor.last_activity_at)}
                            </div>
                            <div>
                                <strong>Oturum Süresi:</strong> {formatDuration(selectedVisitor.session_duration)}
                            </div>
                            <div className="col-span-2">
                                <strong>Mevcut Sayfa:</strong> {selectedVisitor.current_page_title} ({selectedVisitor.current_page})
                            </div>
                            <div className="col-span-2">
                                <strong>Ziyaretçi Parmak İzi:</strong>
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-2">
                                    {selectedVisitor.visitor_fingerprint}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveVisitorsManagement;
