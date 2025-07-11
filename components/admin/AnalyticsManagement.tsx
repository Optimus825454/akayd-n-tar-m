import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import type { AnalyticsStats, VisitorSession, PopularPage, DailyAnalytics } from '../../types';

interface AnalyticsManagementProps {
    addNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({ addNotification }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [sessions, setSessions] = useState<VisitorSession[]>([]);
    const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'pages' | 'realtime' | 'settings'>('overview');
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [realTimeData, setRealTimeData] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        loadAnalyticsData();
        loadSettings();

        // Real-time data update interval
        const interval = setInterval(() => {
            if (activeTab === 'realtime') {
                loadRealTimeData();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [dateRange, activeTab]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            const [statsData, sessionsData, pagesData] = await Promise.all([
                analyticsAPI.getDashboardStats(dateRange),
                analyticsAPI.getSessions({ limit: 50, orderBy: 'last_activity_at', order: 'DESC' }),
                analyticsAPI.getPopularPages(20)
            ]);

            setStats(statsData);
            setSessions(sessionsData.sessions || []);
            setPopularPages(pagesData);
        } catch (error) {
            console.error('Analytics verileri yüklenemedi:', error);
            addNotification('error', 'Hata', 'Analytics verileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const loadRealTimeData = async () => {
        try {
            const data = await analyticsAPI.getRealTimeStats();
            setRealTimeData(data);
        } catch (error) {
            console.error('Real-time veriler yüklenemedi:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const settingsData = await analyticsAPI.getSettings();
            setSettings(settingsData);
        } catch (error) {
            console.error('Ayarlar yüklenemedi:', error);
        }
    };

    const updateSettings = async (newSettings: any) => {
        try {
            await analyticsAPI.updateSettings(newSettings);
            setSettings(newSettings);
            addNotification('success', 'Başarılı', 'Analitik ayarları güncellendi');
        } catch (error) {
            console.error('Ayarlar güncellenemedi:', error);
            addNotification('error', 'Hata', 'Ayarlar güncellenemedi');
        }
    };

    const exportData = async (format: 'csv' | 'json') => {
        try {
            setLoading(true);
            const data = await analyticsAPI.exportData(format, dateRange);

            // Create download link
            const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data], {
                type: format === 'json' ? 'application/json' : 'text/csv'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics-${dateRange.from}-${dateRange.to}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);

            addNotification('success', 'Başarılı', `Analytics verileri ${format.toUpperCase()} formatında indirildi`);
        } catch (error) {
            console.error('Veri dışa aktarılamadı:', error);
            addNotification('error', 'Hata', 'Veri dışa aktarılamadı');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}s ${minutes}d ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}d ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR');
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'mobile': return '📱';
            case 'tablet': return '📲';
            case 'desktop': return '💻';
            default: return '📱';
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">📈 Ziyaretçi Analitikleri</h2>
                        <p className="text-gray-600">Sitenizin ziyaretçi davranışlarını ve performansını analiz edin</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => exportData('csv')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                📊 CSV İndir
                            </button>
                            <button
                                onClick={() => exportData('json')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                📋 JSON İndir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: 'Genel Bakış', icon: '📊' },
                            { id: 'sessions', name: 'Oturumlar', icon: '👥' },
                            { id: 'pages', name: 'Popüler Sayfalar', icon: '📄' },
                            { id: 'realtime', name: 'Canlı Veriler', icon: '🔴' },
                            { id: 'settings', name: 'Ayarlar', icon: '⚙️' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100">Toplam Oturum</p>
                                            <p className="text-3xl font-bold">{stats.total_sessions.toLocaleString()}</p>
                                        </div>
                                        <div className="text-4xl">👥</div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100">Benzersiz Ziyaretçi</p>
                                            <p className="text-3xl font-bold">{stats.unique_visitors.toLocaleString()}</p>
                                        </div>
                                        <div className="text-4xl">🆔</div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100">Sayfa Görüntüleme</p>
                                            <p className="text-3xl font-bold">{stats.total_page_views.toLocaleString()}</p>
                                        </div>
                                        <div className="text-4xl">📄</div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100">Ortalama Süre</p>
                                            <p className="text-3xl font-bold">{Math.round(stats.avg_session_duration / 60)}d</p>
                                        </div>
                                        <div className="text-4xl">⏱️</div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts and Additional Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Device Stats */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Cihaz Türleri</h3>
                                    <div className="space-y-3">
                                        {Object.entries(stats.device_stats || {}).map(([device, count]) => (
                                            <div key={device} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="mr-2">{getDeviceIcon(device)}</span>
                                                    <span className="capitalize">{device}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full"
                                                            style={{ width: `${(count as number / stats.total_sessions) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{count as number}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Browser Stats */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Tarayıcılar</h3>
                                    <div className="space-y-3">
                                        {Object.entries(stats.browser_stats || {}).slice(0, 5).map(([browser, count]) => (
                                            <div key={browser} className="flex items-center justify-between">
                                                <span className="capitalize">{browser}</span>
                                                <div className="flex items-center">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${(count as number / stats.total_sessions) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{count as number}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Son Aktiviteler</h3>
                                <div className="space-y-3">
                                    {stats.recent_visitors?.slice(0, 5).map((visitor, index) => (
                                        <div key={visitor.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <div className="flex items-center">
                                                <span className="mr-3">{getDeviceIcon(visitor.device_type)}</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {visitor.country || 'Bilinmeyen'} - {visitor.browser || 'Bilinmeyen'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {visitor.total_page_views} sayfa görüntüleme
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">{formatDate(visitor.last_activity_at)}</p>
                                                <p className="text-sm font-medium text-green-600">
                                                    {formatDuration(visitor.session_duration)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sessions Tab */}
                    {activeTab === 'sessions' && (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ziyaretçi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cihaz
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Konum
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sayfa Görüntüleme
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Süre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                İlk Ziyaret
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-3 ${session.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {session.session_id.substring(0, 8)}...
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {session.ip_address || 'Gizli'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{getDeviceIcon(session.device_type)}</span>
                                                        <div>
                                                            <div className="text-sm text-gray-900">{session.device_type}</div>
                                                            <div className="text-sm text-gray-500">{session.browser}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {session.country && session.city ? `${session.city}, ${session.country}` : session.country || 'Bilinmeyen'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {session.total_page_views}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDuration(session.session_duration)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(session.first_visit_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Popular Pages Tab */}
                    {activeTab === 'pages' && (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                {popularPages.map((page, index) => (
                                    <div key={page.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-green-600 font-medium text-sm">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {page.page_title || page.page_path}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{page.page_path}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6 text-sm">
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900">{page.total_views}</p>
                                                    <p className="text-gray-500">Görüntüleme</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900">{page.unique_views}</p>
                                                    <p className="text-gray-500">Benzersiz</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900">
                                                        {Math.round(page.avg_time_on_page / 60)}d
                                                    </p>
                                                    <p className="text-gray-500">Ort. Süre</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900">{page.bounce_rate.toFixed(1)}%</p>
                                                    <p className="text-gray-500">Çıkış Oranı</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Real-time Tab */}
                    {activeTab === 'realtime' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                    Canlı Veriler - 5 saniyede bir güncellenir
                                </div>
                            </div>

                            {realTimeData && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white text-center">
                                        <div className="text-4xl font-bold">{realTimeData.active_visitors || 0}</div>
                                        <div className="text-red-100">Aktif Ziyaretçi</div>
                                    </div>

                                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white text-center">
                                        <div className="text-4xl font-bold">{realTimeData.current_sessions || 0}</div>
                                        <div className="text-yellow-100">Aktif Oturum</div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
                                        <div className="text-4xl font-bold">{realTimeData.pages_per_minute || 0}</div>
                                        <div className="text-green-100">Dakikalık Görüntüleme</div>
                                    </div>
                                </div>
                            )}

                            {realTimeData?.recent_pages && (
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Son Görüntülenen Sayfalar</h3>
                                    <div className="space-y-2">
                                        {realTimeData.recent_pages.slice(0, 10).map((page: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                                                <span className="text-sm text-gray-900">{page.page_path}</span>
                                                <span className="text-xs text-gray-500">{formatDate(page.viewed_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && settings && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Analitik Ayarları</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-900">Analitik Takibi</label>
                                            <p className="text-sm text-gray-600">Ziyaretçi verilerini topla ve analiz et</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.analytics_enabled}
                                                onChange={(e) => updateSettings({ ...settings, analytics_enabled: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-900">IP Adresi Takibi</label>
                                            <p className="text-sm text-gray-600">Ziyaretçi IP adreslerini kaydet</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.track_ip_addresses}
                                                onChange={(e) => updateSettings({ ...settings, track_ip_addresses: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-900">Gizlilik Modu</label>
                                            <p className="text-sm text-gray-600">GDPR uyumlu veri toplama</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.privacy_mode}
                                                onChange={(e) => updateSettings({ ...settings, privacy_mode: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Veri Saklama Süresi (Gün)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.data_retention_days}
                                            onChange={(e) => updateSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Hariç Tutulacak IP Adresleri (virgülle ayırın)
                                        </label>
                                        <textarea
                                            value={settings.exclude_ips || ''}
                                            onChange={(e) => updateSettings({ ...settings, exclude_ips: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            rows={2}
                                            placeholder="192.168.1.1, 10.0.0.1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Veri Temizleme</h4>
                                <p className="text-sm text-yellow-700 mb-3">
                                    {settings.data_retention_days} günden eski analitik verilerini temizleyin
                                </p>
                                <button
                                    onClick={() => {
                                        if (confirm('Eski verileri silmek istediğinizden emin misiniz?')) {
                                            analyticsAPI.cleanupOldData(settings.data_retention_days);
                                            addNotification('success', 'Başarılı', 'Eski veriler temizlendi');
                                        }
                                    }}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                                >
                                    🗑️ Eski Verileri Temizle
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsManagement;
