import React, { useEffect } from 'react';
import type { Notification } from '../types';

interface ToastProps {
    notification: Notification;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
    }, [notification.id, notification.duration, onClose]);

    const getTypeStyles = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-500 border-green-600';
            case 'error':
                return 'bg-red-500 border-red-600';
            case 'warning':
                return 'bg-yellow-500 border-yellow-600';
            case 'info':
                return 'bg-blue-500 border-blue-600';
            default:
                return 'bg-gray-500 border-gray-600';
        }
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 min-w-80 max-w-md p-4 rounded-lg shadow-lg text-white border-l-4 ${getTypeStyles()} transform transition-all duration-300 ease-in-out`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <span className="text-xl font-bold">{getIcon()}</span>
                </div>
                <div className="flex-grow">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                </div>
                <button
                    onClick={() => onClose(notification.id)}
                    className="flex-shrink-0 ml-3 text-white hover:text-gray-200 transition-colors"
                >
                    <span className="text-lg">×</span>
                </button>
            </div>
        </div>
    );
};

export default Toast;
