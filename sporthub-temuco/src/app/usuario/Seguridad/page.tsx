'use client';

interface NotificationProps {
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function Notification({ title, message, date, read }: NotificationProps) {
  return (
    <div className={`notification ${read ? 'read' : 'unread'}`}>
      <div className="notification-header">
        <h4>{title}</h4>
        <span className="notification-date">{date}</span>
      </div>
      <p className="notification-message">{message}</p>
      {!read && <span className="notification-badge">Nuevo</span>}
    </div>
  );
}