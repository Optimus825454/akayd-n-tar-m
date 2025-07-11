import React, { useState, useEffect } from 'react';
import type { Service, Product, BlogPost, ContactMessage, Notification, HazelnutPrices, ContactPageContent } from '../types';
import { contactMessagesAPI, hazelnutPricesAPI, contactAPI, seoAPI } from '../services/api';

export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '111') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Hatalı şifre');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
    };

    return {
        isAuthenticated,
        password,
        setPassword,
        error,
        handleLogin,
        handleLogout
    };
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (type: Notification['type'], title: string, message: string) => {
        const notification: Notification = {
            id: Date.now().toString(),
            type,
            title,
            message,
            duration: 5000
        };
        setNotifications(prev => [...prev, notification]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return {
        notifications,
        addNotification,
        removeNotification
    };
};

export const useContactMessages = () => {
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const loadContactMessages = async () => {
        setLoadingMessages(true);
        try {
            const messages = await contactMessagesAPI.getAll();
            setContactMessages(messages);
        } catch (error) {
            console.error('Mesajlar yüklenirken hata oluştu:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await contactMessagesAPI.markAsRead(Number(messageId));
            setContactMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, is_read: true } : msg
                )
            );
        } catch (error) {
            console.error('Mesaj okundu olarak işaretlenirken hata oluştu:', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
            try {
                await contactMessagesAPI.delete(Number(messageId));
                setContactMessages(prev => prev.filter(msg => msg.id !== messageId));
                setIsMessageModalOpen(false);
                setSelectedMessage(null);
            } catch (error) {
                console.error('Mesaj silinirken hata oluştu:', error);
            }
        }
    };

    return {
        contactMessages,
        setContactMessages,
        loadingMessages,
        isMessageModalOpen,
        setIsMessageModalOpen,
        selectedMessage,
        setSelectedMessage,
        loadContactMessages,
        handleMarkAsRead,
        handleDeleteMessage
    };
};

