// It's best practice to define types that don't depend on runtime values from other files
// to avoid circular dependencies. Here we explicitly list the icon names.
export type ServiceIconName =
  | "Consulting"
  | "Processing"
  | "Fertilizer"
  | "Nutrition";

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: ServiceIconName;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images?: string[]; // Birden fazla resim için
  category: string;
  price?: number;
  isFeatured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content?: string;
  excerpt?: string;
  imageUrl: string;
  date: string;
  author: string;
  views?: number;
}

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  topPosts: Array<{
    title: string;
    views: number;
  }>;
}

// Hero content interface
export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  backgroundGradient: string;
  backgroundImage?: string;
  isActive: boolean;
  order: number;
}

export interface AboutPageContent {
  title?: string;
  content?: string;
  mission: string;
  vision: string;
  images?: string[]; // Çoklu görsel için array
  image?: string; // Geriye uyumluluk için
}

export interface ContactPageContent {
  company_name?: string;
  address: string;
  phone: string;
  whatsapp_phone?: string; // WhatsApp sipariş hattı
  email: string;
  website?: string;
  working_hours?: string;
  map_embed?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Dummy type for icon components
export interface IconProps {
  className?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

// Hazelnut Prices types
export interface HazelnutPrices {
  id: number;
  price: number;
  daily_change: number;
  change_percentage: number;
  source: "manual" | "scraped";
  scraped_price?: number;
  last_scraped_at?: string;
  update_mode?: "manual" | "automatic";
  scraping_enabled?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// SEO Settings Interface
export interface SEOSettings {
  id?: number;
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  twitter_card: "summary" | "summary_large_image" | "app" | "player";
  twitter_site: string;
  twitter_creator: string;
  canonical_url: string;
  robots_txt: string;
  google_analytics_id?: string;
  google_search_console?: string;
  facebook_pixel_id?: string;
  schema_organization: string;
  sitemap_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// Page-specific SEO Interface
export interface PageSEO {
  id?: number;
  page_path: string;
  page_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image?: string;
  canonical_url?: string;
  noindex: boolean;
  nofollow: boolean;
  created_at?: string;
  updated_at?: string;
}

// SEO Analysis Interface
export interface SEOAnalysis {
  page_url: string;
  title_length: number;
  description_length: number;
  keywords_density: { [key: string]: number };
  has_meta_description: boolean;
  has_og_tags: boolean;
  has_canonical: boolean;
  images_without_alt: number;
  internal_links: number;
  external_links: number;
  page_speed_score?: number;
  mobile_friendly: boolean;
  recommendations: string[];
}

// Visitor Analytics Interfaces
export interface VisitorSession {
  id: number;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser?: string;
  operating_system?: string;
  first_visit_at: string;
  last_activity_at: string;
  total_page_views: number;
  session_duration: number;
  is_bounce: boolean;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: number;
  session_id: string;
  page_path: string;
  page_title?: string;
  referrer?: string;
  time_on_page: number;
  scroll_percentage: number;
  exit_page: boolean;
  viewed_at: string;
}

export interface VisitorAction {
  id: number;
  session_id: string;
  action_type:
    | "click"
    | "scroll"
    | "form_submit"
    | "download"
    | "external_link"
    | "search"
    | "contact";
  element_selector?: string;
  element_text?: string;
  page_path: string;
  additional_data?: any;
  action_at: string;
}

export interface DailyAnalytics {
  id: number;
  date: string;
  total_sessions: number;
  unique_visitors: number;
  total_page_views: number;
  avg_session_duration: number;
  bounce_rate: number;
  top_pages: any;
  top_referrers: any;
  device_breakdown: any;
  browser_breakdown: any;
  country_breakdown: any;
  created_at: string;
  updated_at: string;
}

export interface PopularPage {
  id: number;
  page_path: string;
  page_title?: string;
  total_views: number;
  unique_views: number;
  avg_time_on_page: number;
  bounce_rate: number;
  last_updated: string;
}

export interface ActiveVisitor {
  id: number;
  session_id: string;
  current_page?: string;
  last_activity: string;
}

export interface AnalyticsSettings {
  id: number;
  analytics_enabled: boolean;
  track_ip_addresses: boolean;
  data_retention_days: number;
  exclude_ips?: string;
  exclude_user_agents?: string;
  privacy_mode: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics Dashboard Stats
export interface AnalyticsStats {
  total_sessions: number;
  unique_visitors: number;
  total_page_views: number;
  avg_session_duration: number;
  bounce_rate: number;
  current_active_visitors: number;
  top_pages: PopularPage[];
  recent_visitors: VisitorSession[];
  device_stats: { [key: string]: number };
  browser_stats: { [key: string]: number };
  country_stats: { [key: string]: number };
  traffic_sources: { [key: string]: number };
  daily_sessions: { date: string; sessions: number }[];
  daily_page_views: { date: string; views: number }[];
}
