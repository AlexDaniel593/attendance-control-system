import { IPersonalRepository } from '@/src/domain/interfaces/IPersonalRepository';
import { Personal, PersonalData } from '@/src/domain/entities/Personal';
import { PersonalApiClient, PersonalApiResponse } from '../api-clients/PersonalApiClient';

/**
 * Repositorio real de Personal que consume la API de Personal
 * Implementa IPersonalRepository adaptando las respuestas de la API al modelo de dominio
 */
export class ApiPersonalRepository implements IPersonalRepository {
  private apiClient: PersonalApiClient;

  constructor() {
    this.apiClient = new PersonalApiClient();
  }

  /**
   * Convierte la respuesta de la API al modelo de dominio Personal
   */
  private mapApiResponseToDomain(apiPersonal: PersonalApiResponse): Personal {
    return new Personal(
      apiPersonal.ci, // cl (código local) lo usamos como el CI en este caso
      apiPersonal.ci,
      apiPersonal.id_a,
      apiPersonal.id_t,
      apiPersonal.id_b || 0, // id_b puede ser null en la API
      apiPersonal.id_ba || 0, // id_ba puede ser null en la API
      apiPersonal.nombres,
      apiPersonal.apellidos,
      apiPersonal.direccion,
      apiPersonal.telefonos,
      apiPersonal.correo,
      apiPersonal.fecha_nacimiento,
      apiPersonal.fecha_ingreso,
      apiPersonal.fecha_contrato,
      apiPersonal.salario
    );
  }

  /**
   * Obtiene todos los empleados
   */
  async findAll(): Promise<Personal[]> {
    try {
      const response = await this.apiClient.getAllPersonal();
      return response.data.map(p => this.mapApiResponseToDomain(p));
    } catch (error) {
      console.error('Error al obtener personal:', error);
      throw new Error('No se pudo obtener la lista de personal desde la API');
    }
  }

  /**
   * Obtiene un empleado por su CI (cédula de identidad)
   * Nota: El ID en el sistema es el CI del empleado
   */
  async findById(id: string): Promise<Personal | null> {
    try {
      const apiPersonal = await this.apiClient.getPersonalByCi(id);
      return this.mapApiResponseToDomain(apiPersonal);
    } catch (error) {
      console.error(`Error al obtener personal con CI ${id}:`, error);
      return null;
    }
  }

  /**
   * Crea un nuevo empleado
   */
  async create(personalData: PersonalData): Promise<Personal> {
    try {
      const response = await this.apiClient.createPersonal({
        ci: personalData.ci,
        id_a: personalData.id_a,
        id_t: personalData.id_t,
        id_b: personalData.id_b,
        id_ba: personalData.id_ba,
        nombres: personalData.nombres,
        apellidos: personalData.apellidos,
        direccion: personalData.direccion,
        telefonos: personalData.telefonos,
        correo: personalData.correo,
        fecha_nacimiento: personalData.fechaNacimiento,
        fecha_ingreso: personalData.fechaIngreso,
        fecha_contrato: personalData.fechaContrato,
        salario: personalData.salario,
      });

      if (!response.success) {
        throw new Error(response.message || 'Error al crear empleado');
      }

      // Recuperamos el empleado recién creado
      const createdPersonal = await this.apiClient.getPersonalByCi(personalData.ci);
      return this.mapApiResponseToDomain(createdPersonal);
    } catch (error) {
      console.error('Error al crear personal:', error);
      throw new Error('No se pudo crear el empleado');
    }
  }

  /**
   * Actualiza un empleado existente
   */
  async update(id: string, personalData: Partial<PersonalData>): Promise<Personal> {
    try {
      const updateData: any = {};

      const isFiniteNumber = (value: unknown): value is number =>
        typeof value === 'number' && Number.isFinite(value);

      if (personalData.id_a !== undefined) updateData.id_a = personalData.id_a;
      if (personalData.id_t !== undefined) updateData.id_t = personalData.id_t;
      if (personalData.id_b !== undefined && isFiniteNumber(personalData.id_b)) updateData.id_b = personalData.id_b;
      if (personalData.id_ba !== undefined && isFiniteNumber(personalData.id_ba)) updateData.id_ba = personalData.id_ba;
      if (personalData.nombres !== undefined) updateData.nombres = personalData.nombres;
      if (personalData.apellidos !== undefined) updateData.apellidos = personalData.apellidos;
      if (personalData.direccion !== undefined) updateData.direccion = personalData.direccion;
      if (personalData.telefonos !== undefined) updateData.telefonos = personalData.telefonos;
      if (personalData.correo !== undefined) updateData.correo = personalData.correo;
      if (personalData.fechaNacimiento !== undefined) updateData.fecha_nacimiento = personalData.fechaNacimiento;
      if (personalData.fechaIngreso !== undefined) updateData.fecha_ingreso = personalData.fechaIngreso;
      if (personalData.fechaContrato !== undefined) updateData.fecha_contrato = personalData.fechaContrato;
      if (personalData.salario !== undefined) updateData.salario = personalData.salario;

      const response = await this.apiClient.updatePersonal(id, updateData);

      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar empleado');
      }

      // Recuperamos el empleado actualizado
      const updatedPersonal = await this.apiClient.getPersonalByCi(id);
      return this.mapApiResponseToDomain(updatedPersonal);
    } catch (error) {
      console.error(`Error al actualizar personal con CI ${id}:`, error);
      throw new Error('No se pudo actualizar el empleado');
    }
  }

  /**
   * Elimina un empleado
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await this.apiClient.deletePersonal(id);

      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar empleado');
      }
    } catch (error) {
      console.error(`Error al eliminar personal con CI ${id}:`, error);
      throw new Error('No se pudo eliminar el empleado');
    }
  }
}
