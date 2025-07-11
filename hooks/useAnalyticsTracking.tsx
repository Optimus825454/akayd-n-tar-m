import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsAPI } from '../services/api';

interface AnalyticsData {
    sessionId: string | null;
    deviceInfo: {
        userAgent: string;
        screenResolution: string;
        language: string;
        timezone: string;
        deviceType: string;
        browser: string;
        os: string;
    };
    isTrackingEnabled: boolean;
}

// GDPR Cookie Consent Functions
const ANALYTICS_CONSENT_KEY = 'analytics_consent';
const SESSION_ID_KEY = 'analytics_session_id';

export const hasAnalyticsConsent = (): boolean => {
    try {
        return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
    } catch {
        return false;
    }
};

export const setAnalyticsConsent = (consent: boolean): void => {
    try {
        if (consent) {
            localStorage.setItem(ANALYTICS_CONSENT_KEY, 'true');
        } else {
            localStorage.removeItem(ANALYTICS_CONSENT_KEY);
            localStorage.removeItem(SESSION_ID_KEY);
            // Clear existing analytics cookies/data
        }
    } catch {
        // Handle localStorage not available
    }
};

export const showCookieConsentBanner = (): boolean => {
    try {
        return localStorage.getItem(ANALYTICS_CONSENT_KEY) === null;
    } catch {
        return true;
    }
};

const generateSessionId = (): string => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
        return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
        return 'mobile';
    }
    return 'desktop';
};

const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Browser detection
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        browser = 'Opera';
    }

    // OS detection
    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
    }

    return { browser, os };
};

// Get visitor's geographic information (simplified)
const getGeographicInfo = async () => {
    try {
        // Use browser locale as fallback instead of external API
        const locale = navigator.language || navigator.languages?.[0] || 'tr-TR';
        const country = locale.split('-')[1] || 'TR';

        return {
            country: country.toUpperCase(),
            city: 'Unknown'
        };
    } catch (error) {
        console.error('Geographic info fetch failed:', error);
        return {
            country: 'Unknown',
            city: 'Unknown'
        };
    }
};

