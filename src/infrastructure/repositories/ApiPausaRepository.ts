import { IPausaRepository } from '@/src/domain/interfaces/IPausaRepository';
import { Pausa } from '@/src/domain/entities/Pausa';
import { TiemposFueraApiClient, PausaApiResponse } from '../api-clients/TiemposFueraApiClient';

/**
 * Repositorio real de Pausas que consume la API de Tiempos Fuera
 * Implementa IPausaRepository adaptando las respuestas de la API al modelo de dominio
 */
export class ApiPausaRepository implements IPausaRepository {
  private apiClient: TiemposFueraApiClient;

  constructor() {
    this.apiClient = new TiemposFueraApiClient();
  }

  /**
   * Convierte la respuesta de la API al modelo de dominio Pausa
   */
  private mapApiResponseToDomain(apiPausa: PausaApiResponse): Pausa {
    return new Pausa(
      apiPausa.id,
      apiPausa.tipo,
      apiPausa.sub_tipo,
      apiPausa.observacion,
      [apiPausa.empleado_id], // La API retorna un empleado por pausa
      apiPausa.fecha,
      apiPausa.hora_inicio,
      apiPausa.hora_fin
    );
  }

  /**
   * Obtiene todas las pausas
   */
  async getAll(): Promise<Pausa[]> {
    try {
      const apiPausas = await this.apiClient.getPausas();
      return apiPausas.map(p => this.mapApiResponseToDomain(p));
    } catch (error) {
      console.error('Error al obtener pausas:', error);
      throw new Error('No se pudieron obtener las pausas desde la API');
    }
  }

  /**
   * Obtiene una pausa por ID
   * Nota: La API no tiene endpoint específico para obtener por ID,
   * así que filtramos del listado completo
   */
  async getById(id: number): Promise<Pausa | null> {
    try {
      const allPausas = await this.getAll();
      return allPausas.find(p => p.id === id) || null;
    } catch (error) {
      console.error(`Error al obtener pausa ${id}:`, error);
      return null;
    }
  }

  /**
   * Crea una nueva pausa
   * Nota: El sistema permite crear pausas para múltiples empleados simultáneamente
   */
  async create(pausaData: Omit<Pausa, 'id'>): Promise<Pausa> {
    try {
      const response = await this.apiClient.createPausas({
        empleados: pausaData.empleadosIds,
        estado: pausaData.estado,
        subestado: pausaData.subEstado,
        observacion: pausaData.observacion,
        fecha: pausaData.fechaPausa,
        horaInicio: pausaData.horaInicio,
        horaFin: pausaData.horaFin,
        usuario: 'SISTEMA', // TODO: Obtener del contexto de usuario autenticado
      });

      if (!response.success) {
        throw new Error(response.message || 'Error al crear pausa');
      }

      // Como la API crea múltiples pausas, retornamos una pausa temporal
      // En un caso real, deberíamos consultar las pausas recién creadas
      return new Pausa(
        0, // ID temporal
        pausaData.estado,
        pausaData.subEstado,
        pausaData.observacion,
        pausaData.empleadosIds,
        pausaData.fechaPausa,
        pausaData.horaInicio,
        pausaData.horaFin
      );
    } catch (error) {
      console.error('Error al crear pausa:', error);
      throw new Error('No se pudo crear la pausa');
    }
  }

  /**
   * Actualiza una pausa existente
   */
  async update(id: number, pausaData: Partial<Pausa>): Promise<Pausa> {
    try {
      const response = await this.apiClient.updatePausa(id, {
        observacion: pausaData.observacion,
        horaFin: pausaData.horaFin,
        usuario: 'SISTEMA', // TODO: Obtener del contexto de usuario autenticado
      });

      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar pausa');
      }

      // Obtenemos la pausa actualizada
      const pausaActualizada = await this.getById(id);
      if (!pausaActualizada) {
        throw new Error('Pausa no encontrada después de actualizar');
      }

      return pausaActualizada;
    } catch (error) {
      console.error(`Error al actualizar pausa ${id}:`, error);
      throw new Error('No se pudo actualizar la pausa');
    }
  }

  /**
   * Elimina una pausa
   */
  async delete(id: number): Promise<boolean> {
    try {
      const response = await this.apiClient.deletePausa(id);
      return response.success;
    } catch (error) {
      console.error(`Error al eliminar pausa ${id}:`, error);
      return false;
    }
  }

  /**
   * Busca pausas por query
   * Implementa búsqueda por fecha o rango de fechas
   */
  async search(query: string): Promise<Pausa[]> {
    try {
      // Intentamos interpretar el query como una fecha (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      if (dateRegex.test(query)) {
        // Búsqueda por fecha específica
        const apiPausas = await this.apiClient.getPausasByFecha(query);
        return apiPausas.map(p => this.mapApiResponseToDomain(p));
      } else {
        // Búsqueda general en todas las pausas
        const allPausas = await this.getAll();
        const lowerQuery = query.toLowerCase();
        
        return allPausas.filter(pausa => 
          pausa.estado.toLowerCase().includes(lowerQuery) ||
          pausa.subEstado.toLowerCase().includes(lowerQuery) ||
          pausa.observacion.toLowerCase().includes(lowerQuery) ||
          pausa.fechaPausa.includes(query)
        );
      }
    } catch (error) {
      console.error(`Error al buscar pausas con query "${query}":`, error);
      throw new Error('No se pudo realizar la búsqueda');
    }
  }
}
