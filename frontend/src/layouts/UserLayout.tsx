
import { useAuth } from '../auth/AuthContext';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Layers3,
  UserRound,
  Settings,
  LogOut,
  PanelLeftClose,
  Box,
} from 'lucide-react';
import { useState } from 'react';
import './UserLayout.css';

export default function UserLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`user-layout ${collapsed ? 'collapsed' : ''}`}>

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Box size={22} />
          </div>

          {!collapsed && (
            <span>OPEN 3D RENDER<span>.</span></span>
          )}
        </div>

        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Contraer menú"
        >
          <PanelLeftClose size={18} />
        </button>

        <div className="sidebar-section">
          {!collapsed && <p>ESPACIO DE TRABAJO</p>}

          <nav>
            <NavLink to="/app" end title="Dashboard">
              <LayoutDashboard size={19} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink to="/app/projects" title="Proyectos">
              <FolderKanban size={19} />
              {!collapsed && <span>Proyectos</span>}
            </NavLink>

            <NavLink to="/app/jobs" title="Mis renders">
              <Layers3 size={19} />
              {!collapsed && <span>Tus renders</span>}
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-section">
            {!collapsed && <p>CUENTA</p>}

            <nav>
              <NavLink to="/app/profile" title="Mi perfil">
                <UserRound size={19} />
                {!collapsed && <span>Mi perfil</span>}
              </NavLink>

              <NavLink to="/app/settings" title="Configuración">
                <Settings size={19} />
                {!collapsed && <span>Configuración</span>}
              </NavLink>
            </nav>
          </div>

          <button 
          onClick={handleLogout} 
          className="logout-button"
          aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>

      </aside>

      <div className="main-area">

        <header className="dashboard-header">
          <div>
            <span className="header-label">ESCUELA SUPERIOR DE DISEÑO</span>
          </div>

          <div className="header-user">
            <div className="user-avatar">LM</div>
            {!collapsed && (
              <div className="user-details">
                <strong>Usuario de prueba</strong>
                <span>Estudiante</span>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
