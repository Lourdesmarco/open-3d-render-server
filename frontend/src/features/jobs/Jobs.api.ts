import { apiRequest } from '../../api/api';
import type { RenderJob } from './types';

// Obtener lista de trabajos del usuario actual (o todos si es admin)
export async function getJobsRequest(token: string): Promise<RenderJob[]> {
  return apiRequest<RenderJob[]>('/jobs', { method: 'GET' }, token);
}

// Subir archivo .blend y crear trabajo de render
export async function uploadJobRequest(file: File, token: string): Promise<RenderJob> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8080/api'}/jobs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? `Error HTTP ${response.status}`);
  }

  return response.json();
}


// Descargar el resultado renderizado con el token Bearer
export async function downloadRenderJob(jobId: string, filename: string, token: string): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8080/api';
  
  const response = await fetch(`${baseUrl}/jobs/${jobId}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo descargar la imagen renderizada');
  }

  // Convertir la respuesta a Blob y forzar la descarga en el navegador
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `render_${filename.replace('.blend', '')}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}