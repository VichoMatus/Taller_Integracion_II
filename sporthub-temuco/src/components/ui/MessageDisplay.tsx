/**
 * Componente para mostrar mensajes de error y éxito
 */

interface MessageDisplayProps {
  error?: string | null;
  success?: string | null;
  onClear?: () => void;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  error, 
  success, 
  onClear 
}) => {
  if (!error && !success) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {error && (
        <div 
          className="error-message"
          style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '10px',
            borderRadius: '5px',
            borderLeft: '4px solid #c53030',
            marginBottom: '10px'
          }}
        >
          {error}
        </div>
      )}
      
      {success && (
        <div 
          className="success-message"
          style={{
            backgroundColor: '#e6fffa',
            color: '#2d7d63',
            padding: '10px',
            borderRadius: '5px',
            borderLeft: '4px solid #38a169',
            marginBottom: '10px'
          }}
        >
          {success}
        </div>
      )}
    </div>
  );
};