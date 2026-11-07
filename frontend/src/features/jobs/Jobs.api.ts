import { apiRequest } from '../../api/api';
import type { RenderJob } from './types';

// Obtener lista de trabajos del usuario actual (o todos si es admin)
export async function getJobsRequest(): Promise<RenderJob[]> {
  return apiRequest<RenderJob[]>('/jobs', { method: 'GET' });
}

// Subir archivo .blend y crear trabajo de render
export async function uploadJobRequest(file: File): Promise<RenderJob> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<RenderJob>('/jobs', {
    method: 'POST',
    body: formData,
    // apiRequest detecta FormData y omite Content-Type para que el navegador ponga el boundary
  });

  
}


// DESCARGAR RESULTADO DEL RENDER
export async function downloadRenderJob(jobId: string, filename: string): Promise<void> {
  const API_URL = import.meta.env.VITE_API_URL ?? '/api';
  
  const response = await fetch(`${API_URL}/jobs/${jobId}/download`, {
    method: 'GET',
    credentials: 'include', // <-  enviar la cookie HttpOnly al descargar
  });

  if (!response.ok) {
    throw new Error('No se pudo descargar el resultado del render');
  }

  // Convertir respuesta a blob y forzar descarga en el navegador
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `render_${filename}.png`; // Ajusta la extensión según lo que devuelva tu backend
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}