const API_BASE_URL = "http://localhost:3003/api";

// Genel API çağrısı fonksiyonu
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API çağrısı hatası:", error);
    throw error;
  }
}

// Dosya yükleme için özel fonksiyon
async function uploadFile(endpoint: string, formData: FormData) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    throw error;
  }
}

// HİZMETLER API
export const servicesAPI = {
  getAll: () => apiCall("/services"),
  create: (data: any) =>
    apiCall("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiCall(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiCall(`/services/${id}`, {
      method: "DELETE",
    }),
};

// ÜRÜNLER API
export const productsAPI = {
  getAll: () => apiCall("/products"),
  create: (formData: FormData) => uploadFile("/products", formData),
  update: (id: number, formData: FormData) => {
    const url = `${API_BASE_URL}/products/${id}`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then((res) => res.json());
  },
  delete: (id: number) =>
    apiCall(`/products/${id}`, {
      method: "DELETE",
    }),
};

// BLOG API
export const blogAPI = {
  getAll: () => apiCall("/blog-posts"),
  create: (formData: FormData) => uploadFile("/blog-posts", formData),
  update: (id: number, formData: FormData) => {
    const url = `${API_BASE_URL}/blog-posts/${id}`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then((res) => res.json());
  },
  delete: (id: number) =>
    apiCall(`/blog-posts/${id}`, {
      method: "DELETE",
    }),
  incrementView: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/blog-posts/${id}/view`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Blog view count güncellenemedi");
    return response.json();
  },
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/blog-posts/stats`);
    if (!response.ok) throw new Error("Blog istatistikleri alınamadı");
    return response.json();
  },
};

// HAKKIMIZDA API
export const aboutAPI = {
  get: () => apiCall("/about"),
  update: (formData: FormData) => {
    const url = `${API_BASE_URL}/about`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then((res) => res.json());
  },
  deleteImage: (imagePath: string) =>
    apiCall("/about/image", {
      method: "DELETE",
      body: JSON.stringify({ imagePath }),
    }),
};