export const useAnalyticsTracking = () => {
    const location = useLocation();
    const sessionIdRef = useRef<string>(
        sessionStorage.getItem('analytics_session_id') || generateSessionId()
    );
    const pageStartTime = useRef<number>(Date.now());
    const lastScrollPercentage = useRef<number>(0);
    const isExiting = useRef<boolean>(false);
    const sessionInitialized = useRef<boolean>(false);
    const sessionInitializing = useRef<boolean>(false);
    const lastTrackedPath = useRef<string>('');
    const isTrackingEnabled = hasAnalyticsConsent();

    // Initialize session only if consent is given and not already initialized
    useEffect(() => {
        if (!isTrackingEnabled || sessionInitialized.current || sessionInitializing.current) return;

        sessionInitializing.current = true;
        initializeSession().finally(() => {
            sessionInitializing.current = false;
        });

        // Set up event listeners
        const handleBeforeUnload = () => {
            trackPageExit();
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                trackPageExit();
            }
        };

        const handleScroll = () => {
            trackScrolling();
        };

        const handleClick = (event: MouseEvent) => {
            trackClick(event);
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClick);

        // Store session ID
        sessionStorage.setItem('analytics_session_id', sessionIdRef.current);

        return () => {
            trackPageExit();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClick);
        };
    }, [isTrackingEnabled]);

    // Track page views only if consent is given and path changed
    useEffect(() => {
        if (!isTrackingEnabled) return;

        const currentPath = location.pathname + location.search;
        if (lastTrackedPath.current === currentPath) return;

        // Wait for session to be initialized before tracking page views
        const trackWhenReady = async () => {
            // Wait for session initialization to complete
            while (sessionInitializing.current) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            trackPageView();
            lastTrackedPath.current = currentPath;
            pageStartTime.current = Date.now();
            lastScrollPercentage.current = 0;
            isExiting.current = false;
        };

        trackWhenReady();
    }, [location.pathname, isTrackingEnabled]);

    const initializeSession = async () => {
        if (!hasAnalyticsConsent() || sessionInitialized.current) return;

        try {
            const geoInfo = await getGeographicInfo();
            const { browser, os } = getBrowserInfo();

            const sessionData = {
                session_id: sessionIdRef.current,
                ip_address: null, // Will be set by server
                user_agent: navigator.userAgent,
                country: geoInfo.country,
                city: geoInfo.city,
                device_type: getDeviceType(),
                browser: browser,
                operating_system: os,
                referrer: document.referrer || null,
                utm_source: new URLSearchParams(window.location.search).get('utm_source'),
                utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
                utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
            };

            await analyticsAPI.createSession(sessionData);
            sessionInitialized.current = true;
        } catch (error) {
            // Failed to initialize analytics session - will be created automatically on first page view
            sessionInitialized.current = true; // Set to true to prevent infinite retries
        }
    };

    const trackPageView = async () => {
        if (!hasAnalyticsConsent()) return;

        try {
            const pageViewData = {
                session_id: sessionIdRef.current,
                page_path: location.pathname + location.search,
                page_title: document.title,
                referrer: document.referrer || null,
            };

            await analyticsAPI.trackPageView(pageViewData);
        } catch (error) {
            // Failed to track page view
        }
    };

    const trackPageExit = async () => {
        if (isExiting.current || !hasAnalyticsConsent()) return;
        isExiting.current = true;

        try {
            const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);

            // Update the current page view with time spent and scroll percentage
            const pageViewData = {
                session_id: sessionIdRef.current,
                page_path: location.pathname + location.search,
                time_on_page: timeOnPage,
                scroll_percentage: lastScrollPercentage.current,
                exit_page: true
            };

            // Use sendBeacon for better reliability on page unload
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(pageViewData)], { type: 'application/json' });
                navigator.sendBeacon('http://localhost:3003/api/analytics/page-views/update', blob);
            } else {
                await analyticsAPI.trackPageView(pageViewData);
            }

            // Update session duration
            const sessionUpdateData = {
                last_activity_at: new Date().toISOString(),
                session_duration: timeOnPage
            };

            await analyticsAPI.updateSession(sessionIdRef.current, sessionUpdateData);
        } catch (error) {
            // Failed to track page exit
        }
    };

    const trackScrolling = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

        if (scrollPercentage > lastScrollPercentage.current) {
            lastScrollPercentage.current = Math.min(scrollPercentage, 100);
        }

        // Track significant scroll milestones
        if (scrollPercentage > 0 && scrollPercentage % 25 === 0 && scrollPercentage > lastScrollPercentage.current - 25) {
            trackAction('scroll', {
                element_selector: 'window',
                additional_data: {
                    scroll_percentage: scrollPercentage
                }
            });
        }
    };

    const trackClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target) return;

        // Get element selector
        let selector = target.tagName.toLowerCase();
        if (target.id) {
            selector += `#${target.id}`;
        }
        if (target.className) {
            selector += `.${target.className.split(' ').join('.')}`;
        }

        // Get element text
        const elementText = target.innerText || target.textContent || target.getAttribute('alt') || '';

        // Determine action type
        let actionType: 'click' | 'external_link' | 'download' | 'contact' = 'click';

        if (target.tagName === 'A') {
            const href = target.getAttribute('href') || '';
            if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                actionType = 'contact';
            } else if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                actionType = 'external_link';
            } else if (href.includes('.pdf') || href.includes('.doc') || href.includes('.zip')) {
                actionType = 'download';
            }
        }

        trackAction(actionType, {
            element_selector: selector,
            element_text: elementText.substring(0, 255), // Limit text length
            additional_data: {
                tag_name: target.tagName,
                href: target.getAttribute('href'),
                click_x: event.clientX,
                click_y: event.clientY
            }
        });
    };

    const trackAction = async (
        actionType: 'click' | 'scroll' | 'form_submit' | 'download' | 'external_link' | 'search' | 'contact',
        data: {
            element_selector?: string;
            element_text?: string;
            additional_data?: any;
        }
    ) => {
        if (!hasAnalyticsConsent()) return;

        try {
            const actionData = {
                session_id: sessionIdRef.current,
                action_type: actionType,
                element_selector: data.element_selector,
                element_text: data.element_text,
                page_path: location.pathname + location.search,
                additional_data: data.additional_data
            };

            await analyticsAPI.trackAction(actionData);
        } catch (error) {
            console.error('Failed to track action:', error);
        }
    };

    // Public methods for manual tracking
    const trackFormSubmit = useCallback((formElement: HTMLFormElement) => {
        const formData = new FormData(formElement);
        const formFields = Array.from(formData.keys());

        trackAction('form_submit', {
            element_selector: formElement.id ? `#${formElement.id}` : 'form',
            additional_data: {
                form_fields: formFields,
                form_action: formElement.action,
                form_method: formElement.method
            }
        });
    }, []);

    const trackSearch = useCallback((query: string, resultsCount?: number) => {
        trackAction('search', {
            element_selector: 'search',
            element_text: query,
            additional_data: {
                search_query: query,
                results_count: resultsCount
            }
        });
    }, []);

    const trackCustomEvent = useCallback((eventName: string, eventData?: any) => {
        trackAction('click', {
            element_selector: 'custom_event',
            element_text: eventName,
            additional_data: {
                event_name: eventName,
                event_data: eventData
            }
        });
    }, []);

    return {
        trackAction,
        trackFormSubmit,
        trackSearch,
        trackCustomEvent,
        trackPageView,
        initializeSession,
        sessionId: sessionIdRef.current,
        isTrackingEnabled: hasAnalyticsConsent(),
        hasConsent: hasAnalyticsConsent,
        analytics: {
            isTrackingEnabled: hasAnalyticsConsent()
        }
    };
};

export default useAnalyticsTracking;