export const useHazelnutPrices = (addNotification: (type: Notification['type'], title: string, message: string) => void) => {
    const [hazelnutPrices, setHazelnutPrices] = useState<HazelnutPrices | null>(null);
    const [pricesHistory, setPricesHistory] = useState<HazelnutPrices[]>([]);
    const [pricesForm, setPricesForm] = useState({
        price: 0,
        daily_change: 0,
        change_percentage: 0,
        source: 'manual' as 'manual' | 'scraped',
        update_mode: 'manual' as 'manual' | 'automatic',
        scraping_enabled: true,
        notes: ''
    });
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [isAutoUpdateActive, setIsAutoUpdateActive] = useState(false);

    const loadHazelnutPrices = async () => {
        setLoadingPrices(true);
        try {
            const prices = await hazelnutPricesAPI.get();
            setHazelnutPrices(prices);
            setPricesForm({
                price: Number(prices.price) || 0,
                daily_change: Number(prices.daily_change) || 0,
                change_percentage: Number(prices.change_percentage) || 0,
                source: prices.source || 'manual',
                update_mode: prices.update_mode || 'manual',
                scraping_enabled: prices.scraping_enabled !== undefined ? prices.scraping_enabled : true,
                notes: prices.notes || ''
            });
            setIsAutoUpdateActive(prices.update_mode === 'automatic');
        } catch (error) {
            console.error('Fındık fiyatları yüklenirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Fındık fiyatları yüklenirken hata oluştu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const loadPricesHistory = async () => {
        try {
            const history = await hazelnutPricesAPI.getHistory();
            setPricesHistory(history);
        } catch (error) {
            console.error('Fiyat geçmişi yüklenirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Fiyat geçmişi yüklenirken hata oluştu.');
        }
    };

    const handlePricesUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingPrices(true);
        try {
            // Yeni kayıt olarak ekle
            await hazelnutPricesAPI.create(pricesForm);
            addNotification('success', 'Başarılı!', 'Yeni fındık fiyatı kaydedildi.');
            await loadHazelnutPrices();
            await loadPricesHistory();
        } catch (error) {
            console.error('Fiyat kaydedilirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Fiyat kaydedilirken hata oluştu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const handleScrapePrice = async () => {
        setLoadingPrices(true);
        try {
            const result = await hazelnutPricesAPI.scrape();
            addNotification('success', 'Başarılı!', `Güncel fiyat çekildi: ₺${result.scrapedPrice}`);
            await loadHazelnutPrices();
        } catch (error) {
            console.error('Fiyat çekme hatası:', error);
            addNotification('error', 'Hata!', 'Fiyat çekme işlemi başarısız oldu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const handleApplyScrapedPrice = async () => {
        setLoadingPrices(true);
        try {
            const result = await hazelnutPricesAPI.applyScraped();
            addNotification('success', 'Başarılı!', result.message);
            await loadHazelnutPrices();
        } catch (error) {
            console.error('Scraped fiyat uygulama hatası:', error);
            addNotification('error', 'Hata!', 'Scraped fiyat uygulanırken hata oluştu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const toggleUpdateMode = async () => {
        const newMode: 'manual' | 'automatic' = pricesForm.update_mode === 'manual' ? 'automatic' : 'manual';
        const updatedForm = { ...pricesForm, update_mode: newMode };

        setLoadingPrices(true);
        try {
            await hazelnutPricesAPI.update(updatedForm);
            setPricesForm(updatedForm);
            setIsAutoUpdateActive(newMode === 'automatic');
            addNotification('success', 'Başarılı!', `${newMode === 'automatic' ? 'Otomatik' : 'Manuel'} mod aktifleştirildi.`);
            await loadHazelnutPrices();
        } catch (error) {
            console.error('Mod değiştirme hatası:', error);
            addNotification('error', 'Hata!', 'Mod değiştirme işlemi başarısız oldu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    // 4 saatte bir otomatik scraping
    useEffect(() => {
        if (pricesForm.scraping_enabled) {
            const interval = setInterval(async () => {
                try {
                    await hazelnutPricesAPI.scrape();
                    if (pricesForm.update_mode === 'automatic') {
                        await hazelnutPricesAPI.applyScraped();
                    }
                    await loadHazelnutPrices();
                } catch (error) {
                    console.error('Otomatik scraping hatası:', error);
                }
            }, 4 * 60 * 60 * 1000); // 4 saat

            return () => clearInterval(interval);
        }
    }, [pricesForm.scraping_enabled, pricesForm.update_mode]);

    return {
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
    };
};

export const useStats = (services: Service[], products: Product[], blogPosts: BlogPost[], isAuthenticated: boolean) => {
    const [stats, setStats] = useState({
        totalServices: 0,
        totalProducts: 0,
        totalBlogPosts: 0,
        recentActivity: [] as string[]
    });

    useEffect(() => {
        if (isAuthenticated) {
            setStats({
                totalServices: services.length,
                totalProducts: products.length,
                totalBlogPosts: blogPosts.length,
                recentActivity: [
                    `${services.length} Hizmet`,
                    `${products.length} Ürün`,
                    `${blogPosts.length} Blog Yazısı`
                ]
            });
        }
    }, [services, products, blogPosts, isAuthenticated]);

    return stats;
};

// Contact Page Management Hook
export const useContactPage = () => {
    const [contactContent, setContactContent] = useState<ContactPageContent>({
        company_name: 'Akaydın Tarım',
        address: '',
        phone: '',
        whatsapp_phone: '',
        email: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        youtube_url: '',
        website: '',
        working_hours: '',
        map_embed: ''
    });
    const [loading, setLoading] = useState(false);

    const loadContactContent = async () => {
        try {
            setLoading(true);
            const data = await contactAPI.get();
            setContactContent(data);
        } catch (error) {
            console.error('İletişim bilgileri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateContactContent = async (newContent: ContactPageContent) => {
        try {
            setLoading(true);
            await contactAPI.update(newContent);
            setContactContent(newContent);
        } catch (error) {
            console.error('İletişim bilgileri güncellenirken hata:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        contactContent,
        loading,
        loadContactContent,
        updateContactContent
    };
};

// SEO yönetimi hook'u
export const useSEO = () => {
    const [seoSettings, setSeoSettings] = useState(null);
    const [pageSEOList, setPageSEOList] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSEOSettings = async () => {
        try {
            setLoading(true);
            const data = await seoAPI.getSettings();
            setSeoSettings(data);
        } catch (error) {
            console.error('SEO ayarları yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSEOSettings = async (newSettings: any) => {
        try {
            setLoading(true);
            await seoAPI.updateSettings(newSettings);
            setSeoSettings(newSettings);
        } catch (error) {
            console.error('SEO ayarları güncellenirken hata:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loadPageSEO = async () => {
        try {
            const data = await seoAPI.getAllPageSEO();
            setPageSEOList(data);
        } catch (error) {
            console.error('Sayfa SEO verileri yüklenirken hata:', error);
        }
    };

    return {
        seoSettings,
        pageSEOList,
        loading,
        loadSEOSettings,
        updateSEOSettings,
        loadPageSEO
    };
};