// İLETİŞİM API
export const contactAPI = {
  get: () => apiCall("/contact"),
  update: (data: any) =>
    apiCall("/contact", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// HERO API
export const heroAPI = {
  getAll: () => apiCall("/hero"),
  create: (formData: FormData) => uploadFile("/hero", formData),
  update: (id: number, formData: FormData) => {
    const url = `${API_BASE_URL}/hero/${id}`;
    return fetch(url, {
      method: "PUT",
      body: formData,
    }).then((res) => res.json());
  },
  delete: (id: number) =>
    apiCall(`/hero/${id}`, {
      method: "DELETE",
    }),
  updateOrder: (items: { id: number; order: number }[]) =>
    apiCall("/hero/order", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};

// CONTACT MESSAGES API
export const contactMessagesAPI = {
  create: (messageData: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) =>
    apiCall("/contact/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
  getAll: () => apiCall("/contact/messages"),
  markAsRead: (id: number) =>
    apiCall(`/contact/messages/${id}/read`, {
      method: "PUT",
    }),
  delete: (id: number) =>
    apiCall(`/contact/messages/${id}`, {
      method: "DELETE",
    }),
};

// FINDIK FİYATLARI API
export const hazelnutPricesAPI = {
  get: () => apiCall("/hazelnut-prices"),
  getHistory: () => apiCall("/hazelnut-prices/history"),
  create: (priceData: {
    price: number;
    daily_change: number;
    change_percentage: number;
    source: "manual" | "scraped";
    update_mode?: "manual" | "automatic";
    scraping_enabled?: boolean;
    notes?: string;
  }) =>
    apiCall("/hazelnut-prices", {
      method: "POST",
      body: JSON.stringify(priceData),
    }),
  update: (priceData: {
    price: number;
    daily_change: number;
    change_percentage: number;
    source: "manual" | "scraped";
    update_mode?: "manual" | "automatic";
    scraping_enabled?: boolean;
    notes?: string;
  }) =>
    apiCall("/hazelnut-prices", {
      method: "PUT",
      body: JSON.stringify(priceData),
    }),
  scrape: () =>
    apiCall("/hazelnut-prices/scrape", {
      method: "POST",
    }),
  applyScraped: () =>
    apiCall("/hazelnut-prices/apply-scraped", {
      method: "POST",
    }),
};

// SEO API
export const seoAPI = {
  // SEO Settings
  getSettings: () => apiCall("/seo/settings"),
  updateSettings: (data: any) =>
    apiCall("/seo/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Page SEO
  getPageSEO: (pagePath: string) =>
    apiCall(`/seo/pages?path=${encodeURIComponent(pagePath)}`),
  getAllPageSEO: () => apiCall("/seo/pages"),
  createPageSEO: (data: any) =>
    apiCall("/seo/pages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePageSEO: (id: number, data: any) =>
    apiCall(`/seo/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePageSEO: (id: number) =>
    apiCall(`/seo/pages/${id}`, {
      method: "DELETE",
    }),

  // SEO Analysis
  analyzePage: (url: string) =>
    apiCall(`/seo/analyze?url=${encodeURIComponent(url)}`),

  // Sitemap
  generateSitemap: () =>
    apiCall("/seo/sitemap", {
      method: "POST",
    }),
  getSitemap: () => apiCall("/seo/sitemap"),

  // Robots.txt
  updateRobots: (content: string) =>
    apiCall("/seo/robots", {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  getRobots: () => apiCall("/seo/robots"),
};

// VISITOR ANALYTICS API
export const analyticsAPI = {
  // Session tracking
  createSession: (sessionData: any) =>
    apiCall("/analytics/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),

  updateSession: (sessionId: string, sessionData: any) =>
    apiCall(`/analytics/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(sessionData),
    }),

  // Page views
  trackPageView: (pageViewData: any) =>
    apiCall("/analytics/page-views", {
      method: "POST",
      body: JSON.stringify(pageViewData),
    }),

  // Visitor actions
  trackAction: (actionData: any) =>
    apiCall("/analytics/actions", {
      method: "POST",
      body: JSON.stringify(actionData),
    }),

  // Analytics dashboard data
  getDashboardStats: (dateRange?: { from: string; to: string }) => {
    const params = dateRange
      ? `?from=${dateRange.from}&to=${dateRange.to}`
      : "";
    return apiCall(`/analytics/dashboard${params}`);
  },

  // Detailed analytics
  getSessions: (params?: any) => {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiCall(`/analytics/sessions${queryParams}`);
  },

  getPageViews: (params?: any) => {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiCall(`/analytics/page-views${queryParams}`);
  },

  getPopularPages: (limit: number = 10) =>
    apiCall(`/analytics/popular-pages?limit=${limit}`),

  getActiveVisitors: () => apiCall("/analytics/active-visitors"),

  getDailyAnalytics: (dateRange: { from: string; to: string }) =>
    apiCall(`/analytics/daily?from=${dateRange.from}&to=${dateRange.to}`),

  // Real-time data
  getRealTimeStats: () => apiCall("/analytics/realtime"),

  // Real-time visitor activity
  getLiveVisitors: () => apiCall("/analytics/live-visitors"),

  // Current page views (last 5 minutes)
  getCurrentPageViews: () => apiCall("/analytics/current-pageviews"),

  // Recent visitor actions
  getRecentActions: (limit: number = 50) =>
    apiCall(`/analytics/recent-actions?limit=${limit}`),

  // Hourly stats for today
  getTodayHourlyStats: () => apiCall("/analytics/today-hourly"),

  // Traffic sources
  getTrafficSources: (days: number = 30) =>
    apiCall(`/analytics/traffic-sources?days=${days}`),

  // Device breakdown for real-time
  getDeviceBreakdown: () => apiCall("/analytics/device-breakdown"),

  // Device and browser stats
  getDeviceStats: (dateRange?: { from: string; to: string }) => {
    const params = dateRange
      ? `?from=${dateRange.from}&to=${dateRange.to}`
      : "";
    return apiCall(`/analytics/device-stats${params}`);
  },

  getBrowserStats: (dateRange?: { from: string; to: string }) => {
    const params = dateRange
      ? `?from=${dateRange.from}&to=${dateRange.to}`
      : "";
    return apiCall(`/analytics/browser-stats${params}`);
  },

  // Geographic stats
  getGeographicStats: (dateRange?: { from: string; to: string }) => {
    const params = dateRange
      ? `?from=${dateRange.from}&to=${dateRange.to}`
      : "";
    return apiCall(`/analytics/geographic-stats${params}`);
  },

  // Export data
  exportData: (
    format: "csv" | "json",
    dateRange: { from: string; to: string }
  ) =>
    apiCall(
      `/analytics/export?format=${format}&from=${dateRange.from}&to=${dateRange.to}`
    ),

  // Settings
  getSettings: () => apiCall("/analytics/settings"),

  updateSettings: (settings: any) =>
    apiCall("/analytics/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // Data cleanup
  cleanupOldData: (olderThanDays: number) =>
    apiCall("/analytics/cleanup", {
      method: "POST",
      body: JSON.stringify({ olderThanDays }),
    }),
};

export default {
  servicesAPI,
  productsAPI,
  blogAPI,
  aboutAPI,
  contactAPI,
  heroAPI,
  contactMessagesAPI,
  hazelnutPricesAPI,
  seoAPI,
  analyticsAPI,
};
