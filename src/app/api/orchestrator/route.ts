import { NextRequest, NextResponse } from 'next/server';
import { ApiPausaRepository } from '@/src/infrastructure/repositories/ApiPausaRepository';
import { MockPausaRepository } from '@/src/infrastructure/repositories/MockPausaRepository';
import { GetAllPausasUseCase } from '@/src/application/use-cases/GetAllPausasUseCase';
import { SearchPausasUseCase } from '@/src/application/use-cases/SearchPausasUseCase';

/**
 * API Orchestrator - Orquestación de llamadas a APIs externas
 * 
 * Este endpoint actúa como capa de orquestación entre el frontend y las APIs externas.
 * Permite cambiar fácilmente entre implementaciones Mock y APIs reales.
 * 
 * Configuración:
 * - USE_REAL_API_PAUSAS=true: Usa la API real de tiempos-fuera (puerto 5004)
 * - USE_REAL_API_PAUSAS=false: Usa datos mock para desarrollo
 */

// Control de uso de APIs reales vs Mock
const USE_REAL_API_PAUSAS = process.env.USE_REAL_API_PAUSAS === 'true';

// Instancias de repositorios
const pausaRepository = USE_REAL_API_PAUSAS 
  ? new ApiPausaRepository() 
  : new MockPausaRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const query = searchParams.get('query');

  try {
    switch (resource) {
      case 'pausas': {
        if (query) {
          // Búsqueda de pausas
          const searchUseCase = new SearchPausasUseCase(pausaRepository);
          const pausas = await searchUseCase.execute(query);
          return NextResponse.json({
            success: true,
            data: pausas,
            source: USE_REAL_API_PAUSAS ? 'API Real (Puerto 5004)' : 'Mock Data',
          });
        } else {
          // Obtener todas las pausas
          const getAllUseCase = new GetAllPausasUseCase(pausaRepository);
          const pausas = await getAllUseCase.execute();
          return NextResponse.json({
            success: true,
            data: pausas,
            source: USE_REAL_API_PAUSAS ? 'API Real (Puerto 5004)' : 'Mock Data',
          });
        }
      }

      case 'personal':
        return NextResponse.json({
          success: true,
          data: [
            {
              cl: '001',
              id_a: 1,
              id_t: 1,
              id_b: 1,
              id_ba: 1,
              nombres: 'Juan',
              apellidos: 'Pérez García',
              direccion: 'Av. Principal 123',
              telefonos: '555-0001',
              correo: 'juan.perez@example.com',
              fechaNacimiento: '1990-01-15',
              fechaIngreso: '2020-03-01',
              fechaContrato: '2020-03-01',
              salario: 2500.00,
            },
          ],
          source: 'Mock Data',
        });

      case 'attendance':
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No hay registros de asistencia',
          source: 'Mock Data',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Recurso no encontrado' },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Error en orchestrator:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, data } = body;

    switch (resource) {
      case 'pausas': {
        // Crear pausas usando el repositorio configurado
        const pausa = await pausaRepository.create(data);
        return NextResponse.json({
          success: true,
          data: pausa,
          message: 'Pausa(s) creada(s) exitosamente',
          source: USE_REAL_API_PAUSAS ? 'API Real (Puerto 5004)' : 'Mock Data',
        });
      }

      case 'personal':
        // Simular creación de personal
        return NextResponse.json({
          success: true,
          data: {
            cl: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
            ...data,
          },
          message: 'Personal creado exitosamente',
          source: 'Mock Data',
        });

      case 'login':
        // Simular autenticación
        if (data.username === 'admin' && data.password === 'admin') {
          return NextResponse.json({
            success: true,
            data: {
              id: '1',
              username: data.username,
              email: 'admin@example.com',
              role: 'admin',
            },
          });
        }
        return NextResponse.json(
          { success: false, error: 'Credenciales inválidas' },
          { status: 401 }
        );

      default:
        return NextResponse.json(
          { success: false, error: 'Recurso no encontrado' },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Error en orchestrator POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, id, data } = body;

    switch (resource) {
      case 'pausas': {
        // Actualizar pausa usando el repositorio configurado
        const pausa = await pausaRepository.update(id, data);
        return NextResponse.json({
          success: true,
          data: pausa,
          message: 'Pausa actualizada exitosamente',
          source: USE_REAL_API_PAUSAS ? 'API Real (Puerto 5004)' : 'Mock Data',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Recurso no encontrado' },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Error en orchestrator PUT:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    switch (resource) {
      case 'pausas': {
        // Eliminar pausa usando el repositorio configurado
        const success = await pausaRepository.delete(Number(id));
        return NextResponse.json({
          success,
          message: success ? 'Pausa eliminada exitosamente' : 'No se pudo eliminar la pausa',
          source: USE_REAL_API_PAUSAS ? 'API Real (Puerto 5004)' : 'Mock Data',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Recurso no encontrado' },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Error en orchestrator DELETE:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
