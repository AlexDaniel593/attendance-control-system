import { BaseApiClient } from './base/BaseApiClient';
import API_CONFIG from '../config/api.config';

/**
 * Interfaces que mapean las respuestas de la API de Personal
 */

export interface PersonalApiResponse {
  ci: string;
  id_a: number;
  id_t: number;
  id_b: number | null;
  id_ba: number | null;
  nombres: string;
  apellidos: string;
  direccion: string;
  telefonos: string;
  correo: string;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  fecha_contrato: string;
  salario: number;
}

export interface PersonalListResponse {
  success: boolean;
  data: PersonalApiResponse[];
  total: number;
}

export interface PersonalSingleResponse {
  success: boolean;
  data: PersonalApiResponse;
}

export interface CreatePersonalRequest {
  ci: string;
  id_a: number;
  id_t: number;
  id_b: number;
  id_ba: number;
  nombres: string;
  apellidos: string;
  direccion: string;
  telefonos: string;
  correo: string;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  fecha_contrato: string;
  salario: number;
}

export interface UpdatePersonalRequest {
  id_a?: number;
  id_t?: number;
  id_b?: number | null;
  id_ba?: number | null;
  nombres?: string;
  apellidos?: string;
  direccion?: string;
  telefonos?: string;
  correo?: string;
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
  fecha_contrato?: string;
  salario?: number;
}

export interface PersonalOperationResponse {
  success: boolean;
  message?: string;
}

/**
 * Cliente para la API de Personal
 * Puerto: 5001
 */
export class PersonalApiClient extends BaseApiClient {
  constructor() {
    const baseUrl = API_CONFIG.PERSONAL.BASE_URL;
    if (!baseUrl) {
      throw new Error('PERSONAL.BASE_URL is not configured in API_CONFIG');
    }

    super(baseUrl);
  }

  /**
   * GET /api/personal
   * Obtiene la lista de todos los empleados
   */
  async getAllPersonal(): Promise<PersonalListResponse> {
    return this.get<PersonalListResponse>(
      API_CONFIG.PERSONAL.ENDPOINTS.PERSONAL
    );
  }

  /**
   * GET /api/personal/<ci>
   * Obtiene un empleado por su cédula
   */
  async getPersonalByCi(ci: string): Promise<PersonalApiResponse> {
    const response = await this.get<PersonalSingleResponse>(
      API_CONFIG.PERSONAL.ENDPOINTS.PERSONAL_BY_CI(ci)
    );
    return response.data;
  }

  /**
   * GET /api/personal/search?nombres=<nombre>&apellidos=<apellido>
   * Busca empleados por nombres y/o apellidos
   */
  async searchPersonal(params?: {
    nombres?: string;
    apellidos?: string;
  }): Promise<PersonalListResponse> {
    const queryParams: Record<string, string> = {};

    if (params?.nombres) queryParams.nombres = params.nombres;
    if (params?.apellidos) queryParams.apellidos = params.apellidos;

    return this.get<PersonalListResponse>(
      API_CONFIG.PERSONAL.ENDPOINTS.SEARCH,
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
  }

  /**
   * POST /api/personal
   * Crea un nuevo empleado
   */
  async createPersonal(data: CreatePersonalRequest): Promise<PersonalOperationResponse> {
    return this.post<PersonalOperationResponse, CreatePersonalRequest>(
      API_CONFIG.PERSONAL.ENDPOINTS.PERSONAL,
      data
    );
  }

  /**
   * PUT /api/personal/<ci>
   * Actualiza un empleado existente
   */
  async updatePersonal(ci: string, data: UpdatePersonalRequest): Promise<PersonalOperationResponse> {
    return this.put<PersonalOperationResponse, UpdatePersonalRequest>(
      API_CONFIG.PERSONAL.ENDPOINTS.PERSONAL_BY_CI(ci),
      data
    );
  }

  /**
   * DELETE /api/personal/<ci>
   * Elimina un empleado
   */
  async deletePersonal(ci: string): Promise<PersonalOperationResponse> {
    return this.delete<PersonalOperationResponse>(
      API_CONFIG.PERSONAL.ENDPOINTS.PERSONAL_BY_CI(ci)
    );
  }
}
