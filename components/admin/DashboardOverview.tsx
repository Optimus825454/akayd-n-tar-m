import React, { useEffect, useState } from 'react';
import type { Product, BlogPost, AnalyticsStats } from '../../types';
import { analyticsAPI } from '../../services/api';

interface DashboardOverviewProps {
    stats: {
        totalServices: number;
        totalProducts: number;
        totalBlogPosts: number;
        recentActivity: string[];
    };
    products: Product[];
    blogPosts: BlogPost[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    stats,
    products,
    blogPosts
}) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsStats | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [realtimeData, setRealtimeData] = useState<any>(null);
    const [loadingRealtime, setLoadingRealtime] = useState(true);
    const [liveVisitors, setLiveVisitors] = useState<any[]>([]);
    const [currentPageViews, setCurrentPageViews] = useState<any[]>([]);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [todayHourlyStats, setTodayHourlyStats] = useState<any[]>([]);
    const [trafficSources, setTrafficSources] = useState<any[]>([]);
    const [deviceBreakdown, setDeviceBreakdown] = useState<any>({});

    useEffect(() => {
        loadAnalytics();
        loadRealtimeData();

        // Auto refresh real-time data every 10 seconds
        const interval = setInterval(loadRealtimeData, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await analyticsAPI.getDashboardStats();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Analytics verileri yüklenemedi:', error);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const loadRealtimeData = async () => {
        try {
            const [
                liveVisitorsData,
                realtimeStats,
                currentPageViewsData,
                recentActionsData,
                todayHourlyStatsData,
                trafficSourcesData,
                deviceBreakdownData
            ] = await Promise.all([
                analyticsAPI.getLiveVisitors(),
                analyticsAPI.getRealTimeStats(),
                analyticsAPI.getCurrentPageViews(),
                analyticsAPI.getRecentActions(20),
                analyticsAPI.getTodayHourlyStats(),
                analyticsAPI.getTrafficSources(7),
                analyticsAPI.getDeviceBreakdown()
            ]);

            setLiveVisitors(liveVisitorsData || []);
            setCurrentPageViews(currentPageViewsData || []);
            setRecentActions(recentActionsData || []);
            setTodayHourlyStats(todayHourlyStatsData || []);
            setTrafficSources(trafficSourcesData || []);
            setDeviceBreakdown(deviceBreakdownData || {});

            setRealtimeData({
                liveVisitors: liveVisitorsData || [],
                stats: realtimeStats || null
            });
        } catch (error) {
            console.error('Anlık veriler yüklenemedi:', error);
        } finally {
            setLoadingRealtime(false);
        }
    };

    const featuredProductsCount = products.filter(p => p.isFeatured).length;
    const recentBlogPosts = blogPosts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-800 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">🌱 Akay Tarım Admin Paneli</h1>
                        <p className="text-green-100">Hoş geldiniz! Sistem durumunuz ve istatistikleriniz aşağıda görüntüleniyor.</p>
                    </div>
                    {!loadingRealtime && realtimeData && (
                        <div className="text-right">
                            <div className="flex items-center text-white">
                                <div className="bg-red-500 rounded-full w-3 h-3 mr-2 animate-pulse"></div>
                                <span className="text-3xl font-bold">{realtimeData.liveVisitors.length}</span>
                            </div>
                            <div className="text-green-200 text-sm">Anlık Ziyaretçi</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <span className="text-2xl">🛠️</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Toplam Hizmet</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <span className="text-2xl">📦</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                            <p className="text-xs text-green-600">⭐ {featuredProductsCount} öne çıkan</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <span className="text-2xl">📝</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Blog Yazısı</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBlogPosts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                            <span className="text-2xl">👁️</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Toplam Görüntüleme</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {blogPosts.reduce((total, post) => total + (post.views || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Stats */}
            {!loadingAnalytics && analyticsData && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📈</span>
                        Ziyaretçi Analitikleri (Son 30 Gün)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">Toplam Oturum</p>
                                    <p className="text-2xl font-bold">{analyticsData.total_sessions.toLocaleString()}</p>
                                </div>
                                <div className="text-3xl">👥</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">Benzersiz Ziyaretçi</p>
                                    <p className="text-2xl font-bold">{analyticsData.unique_visitors.toLocaleString()}</p>
                                </div>
                                <div className="text-3xl">🆔</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">Sayfa Görüntüleme</p>
                                    <p className="text-2xl font-bold">{analyticsData.total_page_views.toLocaleString()}</p>
                                </div>
                                <div className="text-3xl">📄</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100">Aktif Ziyaretçi</p>
                                    <p className="text-2xl font-bold">{analyticsData.current_active_visitors}</p>
                                </div>
                                <div className="text-3xl">🔴</div>
                            </div>
                        </div>
                    </div>

                    {/* Device breakdown */}
                    <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Cihaz Türleri</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(analyticsData.device_stats || {}).map(([device, count]) => (
                                <div key={device} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="mr-2">
                                                {device === 'mobile' ? '📱' : device === 'tablet' ? '📲' : '💻'}
                                            </span>
                                            <span className="capitalize">{device}</span>
                                        </div>
                                        <span className="font-semibold">{count as number}</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${(count as number / analyticsData.total_sessions) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Real-time Visitor Activity */}
            {!loadingRealtime && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <span className="mr-2">🔴</span>
                            Anlık Ziyaretçi Hareketleri
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                            Canlı
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Live Visitors */}
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Aktif Ziyaretçiler ({liveVisitors.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {liveVisitors.slice(0, 5).map((visitor) => (
                                    <div key={visitor.session_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-sm">
                                                    {visitor.device === 'mobile' ? '📱' : visitor.device === 'tablet' ? '📲' : '💻'}
                                                </span>
                                                <span className="text-sm">
                                                    {visitor.browser === 'Chrome' ? '🟢' : visitor.browser === 'Firefox' ? '🟠' : visitor.browser === 'Safari' ? '🔵' : '⚪'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                                                    {visitor.current_page}
                                                </div>
                                                <div className="text-xs text-gray-500">{visitor.location}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-600">{visitor.page_views} sayfa</div>
                                            <div className="text-xs text-gray-500">
                                                {Math.floor(visitor.duration / 60)}d {visitor.duration % 60}s
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {liveVisitors.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        Şu anda aktif ziyaretçi bulunmuyor
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Popular Pages */}
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Son 5 Dakikada En Çok Görüntülenen
                            </h4>
                            <div className="space-y-2">
                                {currentPageViews.slice(0, 5).map((page, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-40">
                                                    {page.page_title || page.page_path}
                                                </div>
                                                <div className="text-xs text-gray-500">{page.page_path}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-green-600">
                                            {page.views} görüntüleme
                                        </div>
                                    </div>
                                ))}
                                {currentPageViews.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        Son 5 dakikada sayfa görüntülemesi yok
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Actions */}
                    <div className="border-t pt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                            Son Ziyaretçi Aktiviteleri
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {recentActions.slice(0, 8).map((action, index) => (
                                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-xs">
                                            {action.action_type === 'click' && '👆'}
                                            {action.action_type === 'scroll' && '📜'}
                                            {action.action_type === 'contact' && '📧'}
                                            {action.action_type === 'download' && '⬇️'}
                                            {action.action_type === 'external_link' && '🔗'}
                                            {action.action_type === 'search' && '🔍'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-gray-900">
                                                {action.action_type === 'click' && 'Tıklama'}
                                                {action.action_type === 'scroll' && 'Kaydırma'}
                                                {action.action_type === 'contact' && 'İletişim'}
                                                {action.action_type === 'download' && 'İndirme'}
                                                {action.action_type === 'external_link' && 'Dış Link'}
                                                {action.action_type === 'search' && 'Arama'}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-32">
                                                {action.page_path}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                            {action.country || 'Bilinmeyen'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(action.action_at).toLocaleTimeString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentActions.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    Son 1 saatte aktivite yok
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's Traffic Pattern */}
                    {todayHourlyStats.length > 0 && (
                        <div className="border-t pt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Bugünün Trafik Deseni
                            </h4>
                            <div className="flex items-end space-x-1 h-20">
                                {todayHourlyStats.map((stat) => (
                                    <div
                                        key={stat.hour}
                                        className="flex-1 bg-blue-200 rounded-t relative group cursor-pointer"
                                        style={{
                                            height: `${Math.max((stat.visitors / Math.max(...todayHourlyStats.map(s => s.visitors))) * 100, 5)}%`
                                        }}
                                    >
                                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {stat.hour.toString().padStart(2, '0')}:00<br />
                                            {stat.visitors} ziyaretçi<br />
                                            {stat.pageViews} sayfa
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>00:00</span>
                                <span>12:00</span>
                                <span>23:00</span>
                            </div>
                        </div>
                    )}

                    {/* Current Device Breakdown */}
                    {Object.keys(deviceBreakdown).length > 0 && (
                        <div className="border-t pt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Anlık Cihaz Dağılımı
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl mb-1">💻</div>
                                    <div className="text-lg font-bold text-gray-900">{deviceBreakdown.desktop || 0}</div>
                                    <div className="text-xs text-gray-500">Masaüstü</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-1">📱</div>
                                    <div className="text-lg font-bold text-gray-900">{deviceBreakdown.mobile || 0}</div>
                                    <div className="text-xs text-gray-500">Mobil</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-1">📲</div>
                                    <div className="text-lg font-bold text-gray-900">{deviceBreakdown.tablet || 0}</div>
                                    <div className="text-xs text-gray-500">Tablet</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Traffic Sources */}
                    {trafficSources.length > 0 && (
                        <div className="border-t pt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Trafik Kaynakları (Son 7 Gün)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {trafficSources.slice(0, 6).map((source, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs">
                                                    {source.source === 'direct' && '🔗'}
                                                    {source.source === 'google' && '🟢'}
                                                    {source.source === 'facebook' && '🔵'}
                                                    {source.source === 'instagram' && '🟣'}
                                                    {source.source === 'twitter' && '🐦'}
                                                    {source.source === 'linkedin' && '💼'}
                                                    {source.source === 'whatsapp' && '💬'}
                                                    {!['direct', 'google', 'facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp'].includes(source.source) && '🌐'}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                                        {source.source === 'direct' ? 'Doğrudan' : source.source}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {source.unique_visitors} ziyaretçi
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">
                                                {source.sessions}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Traffic Sources */}
            {trafficSources.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Hızlı Erişim - Trafik Kaynakları
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {trafficSources.slice(0, 4).map((source, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl mb-2">
                                        {source.source === 'direct' && '🔗'}
                                        {source.source === 'google' && '🟢'}
                                        {source.source === 'facebook' && '🔵'}
                                        {source.source === 'instagram' && '🟣'}
                                        {source.source === 'twitter' && '🐦'}
                                        {source.source === 'linkedin' && '💼'}
                                        {source.source === 'whatsapp' && '💬'}
                                        {!['direct', 'google', 'facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp'].includes(source.source) && '🌐'}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">{source.sessions}</div>
                                    <div className="text-sm text-gray-600 capitalize">
                                        {source.source === 'direct' ? 'Doğrudan' : source.source}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {source.unique_visitors} ziyaretçi
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loadingAnalytics && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                        <span className="text-gray-600">Analytics verileri yükleniyor...</span>
                    </div>
                </div>
            )}

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Son Aktiviteler
                    </h3>
                    <div className="space-y-3">
                        {stats.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">{activity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">⚡</span>
                        Hızlı İşlemler
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                            <span className="mr-2">🛠️</span>
                            <span className="text-sm font-medium text-blue-700">Yeni Hizmet</span>
                        </button>
                        <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                            <span className="mr-2">📦</span>
                            <span className="text-sm font-medium text-green-700">Yeni Ürün</span>
                        </button>
                        <button className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
                            <span className="mr-2">📝</span>
                            <span className="text-sm font-medium text-purple-700">Blog Yazısı</span>
                        </button>
                        <button className="flex items-center justify-center p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200">
                            <span className="mr-2">🌰</span>
                            <span className="text-sm font-medium text-amber-700">Fiyat Güncelle</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Blog Posts */}
            {recentBlogPosts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📝</span>
                        Son Blog Yazıları
                    </h3>
                    <div className="space-y-4">
                        {recentBlogPosts.map((post) => (
                            <div key={post.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={post.imageUrl || 'https://picsum.photos/60/60?random=1'}
                                    alt={post.title}
                                    className="w-12 h-12 object-cover rounded-lg mr-4"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 line-clamp-1">{post.title}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-1">{post.excerpt}</p>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                        <span>✍️ {post.author}</span>
                                        <span>📅 {new Date(post.date).toLocaleDateString('tr-TR')}</span>
                                        {post.views && <span>👁️ {post.views}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">💻</span>
                    Sistem Durumu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                            <p className="text-sm font-medium text-green-800">Web Sitesi</p>
                            <p className="text-xs text-green-600">Çevrimiçi</p>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                            <p className="text-sm font-medium text-green-800">Veritabanı</p>
                            <p className="text-xs text-green-600">Aktif</p>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Fındık Fiyatları</p>
                            <p className="text-xs text-blue-600">Güncel</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
