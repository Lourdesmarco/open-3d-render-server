import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { Upload, Download, RefreshCw, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';
import { getJobsRequest, uploadJobRequest, downloadRenderJob } from './Jobs.api';
import type { RenderJob } from './types';
import './Jobs.css';

export default function Jobs() {

  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.blend')) {
        setError('Solo se permiten archivos .blend');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await uploadJobRequest(selectedFile);
      setSelectedFile(null);
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el proyecto');
    } finally {
      setUploading(false);
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
        <h2>Nuevo Render (.blend)</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="file"
            accept=".blend"
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="file-dropzone">
            <Upload size={24} />
            <span>{selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo .blend'}</span>
          </label>

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
            <span>ESTADO</span>
            <span>FECHA</span>
            <span>ACCIONES</span>
          </div>

          {jobs.map((job) => (
            <div className="job-row" key={job.id}>
              <span className="job-name">{job.filename}</span>
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
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}