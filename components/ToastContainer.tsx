import React from 'react';
import Toast from './Toast';
import type { Notification } from '../types';

interface ToastContainerProps {
    notifications: Notification[];
    onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{ transform: `translateY(${index * 80}px)` }}
                    className="transition-transform duration-300"
                >
                    <Toast notification={notification} onClose={onClose} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
