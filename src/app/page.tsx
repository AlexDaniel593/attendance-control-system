"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DatosFirma } from "@/src/presentation/components/firma/DatosFirma";
import { Cronometro } from "@/src/presentation/components/firma/Cronometro";
import { RegistroFirma } from "@/src/presentation/components/firma/RegistroFirma";
import { LoginSheet } from "@/src/presentation/components/firma/LoginSheet";
import { MockFirmaRepository } from "@/src/infrastructure/repositories/MockFirmaRepository";
import { MockPersonalRepository } from "@/src/infrastructure/repositories/MockPersonalRepository";
import { GetTodayFirmaUseCase } from "@/src/application/use-cases/GetTodayFirmaUseCase";
import { RegistrarFirmaUseCase } from "@/src/application/use-cases/RegistrarFirmaUseCase";
import { GetAllPersonalUseCase } from "@/src/application/use-cases/GetAllPersonalUseCase";
import { Firma } from "@/src/domain/entities/Firma";
import { FirmaDTO } from "@/src/presentation/dtos/FirmaDTO";
import { Button } from "@/src/presentation/components/ui/button";
import { LogIn } from "lucide-react";

const firmaRepository = new MockFirmaRepository();
const personalRepository = new MockPersonalRepository();
const getTodayFirmaUseCase = new GetTodayFirmaUseCase(firmaRepository);
const registrarFirmaUseCase = new RegistrarFirmaUseCase(firmaRepository);
const getAllPersonalUseCase = new GetAllPersonalUseCase(personalRepository);

export default function HomePage() {
  const [firma, setFirma] = useState<Firma | null>(null);
  const [firmaDTO, setFirmaDTO] = useState<FirmaDTO | null>(null);
  const [empleadoNombre, setEmpleadoNombre] = useState("Empleado");
  const [empleadoCI, setEmpleadoCI] = useState("1234567890"); // CI por defecto
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    loadFirmaData();
  }, []);

  const loadFirmaData = async () => {
    try {
      // Obtener firma del día
      const firmaData = await getTodayFirmaUseCase.execute(empleadoCI);
      setFirma(firmaData);

      if (firmaData) {
        // Convertir a DTO
        const dto: FirmaDTO = {
          fechaFirma: firmaData.fechaFirma,
          hIJornada: firmaData.hIJornada,
          aIJornada: firmaData.aIJornada,
          hIBreak: firmaData.hIBreak,
          hFBreak: firmaData.hFBreak,
          aFBreak: firmaData.aFBreak,
          hIAlmuerzo: firmaData.hIAlmuerzo,
          hFAlmuerzo: firmaData.hFAlmuerzo,
          aFAlmuerzo: firmaData.aFAlmuerzo,
          hFJornada: firmaData.hFJornada,
          ci: firmaData.ci,
          idT: firmaData.idT,
          idB: firmaData.idB,
          idBa: firmaData.idBa,
        };
        setFirmaDTO(dto);

        // Obtener nombre del empleado
        const personal = await getAllPersonalUseCase.execute();
        const empleado = personal.find((p) => p.ci === empleadoCI);
        if (empleado) {
          setEmpleadoNombre(`${empleado.nombres} ${empleado.apellidos}`);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos de firma");
    }
  };

  const handleRegistrarFirma = async (firmaInput: string) => {
    try {
      // Determinar qué tipo de firma registrar según el estado actual
      let tipoFirma = "INICIO_JORNADA";

      if (firma) {
        if (!firma.hIJornada) {
          tipoFirma = "INICIO_JORNADA";
        } else if (!firma.hIBreak) {
          tipoFirma = "SALIDA_BREAK";
        } else if (!firma.hFBreak) {
          tipoFirma = "REGRESO_BREAK";
        } else if (!firma.hIAlmuerzo) {
          tipoFirma = "SALIDA_ALMUERZO";
        } else if (!firma.hFAlmuerzo) {
          tipoFirma = "REGRESO_ALMUERZO";
        } else if (!firma.hFJornada) {
          tipoFirma = "FIN_JORNADA";
        }
      }

      await registrarFirmaUseCase.execute(empleadoCI, tipoFirma);
      await loadFirmaData(); // Recargar datos
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Sistema de Control de Asistencias
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Base de Firmas
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setLoginOpen(true)}>
              <LogIn className="h-4 w-4" />
              Acceso Administrativo
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Datos de firma */}
          <div className="lg:col-span-2">
            <DatosFirma firma={firmaDTO} empleadoNombre={empleadoNombre} />
          </div>

          {/* Panel derecho - Cronómetro y firma */}
          <div className="space-y-6">
            <Cronometro firma={firma} />
            <RegistroFirma onRegistrarFirma={handleRegistrarFirma} />
          </div>
        </div>
      </div>

      {/* Login Sheet */}
      <LoginSheet open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
