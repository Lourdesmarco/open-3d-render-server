
import type { CSSProperties } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Cpu,
  FolderKanban,
  Layers3,
  Plus,
  RefreshCw,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import './Dashboard.css';

const stats = [
  {
    label: 'TRABAJOS EN COLA',
    value: '03',
    detail: 'Pendientes de procesamiento',
    icon: Clock3,
  },
  {
    label: 'RENDERS ACTIVOS',
    value: '02',
    detail: 'Procesándose actualmente',
    icon: RefreshCw,
  },
  {
    label: 'COMPLETADOS',
    value: '18',
    detail: 'Trabajos finalizados',
    icon: CheckCircle2,
  },
];

const projects = [
  {
    name: 'Proyecto de tipografía',
    category: 'TIPOGRAFIA',
    renders: 8,
    updated: 'Hace 20 minutos',
    color: '#36E452',
  },
  {
    name: 'Diseño de producto',
    category: 'DISEÑO DE PRODUCTO',
    renders: 5,
    updated: 'Ayer',
    color: '#D8A7FF',
  },
  {
    name: 'Espacio experimental',
    category: 'EXPERIMENTACIÓN',
    renders: 5,
    updated: 'Hace 3 días',
    color: '#E9B85D',
  },
];

const jobs = [
  {
    name: 'tipo_final.blend',
    project: 'Proyecto de tipografia',
    status: 'Renderizando',
    progress: 68,
    time: '12 min',
    type: 'active',
  },
  {
    name: 'product_view_03.blend',
    project: 'Diseño de producto',
    status: 'En cola',
    progress: 0,
    time: 'En espera',
    type: 'queued',
  },
  {
    name: 'exterior_scene.blend',
    project: 'Proyecto experimental',
    status: 'Completado',
    progress: 100,
    time: 'Hace 2 horas',
    type: 'completed',
  },
];

export default function Dashboard() {
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
          className="new-render-button"
          onClick={() => alert('La creación de renders estará disponible próximamente.')}
        >
          <Plus size={19} />
          Nuevo trabajo
          <ArrowUpRight size={17} />
        </button>

        <div className="banner-decoration">RF.</div>
      </section>

      {/* STATISTICS */}
      <section className="stats-section">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">TU ACTIVIDAD</p>
            <h2>Resumen<span>.</span></h2>
          </div>

          <span className="section-index">01 / 03</span>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article className="stat-card" key={stat.label}>
                <div className="stat-card-top">
                  <span>{stat.label}</span>
                  <Icon size={18} />
                </div>

                <strong>{stat.value}</strong>

                <p>{stat.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="projects-section">
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
      </section>

      {/* RECENT JOBS */}
      <section className="jobs-section">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">PROCESAMIENTO</p>
            <h2>Actividad reciente<span>.</span></h2>
          </div>

          <button className="text-link" type="button">
            Ver historial <ArrowRight size={16} />
          </button>
        </div>

        <div className="jobs-table">
          <div className="jobs-table-header">
            <span>TRABAJO</span>
            <span>ESTADO</span>
            <span>PROGRESO</span>
            <span>ACTUALIZACIÓN</span>
          </div>

          {jobs.map((job) => (
            <article className="job-row" key={job.name}>
              <div className="job-name">
                <div className="job-file-icon">
                  <FolderKanban size={17} />
                </div>

                <div>
                  <strong>{job.name}</strong>
                  <span>{job.project}</span>
                </div>
              </div>

              <div className={`job-status ${job.type}`}>
                {job.type === 'active' && <RefreshCw size={14} />}
                {job.type === 'queued' && <CircleDot size={14} />}
                {job.type === 'completed' && <CheckCircle2 size={14} />}
                {job.status}
              </div>

              <div className="job-progress">
                <div className="progress-track">
                  <div
                    className="progress-value"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>

                <span>{job.progress}%</span>
              </div>

              <span className="job-time">{job.time}</span>
            </article>
          ))}
        </div>
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
