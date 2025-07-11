import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

interface LiveVisitor {
    session_id: string;
    current_page: string;
    location: string;
    device: string;
    browser: string;
    last_seen: string;
    page_views: number;
    duration: number;
}

interface RealtimeStats {
    activeVisitors: number;
    totalPageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: Array<{
        page: string;
        views: number;
    }>;
    deviceBreakdown: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
    hourlyStats: Array<{
        hour: number;
        visitors: number;
        pageViews: number;
    }>;
}

const RealTimeAnalytics: React.FC = () => {
    const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // Real-time data fetching
    const fetchRealTimeData = async () => {
        try {
            console.log('Fetching real-time data...');
            const [visitors, stats] = await Promise.all([
                analyticsAPI.getLiveVisitors(),
                analyticsAPI.getRealTimeStats()
            ]);

            console.log('Live visitors:', visitors);
            console.log('Realtime stats:', stats);

            setLiveVisitors(visitors || []);
            setRealtimeStats(stats || null);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Real-time analytics yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load and auto refresh every 30 seconds
    useEffect(() => {
        fetchRealTimeData();

        const interval = setInterval(fetchRealTimeData, 30000); // 30 saniye

        return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getDeviceIcon = (device: string) => {
        switch (device.toLowerCase()) {
            case 'mobile': return '📱';
            case 'tablet': return '📱';
            case 'desktop': return '💻';
            default: return '🖥️';
        }
    };

    const getBrowserIcon = (browser: string) => {
        switch (browser.toLowerCase()) {
            case 'chrome': return '🌐';
            case 'firefox': return '🦊';
            case 'safari': return '🧭';
            case 'edge': return '🌊';
            default: return '🌐';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                    <span className="text-gray-600">Anlık veriler yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">📊 Anlık Site Analitikleri</h1>
                        <p className="text-blue-100">
                            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{liveVisitors.length}</div>
                        <div className="text-blue-200">Aktif Ziyaretçi</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {realtimeStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                👥
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {realtimeStats.activeVisitors}
                                </div>
                                <div className="text-gray-600">Aktif Ziyaretçi</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                👁️
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {realtimeStats.totalPageViews}
                                </div>
                                <div className="text-gray-600">Sayfa Görüntüleme</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                🎯
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {realtimeStats.bounceRate.toFixed(1)}%
                                </div>
                                <div className="text-gray-600">Bounce Rate</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                                ⏱️
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatDuration(realtimeStats.avgSessionDuration)}
                                </div>
                                <div className="text-gray-600">Ort. Süre</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Visitors */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🔴</span>
                        Anlık Ziyaretçiler ({liveVisitors.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {liveVisitors.length > 0 ? (
                            liveVisitors.map((visitor) => (
                                <div
                                    key={visitor.session_id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center">
                                            <span className="text-lg mr-1">
                                                {getDeviceIcon(visitor.device)}
                                            </span>
                                            <span className="text-lg">
                                                {getBrowserIcon(visitor.browser)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 truncate max-w-xs">
                                                {visitor.current_page}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {visitor.location} • {visitor.device}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {visitor.page_views} sayfa
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDuration(visitor.duration)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Şu anda aktif ziyaretçi bulunmuyor
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                {realtimeStats && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">📈</span>
                            Popüler Sayfalar (Bugün)
                        </h3>
                        <div className="space-y-3">
                            {realtimeStats.topPages.map((page, index) => (
                                <div
                                    key={page.page}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="font-medium text-gray-900 truncate">
                                            {page.page}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                                        {page.views} görüntüleme
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Device & Hourly Stats */}
            {realtimeStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Device Breakdown */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">📱</span>
                            Cihaz Türleri (Bugün)
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">💻</span>
                                    <span className="font-medium">Desktop</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="bg-blue-200 rounded-full h-2 w-24">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{
                                                width: `${(realtimeStats.deviceBreakdown.desktop / (realtimeStats.deviceBreakdown.desktop + realtimeStats.deviceBreakdown.mobile + realtimeStats.deviceBreakdown.tablet)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{realtimeStats.deviceBreakdown.desktop}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">📱</span>
                                    <span className="font-medium">Mobile</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="bg-green-200 rounded-full h-2 w-24">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{
                                                width: `${(realtimeStats.deviceBreakdown.mobile / (realtimeStats.deviceBreakdown.desktop + realtimeStats.deviceBreakdown.mobile + realtimeStats.deviceBreakdown.tablet)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{realtimeStats.deviceBreakdown.mobile}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">📱</span>
                                    <span className="font-medium">Tablet</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="bg-purple-200 rounded-full h-2 w-24">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{
                                                width: `${(realtimeStats.deviceBreakdown.tablet / (realtimeStats.deviceBreakdown.desktop + realtimeStats.deviceBreakdown.mobile + realtimeStats.deviceBreakdown.tablet)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{realtimeStats.deviceBreakdown.tablet}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Stats */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">📊</span>
                            Saatlik İstatistikler (Bugün)
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {realtimeStats.hourlyStats.map((stat) => (
                                <div
                                    key={stat.hour}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                                >
                                    <div className="text-sm font-medium">
                                        {stat.hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-gray-600">
                                            {stat.visitors} ziyaretçi
                                        </div>
                                        <div className="text-sm text-blue-600">
                                            {stat.pageViews} sayfa
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeAnalytics;
