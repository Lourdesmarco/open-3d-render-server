import { apiRequest } from '../../api/api';
import type { RenderJob } from './types';

// Obtener lista de trabajos del usuario actual (o todos si es admin)
export async function getJobsRequest(): Promise<RenderJob[]> {
  return apiRequest<RenderJob[]>('/jobs', { method: 'GET' });
}


// Subir archivo .blend y crear trabajo de render
export async function uploadJobRequest(
  file: File,
  renderType: '2d' | 'video' = '2d'
): Promise<RenderJob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('render_type', renderType);

  return apiRequest<RenderJob>('/jobs', {
    method: 'POST',
    body: formData,
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

  
  const contentType = response.headers.get('Content-Type') || '';
  const ext = contentType.includes('video') ? '.mp4' : '.png';
  // Limpiamos la extensión original si ya venía en el filename
  const cleanFilename = filename.replace(/\.[^/.]+$/, '');
  const downloadFilename = `render_${cleanFilename}${ext}`;

  // Convertir respuesta a blob y forzar descarga en el navegador
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  //a.download = `render_${filename}.png`; // Ajusta la extensión según lo que devuelva tu backend
  a.download = downloadFilename
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}


export async function deleteJobRequest(jobId: string): Promise<void> {
  await apiRequest<void>(`/jobs/${jobId}`, {
    method: 'DELETE',
  });
}