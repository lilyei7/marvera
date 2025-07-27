import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeNotification } from '../store/slices/notificationSlice';
import ToastNotification from './ToastNotification';

const NotificationManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state: any) => state.notifications?.notifications || []);

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification: any) => (
        <ToastNotification
          key={notification.id}
          show={true}
          message={notification.message}
          type={notification.type}
          onClose={() => handleRemoveNotification(notification.id)}
          duration={notification.duration || 3000}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
