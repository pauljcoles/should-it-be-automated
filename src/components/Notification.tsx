/**
 * Notification Component
 * 
 * Displays toast-style notifications for success, error, and info messages
 */

import { useEffect } from 'react';
import { useAppContext } from '../context';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Notification() {
  const { uiState, clearNotification } = useAppContext();

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (uiState.notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [uiState.notification, clearNotification]);

  if (!uiState.notification) return null;

  const { message, type } = uiState.notification;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border-brutal shadow-brutal-lg
          max-w-md ${getStyles()}
        `}
      >
        {getIcon()}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={clearNotification}
          className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
