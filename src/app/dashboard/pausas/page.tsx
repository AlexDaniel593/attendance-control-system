'use client';

import { useState, useEffect } from 'react';
import { Pausa } from '@/src/domain/entities/Pausa';
import { PausaForm } from '@/src/presentation/components/pausas/PausaForm';
import { PausaTable } from '@/src/presentation/components/pausas/PausaTable';
import { Button } from '@/src/presentation/components/ui/button';
import { MockPersonalRepository } from '@/src/infrastructure/repositories/MockPersonalRepository';
import { GetAllPersonalUseCase } from '@/src/application/use-cases/GetAllPersonalUseCase';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PausasPage() {
  const [pausas, setPausas] = useState<Pausa[]>([]);
  const [selectedPausa, setSelectedPausa] = useState<Pausa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [empleados, setEmpleados] = useState<Array<{ id: string; nombre: string }>>([]);
  const [dataSource, setDataSource] = useState<string>('');

  // Repositorio para personal (temporal)
  const personalRepository = new MockPersonalRepository();
  const getAllPersonalUseCase = new GetAllPersonalUseCase(personalRepository);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener pausas desde el orchestrator
      const pausasResponse = await fetch('/api/orchestrator?resource=pausas');
      const pausasResult = await pausasResponse.json();
      
      // Obtener personal (temporal con mock)
      const personalData = await getAllPersonalUseCase.execute();
      
      if (pausasResult.success) {
        setPausas(pausasResult.data);
        setDataSource(pausasResult.source || 'Unknown');
      } else {
        toast.error('Error al cargar pausas: ' + pausasResult.error);
      }
      
      setEmpleados(
        personalData.map((p) => ({
          id: p.cl,
          nombre: p.nombreCompleto,
        }))
      );
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPausas = async () => {
    try {
      const response = await fetch('/api/orchestrator?resource=pausas');
      const result = await response.json();
      
      if (result.success) {
        setPausas(result.data);
      } else {
        toast.error('Error al cargar pausas: ' + result.error);
      }
    } catch (error) {
      toast.error('Error al cargar los registros');
      console.error(error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedPausa) {
        // Actualizar
        const response = await fetch('/api/orchestrator', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'pausas',
            id: selectedPausa.id,
            data: {
              estado: data.estado,
              subEstado: data.subEstado,
              observacion: data.observacion,
              empleadosIds: data.empleadosIds,
              fechaPausa: data.fechaPausa,
              horaInicio: data.horaInicio,
              horaFin: data.horaFin,
            }
          })
        });
        
        const result = await response.json();
        if (result.success) {
          toast.success('Registro actualizado exitosamente');
        } else {
          toast.error('Error al actualizar: ' + result.error);
        }
      } else {
        // Crear
        const response = await fetch('/api/orchestrator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'pausas',
            data: {
              estado: data.estado,
              subEstado: data.subEstado,
              observacion: data.observacion,
              empleadosIds: data.empleadosIds,
              fechaPausa: data.fechaPausa,
              horaInicio: data.horaInicio,
              horaFin: data.horaFin,
            }
          })
        });
        
        const result = await response.json();
        if (result.success) {
          toast.success('Registro creado exitosamente');
        } else {
          toast.error('Error al crear: ' + result.error);
        }
      }
      await loadPausas();
      setSelectedPausa(null);
      setFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el registro');
      throw error;
    }
  };

  const handleEdit = (pausa: Pausa) => {
    setSelectedPausa(pausa);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedPausa(null);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setSelectedPausa(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/orchestrator?resource=pausas&id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success('Registro eliminado exitosamente');
        await loadPausas();
      } else {
        toast.error('Error al eliminar: ' + result.error);
      }
    } catch (error) {
      toast.error('Error al eliminar el registro');
      console.error(error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      if (!query.trim()) {
        await loadPausas();
        return;
      }
      
      const response = await fetch(`/api/orchestrator?resource=pausas&query=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        setPausas(result.data);
      } else {
        toast.error('Error en la búsqueda: ' + result.error);
      }
    } catch (error) {
      toast.error('Error al buscar registros');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tiempos Fuera de Trabajo</h1>
          <p className="text-muted-foreground mt-2">
            Administre los tiempos de capacitación, permisos y reuniones del personal
          </p>
          {dataSource && (
            <p className="text-xs text-muted-foreground mt-1">
              📡 Fuente: <span className="font-mono">{dataSource}</span>
            </p>
          )}
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      <PausaTable
        pausas={pausas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={handleSearch}
      />

      <PausaForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        pausa={selectedPausa}
        onSubmit={handleSubmit}
        empleados={empleados}
      />
    </div>
  );
}
