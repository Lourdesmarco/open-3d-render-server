export type RenderStatus =
| 'queued'
| 'processing'
| 'completed'
| 'failed'

export interface RenderJob {
    id: string;
    filename: string;
    status: RenderStatus;
    created_at: string;
    result_available: boolean;
    error: string | null;
}