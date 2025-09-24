import Link from 'next/link';
import '../Login.css';

export default function LoginPage() {
  return (
    <div>
      <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1 className="header-logo">SportHub</h1>
      </header>
      <div className="login-container">
        <div className="login-form">
          <div className="login-left">
            <h1>Inicio Sesión</h1>
            <p>Inicie sesión para continuar con su cuenta</p>
            <form>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" />
              <label htmlFor="password">Contraseña</label>
              <div className="password-container">
                <input type="password" id="password" />
              </div>
              <button type="submit">Iniciar sesión</button>
            </form>
            <div className="or">o</div>
            <button className="google-btn">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
              Iniciar sesión con Google
            </button>
            <div className="signup">
              No tienes una cuenta? <Link href="/login/registro">Crea una</Link>
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
