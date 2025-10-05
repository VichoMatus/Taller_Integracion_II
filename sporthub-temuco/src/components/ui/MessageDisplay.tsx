/**
 * Componente para mostrar mensajes de error y éxito
 */

interface MessageDisplayProps {
  error?: string | null;
  success?: string | null;
  showVerification?: boolean;
  onClear?: () => void;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  error, 
  success, 
  showVerification,
  onClear 
}) => {
  if (showVerification) {
    return (
      <div 
        className="verification-message"
        style={{
          backgroundColor: '#e6f7ff',
          color: '#0056b3',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #b3d9ff',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📧</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>
          ¡Registro Exitoso!
        </h3>
        <p style={{ margin: '0 0 15px 0', lineHeight: '1.5' }}>
          Se ha enviado un correo electrónico para verificar tu cuenta. 
          Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.
        </p>
        <div 
          style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            color: '#666',
            border: '1px solid #ddd'
          }}
        >
          <strong>Nota:</strong> Si no encuentras el correo, revisa tu carpeta de spam.
        </div>
      </div>
    );
  }

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