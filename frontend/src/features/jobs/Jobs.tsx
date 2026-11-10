import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Upload, Download, RefreshCw, AlertCircle, CheckCircle2, Clock3, Settings, Image, Film, Trash2 } from 'lucide-react';
import { getJobsRequest, uploadJobRequest, downloadRenderJob, deleteJobRequest } from './Jobs.api';
import type { RenderJob } from './types';
import './Jobs.css';

// Formatos soportados por nuestra arquitectura modular
const SUPPORTED_EXTENSIONS = ['.blend', '.c4d', '.ma', '.mb', '.aep'];
const ACCEPT_ATTRIBUTE = SUPPORTED_EXTENSIONS.join(',');

export default function Jobs() {

  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedEngine, setDetectedEngine] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [renderType, setRenderType] = useState<'2d' | 'video'>('2d');

  const fetchJobs = useCallback(async () => {
    
    try {
      const data = await getJobsRequest();
      setJobs(data);
    } catch (err) {
      console.error("Error al obtener renders:", err);
    }
  }, []);

  // Polling automático cada 3 segundos si hay trabajos pendientes o en proceso
  useEffect(() => {
    fetchJobs();

    const interval = setInterval(() => {
      const hasActive = jobs.some(j => j.status === 'queued' || j.status === 'processing');
      if (hasActive) {
        fetchJobs();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchJobs, jobs]);


  const getEngineName = (extension: string): string => {
    switch (extension.toLowerCase()) {
      case '.blend': return 'Blender Render Engine';
      case '.c4d': return 'Cinema 4D Commandline Engine';
      case '.ma':
      case '.mb': return 'Autodesk Maya (Arnold Engine)';
      case '.aep': return 'Adobe After Effects (aerender)';
      default: return 'Motor Desconocido';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setDetectedEngine(null);
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setFileError(`Formato no soportado (${ext}). Formatos válidos: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      setSelectedFile(null);
      setDetectedEngine(null);
      e.target.value = ''; // Reset input
      return;
    }

    setSelectedFile(file);
    setDetectedEngine(getEngineName(ext));
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await uploadJobRequest(selectedFile, renderType);
      setSelectedFile(null);
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el proyecto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este trabajo?')) return;

    try {
      await deleteJobRequest(jobId);
      // Actualizar la lista local filtrando el trabajo eliminado
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    } catch (err) {
      alert('No se pudo eliminar el trabajo de renderizado');
    }
  };

  return (
    <div className="jobs-container">
      {/* PAGE INTRODUCTION */}
      <section className="dashboard-intro">
        <div>
          <p className="dashboard-eyebrow">
            ESPACIO DE TRABAJO / 003
          </p>

          <h1>
            Tus trabajos 
            <br />
            de render<span>.</span>
          </h1>

          <p className="dashboard-subtitle">
            Sube nuevos trabajos y visualiza o descarga
            los renders ya procesados.
          </p>
        </div>

        <div className="dashboard-date">
          <span>OPEN 3D RENDER</span>
          <span>ÁREA DE USUARIO</span>
        </div>
      </section>
      <section className="upload-section">
        <h2>Nuevo Render (.blend, .c4d, .ma, .mb, .aep)</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <label htmlFor="file-upload" className="file-dropzone">
            <Upload size={24} />
            <span>{selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}</span>
          </label>

          {fileError && <p className="error-message" style={{ color: '#ef4444', marginTop: '8px' }}>{fileError}</p>}

          {selectedFile && detectedEngine && (
            <div className="file-preview-card">
              <Settings size={16} className="engine-icon"/> 
              <strong>Motor asignado:</strong> {detectedEngine}
            </div>
          )}

          {/* SELECTOR DE TIPO DE RENDER */}
          <div className="render-type-selector">
            <label className="section-label">Tipo de Salida:</label>
            <div className="radio-group">
              <label className={`radio-card ${renderType === '2d' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="renderType"
                  value="2d"
                  checked={renderType === '2d'}
                  onChange={() => setRenderType('2d')}
                />
                <Image size={18} />
                <span>Imagen 2D (Fija)</span>
              </label>

              <label className={`radio-card ${renderType === 'video' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="renderType"
                  value="video"
                  checked={renderType === 'video'}
                  onChange={() => setRenderType('video')}
                />
                <Film size={18} />
                <span>Video / Animación</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Enviando...' : 'Enviar a renderizar'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="jobs-list-section">
        <h2>Historial de Renders</h2>
        <div className="jobs-table">
          <div className="jobs-table-header">
            <span>ARCHIVO</span>
            <span>TIPO</span>
            <span>ESTADO</span>
            <span>FECHA</span>
            <span>ACCIONES</span>
          </div>

          {jobs.map((job) => (
            <div className="job-row" key={job.id}>
              <span className="job-name">{job.filename}</span>
              <span className="job-type">
                {job.render_type === 'video' ? (
                  <span className="badge badge-video">
                    <Film size={12} /> Vídeo
                  </span>
                ) : (
                  <span className="badge badge-2d">
                    <Image size={12} /> Imagen
                  </span>
                )}
              </span>
              <span className={`job-status ${job.status}`}>
                {job.status === 'processing' && <RefreshCw size={14} className="spin" />}
                {job.status === 'queued' && <Clock3 size={14} />}
                {job.status === 'completed' && <CheckCircle2 size={14} />}
                {job.status === 'failed' && <AlertCircle size={14} />}
                {job.status}
              </span>
              <span className="job-date">{new Date(job.created_at).toLocaleString()}</span>
              <span className="job-actions">
                {job.result_available && (
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => downloadRenderJob(job.id, job.filename)}
                  >
                    <Download size={16} /> Descargar
                  </button>
                )}
                {job.error && <span className="error-text" title={job.error}>Ver error</span>}
                <button
                  type="button"
                  className="btn-action btn-delete"
                  onClick={() => handleDeleteJob(job.id)}
                  title="Eliminar trabajo"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}