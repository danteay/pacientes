import React from 'react';
import { Notification, NotificationType } from '../../../context/NotificationContext';

/**
 * Notification Toast Molecule
 *
 * Displays notifications to the user
 */

export interface NotificationToastProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onClose }) => {
  const getNotificationClass = (type: NotificationType): string => {
    const typeMap: Record<NotificationType, string> = {
      success: 'is-success',
      error: 'is-danger',
      warning: 'is-warning',
      info: 'is-info',
    };
    return typeMap[type];
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${getNotificationClass(notification.type)} mb-2`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <button className="delete" onClick={() => onClose(notification.id)}></button>
          {notification.message}
        </div>
      ))}
    </div>
  );
};
