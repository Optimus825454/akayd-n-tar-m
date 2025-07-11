import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOSettings, PageSEO } from '../types';

interface SEOHeadProps {
    pageTitle?: string;
    pageDescription?: string;
    pageKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    nofollow?: boolean;
    structuredData?: any;
    seoSettings?: SEOSettings;
    pageSEO?: PageSEO;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    pageTitle,
    pageDescription,
    pageKeywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    canonicalUrl,
    noindex = false,
    nofollow = false,
    structuredData,
    seoSettings,
    pageSEO
}) => {
    // Sayfa özel SEO verilerini önceliklendir, yoksa genel ayarları kullan
    const finalTitle = pageTitle || pageSEO?.page_title || seoSettings?.site_title || 'Akaydın Tarım';
    const finalDescription = pageDescription || pageSEO?.meta_description || seoSettings?.site_description || '';
    const finalKeywords = pageKeywords || pageSEO?.meta_keywords || seoSettings?.site_keywords || '';
    const finalOgTitle = ogTitle || pageSEO?.og_title || seoSettings?.og_title || finalTitle;
    const finalOgDescription = ogDescription || pageSEO?.og_description || seoSettings?.og_description || finalDescription;
    const finalOgImage = ogImage || pageSEO?.og_image || seoSettings?.og_image || '';
    const finalOgUrl = ogUrl || seoSettings?.og_url || '';
    const finalCanonicalUrl = canonicalUrl || pageSEO?.canonical_url || seoSettings?.canonical_url || '';
    const finalNoindex = noindex || pageSEO?.noindex || false;
    const finalNofollow = nofollow || pageSEO?.nofollow || false;

    // Robots meta tag oluştur
    const robotsContent = [];
    if (finalNoindex) robotsContent.push('noindex');
    if (finalNofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) robotsContent.push('index', 'follow');

    return (
        <Helmet>
            {/* Temel Meta Tags */}
            <title>{finalTitle}</title>
            {finalDescription && <meta name="description" content={finalDescription} />}
            {finalKeywords && <meta name="keywords" content={finalKeywords} />}
            {seoSettings?.site_author && <meta name="author" content={seoSettings.site_author} />}

            {/* Robots */}
            <meta name="robots" content={robotsContent.join(', ')} />

            {/* Canonical URL */}
            {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}

            {/* Open Graph Tags */}
            {finalOgTitle && <meta property="og:title" content={finalOgTitle} />}
            {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
            {finalOgImage && <meta property="og:image" content={finalOgImage} />}
            {finalOgUrl && <meta property="og:url" content={finalOgUrl} />}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={seoSettings?.site_title || 'Akaydın Tarım'} />

            {/* Twitter Cards */}
            {seoSettings?.twitter_card && <meta name="twitter:card" content={seoSettings.twitter_card} />}
            {seoSettings?.twitter_site && <meta name="twitter:site" content={seoSettings.twitter_site} />}
            {seoSettings?.twitter_creator && <meta name="twitter:creator" content={seoSettings.twitter_creator} />}
            {finalOgTitle && <meta name="twitter:title" content={finalOgTitle} />}
            {finalOgDescription && <meta name="twitter:description" content={finalOgDescription} />}
            {finalOgImage && <meta name="twitter:image" content={finalOgImage} />}

            {/* Mobile & Responsive */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="format-detection" content="telephone=no" />

            {/* Language */}
            <meta httpEquiv="content-language" content="tr" />
            <meta name="language" content="Turkish" />

            {/* Charset */}
            <meta charSet="utf-8" />

            {/* Google Analytics */}
            {seoSettings?.google_analytics_id && (
                <>
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${seoSettings.google_analytics_id}`} />
                    <script>
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${seoSettings.google_analytics_id}');
            `}
                    </script>
                </>
            )}

            {/* Facebook Pixel */}
            {seoSettings?.facebook_pixel_id && (
                <script>
                    {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${seoSettings.facebook_pixel_id}');
            fbq('track', 'PageView');
          `}
                </script>
            )}

            {/* Google Search Console */}
            {seoSettings?.google_search_console && (
                <meta name="google-site-verification" content={seoSettings.google_search_console} />
            )}

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}

            {/* Schema Organization */}
            {seoSettings?.schema_organization && (
                <script type="application/ld+json">
                    {seoSettings.schema_organization}
                </script>
            )}

            {/* Favicon */}
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

            {/* Theme Color */}
            <meta name="theme-color" content="#16a34a" />
            <meta name="msapplication-TileColor" content="#16a34a" />
        </Helmet>
    );
};

export default SEOHead;
