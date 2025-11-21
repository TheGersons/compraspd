// components/notifications/NotificationContainer.tsx
import { useNotifications } from '../../context/NotificationContext';
import NotificationToast from './NotificationToast';

export default function NotificationContainer() {
  const { toasts } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <NotificationToast notification={toast} />
        </div>
      ))}
    </div>
  );
}