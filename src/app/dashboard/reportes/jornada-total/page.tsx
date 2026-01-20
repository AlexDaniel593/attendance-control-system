"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card";
import { Button } from "@/src/presentation/components/ui/button";
import { Input } from "@/src/presentation/components/ui/input";
import { Label } from "@/src/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/presentation/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/presentation/components/ui/table";
import { Calendar } from "@/src/presentation/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/presentation/components/ui/popover";
import { CalendarIcon, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/src/infrastructure/utils/utils";
import { toast } from "sonner";
import { MockPersonalRepository } from "@/src/infrastructure/repositories/MockPersonalRepository";
import { MockFirmaRepository } from "@/src/infrastructure/repositories/MockFirmaRepository";
import { GetAllPersonalUseCase } from "@/src/application/use-cases/GetAllPersonalUseCase";
import { Separator } from "@/src/presentation/components/ui/separator";

const personalRepository = new MockPersonalRepository();
const firmaRepository = new MockFirmaRepository();
const getAllPersonalUseCase = new GetAllPersonalUseCase(personalRepository);

interface ReporteData {
  ci: string;
  fechaFirma: string;
  nombres: string;
  apellidos: string;
  ingresoJornada: string;
  salidaJornada: string;
  inicioBreak: string;
  regresoBreak: string;
  inicioAlmuerzo: string;
  regresoAlmuerzo: string;
  atrasoJornada: string;
  atrasoBreak: string;
  atrasoAlmuerzo: string;
  observaciones: string;
}

export default function JornadaTotalPage() {
  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  const [empleados, setEmpleados] = useState<Array<{ ci: string; nombre: string }>>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>("todos");
  const [datos, setDatos] = useState<ReporteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      const personal = await getAllPersonalUseCase.execute();
      const empleadosList = personal.map((p) => ({
        ci: p.ci,
        nombre: `${p.nombres} ${p.apellidos}`,
      }));
      setEmpleados(empleadosList);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  const handleConsultar = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Debes seleccionar ambas fechas");
      return;
    }

    setIsLoading(true);
    try {
      // Simulación de datos - aquí conectarías con tu repositorio real
      const mockData: ReporteData[] = [
        {
          ci: "1234567890",
          fechaFirma: "2026-01-20",
          nombres: "Juan",
          apellidos: "Pérez",
          ingresoJornada: "08:05:00",
          salidaJornada: "17:00:00",
          inicioBreak: "10:00:00",
          regresoBreak: "10:15:00",
          inicioAlmuerzo: "12:00:00",
          regresoAlmuerzo: "13:00:00",
          atrasoJornada: "00:05:00",
          atrasoBreak: "00:00:00",
          atrasoAlmuerzo: "00:00:00",
          observaciones: "",
        },
      ];

      setDatos(mockData);
      toast.success("Consulta realizada exitosamente");
    } catch (error) {
      toast.error("Error al consultar datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportar = () => {
    toast.info("Función de exportar en desarrollo");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reporte: Jornada Total</h1>
        <p className="text-muted-foreground mt-2">
          Consulta el reporte completo de las jornadas laborales
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha Inicio */}
              <div className="space-y-2">
                <Label>Fecha inicio:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaInicio ? (
                        format(fechaInicio, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaInicio}
                      onSelect={setFechaInicio}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha Fin */}
              <div className="space-y-2">
                <Label>Fecha fin:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaFin && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaFin ? (
                        format(fechaFin, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaFin}
                      onSelect={setFechaFin}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Empleados */}
              <div className="space-y-2">
                <Label>Empleados:</Label>
                <Select value={empleadoSeleccionado} onValueChange={setEmpleadoSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {empleados.map((emp) => (
                      <SelectItem key={emp.ci} value={emp.ci}>
                        {emp.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            {/* Botones */}
            <div className="flex flex-col gap-2 justify-center">
              <Button onClick={handleConsultar} disabled={isLoading} className="gap-2">
                <Search className="h-4 w-4" />
                {isLoading ? "Consultando..." : "Consultar"}
              </Button>
              <Button onClick={handleExportar} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CI</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Inicio Break</TableHead>
                  <TableHead>Regreso Break</TableHead>
                  <TableHead>Inicio Almuerzo</TableHead>
                  <TableHead>Regreso Almuerzo</TableHead>
                  <TableHead>Atraso Jornada</TableHead>
                  <TableHead>Atraso Break</TableHead>
                  <TableHead>Atraso Almuerzo</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                      No hay datos para mostrar. Selecciona los filtros y presiona Consultar.
                    </TableCell>
                  </TableRow>
                ) : (
                  datos.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.ci}</TableCell>
                      <TableCell>{row.fechaFirma}</TableCell>
                      <TableCell>{row.nombres}</TableCell>
                      <TableCell>{row.apellidos}</TableCell>
                      <TableCell>{row.ingresoJornada}</TableCell>
                      <TableCell>{row.salidaJornada}</TableCell>
                      <TableCell>{row.inicioBreak}</TableCell>
                      <TableCell>{row.regresoBreak}</TableCell>
                      <TableCell>{row.inicioAlmuerzo}</TableCell>
                      <TableCell>{row.regresoAlmuerzo}</TableCell>
                      <TableCell>{row.atrasoJornada}</TableCell>
                      <TableCell>{row.atrasoBreak}</TableCell>
                      <TableCell>{row.atrasoAlmuerzo}</TableCell>
                      <TableCell>{row.observaciones}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
