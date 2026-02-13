'use client';

import { useAuth } from '@/src/presentation/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [totalPersonal, setTotalPersonal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        
        // Cargar total de personal
        const personalResponse = await fetch('/api/orchestrator?resource=personal');
        const personalResult = await personalResponse.json();
        
        if (personalResult.success) {
          setTotalPersonal(personalResult.data.length);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {user 
            ? `Bienvenido, ${user.nombres} ${user.apellidos}` 
            : 'Bienvenido al sistema de control de asistencias'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Personal</h3>
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : totalPersonal}
          </div>
          <p className="text-xs text-muted-foreground">
            Empleados registrados en el sistema
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Asistencias Hoy</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Registros del día actual
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Pausas Activas</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Empleados en pausa
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-sm text-muted-foreground">
          No hay actividad reciente para mostrar
        </p>
      </div>
    </div>
  );
}
