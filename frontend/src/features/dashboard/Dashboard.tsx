
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, type DashboardSummary } from './Dashboard.api';
import { downloadRenderJob } from '../jobs/Jobs.api';
//import type { CSSProperties } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Box,
  CheckCircle2, 
  Clock3,
  Cpu,
  Download,
  // Layers3,
  Plus,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';

// const projects = [
//   {
//     name: 'Proyecto de tipografía',
//     category: 'TIPOGRAFIA',
//     renders: 8,
//     updated: 'Hace 20 minutos',
//     color: '#36E452',
//   },
//   {
//     name: 'Diseño de producto',
//     category: 'DISEÑO DE PRODUCTO',
//     renders: 5,
//     updated: 'Ayer',
//     color: '#D8A7FF',
//   },
//   {
//     name: 'Espacio experimental',
//     category: 'EXPERIMENTACIÓN',
//     renders: 5,
//     updated: 'Hace 3 días',
//     color: '#E9B85D',
//   },
// ];



export default function Dashboard() {

  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Error cargando el dashboard:', err);
        setError('No se pudieron obtener los datos del servidor.');
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) return <div className="dashboard-loading">Cargando métricas...</div>;
  if (error || !summary) return <div className="dashboard-error">{error}</div>;

  const { stats, recent_jobs } = summary;

  return (
    <div className="dashboard">

      {/* PAGE INTRODUCTION */}
      <section className="dashboard-intro">
        <div>
          <p className="dashboard-eyebrow">
            ESPACIO DE TRABAJO / 001
          </p>

          <h1>
            Tu espacio de
            <br />
            trabajo<span>.</span>
          </h1>

          <p className="dashboard-subtitle">
            Gestiona tus proyectos, revisa tus estadísticas
            y supervisa tu actividad.
          </p>
        </div>

        <div className="dashboard-date">
          <span>OPEN 3D RENDER</span>
          <span>ÁREA DE USUARIO</span>
        </div>
      </section>

      {/* NEW RENDER */}
      <section className="new-render-banner">
        <div className="new-render-copy">
          <p>¿QUÉ VAMOS A CREAR HOY?</p>
          <h2>Un nuevo render<span>.</span></h2>
          <span>
            Envía tu proyecto y deja que la infraestructura
            se encargue del procesamiento.
          </span>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/app/jobs')}
        >
          <Plus size={19} />
          Nuevo trabajo
          <ArrowUpRight size={17} />
        </button>

        <div className="banner-decoration">O3DR.</div>
      </section>

      {/* STATISTICS */}
      <section className="stats-section">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">TU ACTIVIDAD</p>
            <h2>Resumen<span>.</span></h2>
            <div className="stat-card-top">
              <Box size={18} />
              <span>TOTAL TRABAJOS</span>
              <strong>{stats.total}</strong>
              <p>Activos, en cola y completados</p>
            </div>
          </div>

          <span className="section-index">01 / 03</span>
        </div>

        <div className="stats-grid">

          <article className="stat-card">
            <div className="stat-card-top">
              <span>TRABAJOS EN COLA</span>
              <Clock3 size={18} />
            </div>
            <strong>{stats.queued}</strong>
            <p>Pendientes de procesamiento</p>
          </article>

          <article className="stat-card">
            <div className="stat-card-top">
              <span>RENDERS ACTIVOS</span>
              <RefreshCw size={18} />
            </div>
            <strong>{stats.processing}</strong>
            <p>Procesándose actualmente</p>
            
          </article>

          <article className="stat-card">
            <div className="stat-card-top">
              <span>COMPLETADOS</span>
              <CheckCircle2 size={18} />
            </div>
            <strong>{stats.completed}</strong>
            <p>Trabajos finalizados</p>
          </article>

        </div>
      </section>

      {/* PROJECTS */}
      {/* <section className="projects-section">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">TRABAJO PERSONAL</p>
            <h2>Mis proyectos<span>.</span></h2>
          </div>

          <button className="text-link" type="button">
            Ver todos <ArrowRight size={16} />
          </button>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <article className="project-card" key={project.name}>
              <div
                className="project-artwork"
                style={{ '--project-color': project.color } as CSSProperties}
              >
                <span className="project-number">
                  0{index + 1}
                </span>

                <div className="project-shape">
                  <div />
                </div>

                <ArrowUpRight size={18} className="project-arrow" />
              </div>

              <div className="project-info">
                <span>{project.category}</span>
                <h3>{project.name}</h3>

                <div className="project-meta">
                  <span>
                    <Layers3 size={14} />
                    {project.renders} renders
                  </span>

                  <span>{project.updated}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section> */}

      {/* RECENT JOBS */}
      <section className="jobs-section">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">PROCESAMIENTO</p>
            <h2>Actividad reciente<span>.</span></h2>
          </div>

          <button 
            className="text-link" 
            type="button"
            onClick={() => navigate('/app/jobs')}
          >
            Ver historial <ArrowRight size={16} />
          </button>
        </div>
        
        {recent_jobs.length === 0 ? (
          <p className="empty-message">Aún no hay trabajos de render creados.</p>
        ) : (
          <div className="jobs-table">
            <div className="jobs-table-header">
              <span>ARCHIVO</span>
              <span>ESTADO</span>
              <span>FECHA</span>
              <span>ACCIONES</span>
            </div>

            {recent_jobs.map((job) => (
              <div className="job-row" key={job.id}>
                <span className="job-name">{job.filename}</span>
                <span className={`job-status ${job.status}`}>
                  {job.status === 'processing' && <RefreshCw size={14} className="spin" />}
                  {job.status === 'queued' && <Clock3 size={14} />}
                  {job.status === 'completed' && <CheckCircle2 size={14} />}
                  {job.status === 'failed' && <AlertCircle size={14} />}
                  {job.status}
                </span>
                <span className="job-date">
                  {new Date(job.created_at).toLocaleString()}
                </span>
                <span className="job-actions">
                  {job.result_available ? (
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => void downloadRenderJob(job.id, job.filename)}
                    >
                      <Download size={16} /> Descargar
                    </button>
                  ) : (
                    <span className="no-action">-</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
        
      </section>

      {/* INFRASTRUCTURE NOTE */}
      <section className="infrastructure-note">
        <div className="infrastructure-icon">
          <Cpu size={19} />
        </div>

        <div>
          <strong>Infraestructura de renderizado</strong>
          <p>
            Tus trabajos se procesan en los recursos
            compartidos de la escuela.
          </p>
        </div>

        <span className="infrastructure-indicator">
          <i />
          DEMO
        </span>
      </section>

    </div>
  );
}
