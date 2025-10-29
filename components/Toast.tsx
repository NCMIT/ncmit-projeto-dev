import React, { useEffect, useState } from 'react';
import type { Toast } from '../types';
import { SuccessIcon, ErrorIcon, InfoIcon, CloseIcon } from './common/Icon';

const ICONS = {
    success: <SuccessIcon className="w-6 h-6 text-green-500" />,
    error: <ErrorIcon className="w-6 h-6 text-red-500" />,
    info: <InfoIcon className="w-6 h-6 text-blue-500" />,
};

const THEME_CLASSES = {
    success: 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600',
    error: 'bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-600',
    info: 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600',
};

interface ToastNotificationProps {
    toast: Toast;
    onClose: (id: number) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        setIsVisible(true);

        const timer = setTimeout(() => {
            handleClose();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, []);
    
    const handleClose = () => {
        setIsVisible(false);
        // Allow time for exit animation before removing from DOM
        setTimeout(() => onClose(toast.id), 300);
    };

    return (
        <div
            className={`
                flex items-start p-4 mt-4 w-full max-w-sm overflow-hidden rounded-lg shadow-lg
                border-l-4 transition-all duration-300 ease-in-out
                ${THEME_CLASSES[toast.type]}
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
            role="alert"
        >
            <div className="flex-shrink-0">
                {ICONS[toast.type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {toast.message}
                </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button
                    onClick={handleClose}
                    className="inline-flex rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    <span className="sr-only">Close</span>
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};


interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm flex flex-col-reverse">
            {toasts.map((toast) => (
                <ToastNotification
                    key={toast.id}
                    toast={toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;