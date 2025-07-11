import React from 'react';
import { setAnalyticsConsent } from '../hooks/useAnalyticsTracking';

interface CookieConsentBannerProps {
    onAccept: () => void;
    onDecline: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept, onDecline }) => {
    const handleAccept = () => {
        setAnalyticsConsent(true);
        onAccept();
    };

    const handleDecline = () => {
        setAnalyticsConsent(false);
        onDecline();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">🍪 Çerez Bildirimi</h3>
                    <p className="text-sm text-gray-300">
                        Web sitemizi daha iyi hale getirmek ve size daha iyi hizmet sunabilmek için çerezler kullanıyoruz.
                        Site ziyaretinizin analiz edilmesi ve iyileştirilmesi için analitik çerezlere izin verir misiniz?
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Kişisel verileriniz işlenmez, sadece anonim istatistikler toplanır.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                    >
                        Reddet
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                        Kabul Et
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
