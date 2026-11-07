import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Eye,
  EyeOff,
  //Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Dashboard from './features/dashboard/Dashboard';
import Jobs from './features/jobs/Jobs';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se ha podido iniciar sesión'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">

      {/* HEADER */}
      <header className="site-header">
        <a className="brand" href="/" aria-label="Render Farm inicio">
          <span className="brand-symbol">
            <Box size={23} strokeWidth={1.7} />
          </span>
          <span className="brand-title">
            OPEN 3D RENDER<span>.</span>
          </span>
        </a>

        <div className="header-info">
          <span>INFRAESTRUCTURA DIGITAL</span>
          <span className="header-separator">/</span>
          <span>ESCUELA SUPERIOR DE DISEÑO DE MADRID</span>
        </div>

        <a className="header-link" href="https://esdmadrid.es">
          LA ESCUELA <ArrowUpRight size={15} />
        </a>
      </header>

      {/* MAIN CONTENT */}
      <div className="main-layout">

        {/* EDITORIAL SIDE */}
        <section className="editorial">

          <div className="editorial-topline">
            <span>PLATAFORMA DE RENDERIZADO 3D</span>
            <span>001 — 026</span>
          </div>

          <div className="editorial-copy">
           

            <h1>
              Renderiza proyectos 3D
              <br />
              de forma <span>compartida.</span>
            </h1>

            <p className="editorial-description">
              Un espacio de trabajo compartido para
              experimentar y materializar imágenes y 
              animaciones.
            </p>
          </div>

          {/* ORIGINAL CSS ARTWORK */}
          <div className="artwork">
            <div className="artwork-index">FIG. 01 / DIGITAL MATTER</div>

            <div className="artwork-scene">
              <div className="artwork-ring ring-one" />
              <div className="artwork-ring ring-two" />
              <div className="artwork-orb" />
              <div className="artwork-block" />
              <div className="artwork-line" />
              <span className="artwork-cross cross-one">+</span>
              <span className="artwork-cross cross-two">+</span>
            </div>

            <div className="artwork-caption">
              <span>EXPLORACIÓN FORMAL</span>
              <span>3D / RENDER / DESIGN</span>
            </div>
          </div>

          <div className="editorial-bottom">
            <span>DISEÑO · TECNOLOGÍA · EXPERIMENTACIÓN</span>
            <span>MADE FOR CREATORS</span>
          </div>
        </section>

        {/* LOGIN SIDE */}
        <section className="access-section">

          <div className="access-topline">
            <span>ÁREA PRIVADA</span>
            <span className="access-number">01 / 02</span>
          </div>

          <div className="access-content">
            <p className="eyebrow">BIENVENIDO/A</p>

            <h2>
              Accede<span>.</span>
            </h2>

            <p className="access-description">
              Identifícate para acceder a los recursos
              de renderizado de la escuela.
            </p>

            <div className="access-security">
              <ShieldCheck size={16} />
              <span>Acceso exclusivo para usuarios autorizados</span>
              <p></p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">
                  USUARIO
                </label>

                <div className="input-container">
                  <Mail size={17} />

                  <input
                    id="email"
                    type="text"
                    placeholder="Introduce tu usuario"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">CONTRASEÑA</label>

                <div className="input-container">
                  <LockKeyhole size={17} />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Introduce tu contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="visibility-button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />
                    }
                  </button>
                </div>
              </div>

              <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting ? 'Accediendo...' : 'Entrar en la plataforma'}
                </span>
                <ArrowRight size={19} />
              </button>
            </form>
            {error && (
              <p role="alert" className="login-error">
                {error}
              </p>
            )}

            {/* <div className="alternative">
              <span />
              <p>O UTILIZA TU CERTIFICADO DIGITAL</p>
              <span />
            </div>

            <button className="certificate-button" type="button">
              <Fingerprint size={22} strokeWidth={1.6} />
              <span>Acceder con certificado digital</span>
              <ArrowUpRight size={17} />
            </button> */}

            


            
          </div>

          <div className="access-bottom">
            <span>¿PROBLEMAS DE ACCESO?</span>
            <a href="https://esdmadrid.es/contacto">
              CONTACTA CON LA ESCUELA <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div>
          <span className="footer-mark">O3DR.</span>
          <span>OPEN 3D RENDER · ESD MADRID</span>
        </div>

       

        <span>PLATAFORMA DE USO ACADÉMICO</span>
      </footer>

    </main>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. MIENTRAS CARGA LA SESIÓN (F5): Esperar antes de decidir a qué ruta ir
  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        background: '#111411',
        color: '#36E452',
        fontFamily: 'monospace',
        fontSize: '14px',
        letterSpacing: '1px'
      }}>
        CARGANDO SESIÓN...
      </div>
    );
  }

  return (
    <Routes>
      {/* 2. RUTA DE LOGIN (Si ya está autenticado y entra a "/", redirigir automáticamente a /app) */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/app" replace /> : <Login />
        }
      />

      {/* 3. RUTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<UserLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
      </Route>

      {/* 4. CUALQUIER OTRA RUTA: Redirigir a /app si hay sesión o a / si no la hay */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/app" : "/"} replace />}
      />
    </Routes>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
