import { BaseApiClient } from './base/BaseApiClient';
import API_CONFIG from '../config/api.config';

/**
 * Interfaces que mapean las respuestas de la API de Tiempos Fuera
 */

export interface EmpleadoApiResponse {
  id: string;
  name: string;
  role: string;
}

export interface PausaApiResponse {
  id: number;
  tipo: string;
  sub_tipo: string;
  empleado_id: string;
  empleado_nombre?: string;
  observacion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  usuario_edicion: string;
}

export interface CreatePausaRequest {
  empleados: string[];
  estado: string;
  subestado?: string;
  observacion: string;
  fecha: string;
  horaInicio: string;
  horaFin?: string;
  usuario: string;
}

export interface UpdatePausaRequest {
  observacion?: string;
  horaFin?: string;
  usuario: string;
}

export interface PausasResponse {
  success: boolean;
  message?: string;
}

/**
 * Cliente para la API de Tiempos Fuera (Pausas)
 * Puerto: 5004
 */
export class TiemposFueraApiClient extends BaseApiClient {
  constructor() {
    const baseUrl = API_CONFIG.TIEMPOS_FUERA.BASE_URL;
    if (!baseUrl) {
      throw new Error('TIEMPOS_FUERA.BASE_URL is not configured in API_CONFIG');
    }

    super(baseUrl);
  }

  /**
   * GET /empleados
   * Obtiene la lista de todos los empleados
   */
  async getEmpleados(): Promise<EmpleadoApiResponse[]> {
    return this.get<EmpleadoApiResponse[]>(
      API_CONFIG.TIEMPOS_FUERA.ENDPOINTS.EMPLEADOS
    );
  }

  /**
   * POST /pausas
   * Registra una o varias pausas
   */
  async createPausas(data: CreatePausaRequest): Promise<PausasResponse> {
    return this.post<PausasResponse, CreatePausaRequest>(
      API_CONFIG.TIEMPOS_FUERA.ENDPOINTS.PAUSAS,
      data
    );
  }

  /**
   * GET /pausas
   * Consulta historial de pausas con filtros
   */
  async getPausas(params?: {
    ci?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<PausaApiResponse[]> {
    const queryParams: Record<string, string> = {};

    if (params?.ci) queryParams.ci = params.ci;
    if (params?.fecha_inicio) queryParams.fecha_inicio = params.fecha_inicio;
    if (params?.fecha_fin) queryParams.fecha_fin = params.fecha_fin;

    return this.get<PausaApiResponse[]>(
      API_CONFIG.TIEMPOS_FUERA.ENDPOINTS.PAUSAS,
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
  }

  /**
   * GET /pausas/fecha/{fecha}
   * Obtiene todas las pausas de una fecha específica
   */
  async getPausasByFecha(fecha: string): Promise<PausaApiResponse[]> {
    return this.get<PausaApiResponse[]>(
      API_CONFIG.TIEMPOS_FUERA.ENDPOINTS.PAUSAS_POR_FECHA(fecha)
    );
  }

  /**
   * PUT /pausas/{id}
   * Actualiza una pausa existente
   */
  async updatePausa(id: number, data: UpdatePausaRequest): Promise<PausasResponse> {
    return this.put<PausasResponse, UpdatePausaRequest>(
      API_CONFIG.TIEMPOS_FUERA.ENDPOINTS.PAUSA_BY_ID(id),
      data
    );
  }

  /**
   * DELETE /pausas/{id}
   * Elimina una pausa
   */
  async deletePausa(id: number): Promise<PausasResponse> {
    return this.delete<PausasResponse>(
      API_CONFIG.TIEMPOS_FUERA.ENDPOINTS.PAUSA_BY_ID(id)
    );
  }
}
