import Link from 'next/link';
import '../../Login.css';

export default function RegistroPage() {
  return (
    <div>
      <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1 className="header-logo">SportHub</h1>
      </header>
      <div className="login-container">
        <div className="login-form">
          <div className="login-left">
            <h1>Registro</h1>
            <form>
              <label htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" />
              <label htmlFor="apellido">Apellido</label>
              <input type="text" id="apellido" />
              <label htmlFor="email">Email</label>
              <input type="email" id="email" />
              <label htmlFor="password">Contraseña</label>
              <div className="password-container">
                <input type="password" id="password" />
              </div>
              <label htmlFor="confirm-password">Confirmar contraseña</label>
              <div className="password-container">
                <input type="password" id="confirm-password" />
              </div>
              <button type="submit">Crear cuenta</button>
            </form>
            <div className="or">o</div>
            <button className="google-btn">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
              Continuar con Google
            </button>
            <div className="signup">
              Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
            </div>
          </div>
          <div className="login-right">
            <img src="/imagenes/logo_sporthub.jpg" alt="Sporthub logo" />
          </div>
        </div>
      </div>
    </div>
  );
}
