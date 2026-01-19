'use client';

import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/presentation/components/ui/button';
import { Input } from '@/src/presentation/components/ui/input';
import { Label } from '@/src/presentation/components/ui/label';
import { Textarea } from '@/src/presentation/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/presentation/components/ui/select';
import { personalSchema } from '@/src/presentation/validators/personalSchema';
import { MockPersonalRepository } from '@/src/infrastructure/repositories/MockPersonalRepository';
import { CreatePersonalUseCase } from '@/src/application/use-cases/CreatePersonalUseCase';
import { UpdatePersonalUseCase } from '@/src/application/use-cases/UpdatePersonalUseCase';
import { Personal } from '@/src/domain/entities/Personal';
import { Area } from '@/src/domain/entities/Area';
import { 
  Turno, 
  Break, 
  Almuerzo,
  TurnoLabels,
  BreakLabels,
  AlmuerzoLabels
} from '@/src/domain/enums/Catalogos';

const personalRepository = new MockPersonalRepository();
const createPersonalUseCase = new CreatePersonalUseCase(personalRepository);
const updatePersonalUseCase = new UpdatePersonalUseCase(personalRepository);

interface PersonalFormProps {
  selectedPersonal?: Personal | null;
  onSuccess: () => void;
  onCancel: () => void;
  areas: Area[];
}

export function PersonalFormComplete({ selectedPersonal, onSuccess, onCancel, areas }: PersonalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [area, setArea] = useState<string>(selectedPersonal?.id_a.toString() || '1');
  const [turno, setTurno] = useState<string>(selectedPersonal?.id_t.toString() || '1');
  const [breakOption, setBreakOption] = useState<string>(selectedPersonal?.id_b.toString() || '1');
  const [almuerzo, setAlmuerzo] = useState<string>(selectedPersonal?.id_ba.toString() || '1');

  useEffect(() => {
    if (selectedPersonal) {
      setArea(selectedPersonal.id_a.toString());
      setTurno(selectedPersonal.id_t.toString());
      setBreakOption(selectedPersonal.id_b.toString());
      setAlmuerzo(selectedPersonal.id_ba.toString());
    }
  }, [selectedPersonal]);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      const data = Object.fromEntries(formData.entries());
      const parsedData = {
        ...data,
        id_a: Number(area),
        id_t: Number(turno),
        id_b: Number(breakOption),
        id_ba: Number(almuerzo),
        salario: Number(data.salario),
      };
      
      return parseWithZod(new URLSearchParams(Object.entries(parsedData).map(([k, v]) => [k, String(v)])), { 
        schema: personalSchema 
      });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: selectedPersonal ? {
      ci: selectedPersonal.ci,
      nombres: selectedPersonal.nombres,
      apellidos: selectedPersonal.apellidos,
      direccion: selectedPersonal.direccion,
      telefonos: selectedPersonal.telefonos,
      correo: selectedPersonal.correo,
      fechaNacimiento: selectedPersonal.fechaNacimiento,
      fechaIngreso: selectedPersonal.fechaIngreso,
      fechaContrato: selectedPersonal.fechaContrato,
      salario: selectedPersonal.salario,
    } : undefined,
    async onSubmit(event, context) {
      event.preventDefault();
      
      const data = Object.fromEntries(context.formData.entries());
      const parsedData = {
        ci: data.ci as string,
        id_a: Number(area),
        id_t: Number(turno),
        id_b: Number(breakOption),
        id_ba: Number(almuerzo),
        nombres: data.nombres as string,
        apellidos: data.apellidos as string,
        direccion: data.direccion as string,
        telefonos: data.telefonos as string,
        correo: data.correo as string,
        fechaNacimiento: data.fechaNacimiento as string,
        fechaIngreso: data.fechaIngreso as string,
        fechaContrato: data.fechaContrato as string,
        salario: Number(data.salario),
      };

      const submission = parseWithZod(
        new URLSearchParams(Object.entries(parsedData).map(([k, v]) => [k, String(v)])), 
        { schema: personalSchema }
      );

      if (submission.status !== 'success') {
        return submission.reply();
      }

      setIsLoading(true);

      try {
        if (selectedPersonal) {
          await updatePersonalUseCase.execute(selectedPersonal.cl, submission.value);
          toast.success('Personal actualizado exitosamente');
        } else {
          await createPersonalUseCase.execute(submission.value);
          toast.success('Personal creado exitosamente');
        }
        onSuccess();
      } catch (error) {
        toast.error('Error al guardar personal', {
          description: error instanceof Error ? error.message : 'Error desconocido',
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form id={form.id} onSubmit={form.onSubmit} noValidate className="space-y-6">
      {/* Datos Personales */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={fields.nombres.id}>Nombres *</Label>
            <Input
              key={fields.nombres.key}
              id={fields.nombres.id}
              name={fields.nombres.name}
              defaultValue={fields.nombres.initialValue as string}
              disabled={isLoading}
              placeholder="Juan"
            />
            {fields.nombres.errors && (
              <p className="text-sm text-red-500">{fields.nombres.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.apellidos.id}>Apellidos *</Label>
            <Input
              key={fields.apellidos.key}
              id={fields.apellidos.id}
              name={fields.apellidos.name}
              defaultValue={fields.apellidos.initialValue as string}
              disabled={isLoading}
              placeholder="Pérez García"
            />
            {fields.apellidos.errors && (
              <p className="text-sm text-red-500">{fields.apellidos.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.ci.id}>Doc. de Identificación *</Label>
            <Input
              key={fields.ci.key}
              id={fields.ci.id}
              name={fields.ci.name}
              defaultValue={fields.ci.initialValue as string}
              disabled={isLoading}
              placeholder="1234567"
            />
            {fields.ci.errors && (
              <p className="text-sm text-red-500">{fields.ci.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.fechaNacimiento.id}>Fecha de Nacimiento *</Label>
            <Input
              key={fields.fechaNacimiento.key}
              id={fields.fechaNacimiento.id}
              name={fields.fechaNacimiento.name}
              type="date"
              defaultValue={fields.fechaNacimiento.initialValue as string}
              disabled={isLoading}
            />
            {fields.fechaNacimiento.errors && (
              <p className="text-sm text-red-500">{fields.fechaNacimiento.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.telefonos.id}>Teléfono *</Label>
            <Input
              key={fields.telefonos.key}
              id={fields.telefonos.id}
              name={fields.telefonos.name}
              defaultValue={fields.telefonos.initialValue as string}
              disabled={isLoading}
              placeholder="555-0001"
            />
            {fields.telefonos.errors && (
              <p className="text-sm text-red-500">{fields.telefonos.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.correo.id}>Correo Electrónico *</Label>
            <Input
              key={fields.correo.key}
              id={fields.correo.id}
              name={fields.correo.name}
              type="email"
              defaultValue={fields.correo.initialValue as string}
              disabled={isLoading}
              placeholder="juan.perez@example.com"
            />
            {fields.correo.errors && (
              <p className="text-sm text-red-500">{fields.correo.errors}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={fields.direccion.id}>Dirección *</Label>
            <Textarea
              key={fields.direccion.key}
              id={fields.direccion.id}
              name={fields.direccion.name}
              defaultValue={fields.direccion.initialValue as string}
              disabled={isLoading}
              placeholder="Av. Principal 123"
              rows={3}
            />
            {fields.direccion.errors && (
              <p className="text-sm text-red-500">{fields.direccion.errors}</p>
            )}
          </div>
        </div>
      </div>

      {/* Datos Laborales */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Datos Laborales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={fields.fechaIngreso.id}>Fecha de Ingreso *</Label>
            <Input
              key={fields.fechaIngreso.key}
              id={fields.fechaIngreso.id}
              name={fields.fechaIngreso.name}
              type="date"
              defaultValue={fields.fechaIngreso.initialValue as string}
              disabled={isLoading}
            />
            {fields.fechaIngreso.errors && (
              <p className="text-sm text-red-500">{fields.fechaIngreso.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.fechaContrato.id}>Fecha de Contrato *</Label>
            <Input
              key={fields.fechaContrato.key}
              id={fields.fechaContrato.id}
              name={fields.fechaContrato.name}
              type="date"
              defaultValue={fields.fechaContrato.initialValue as string}
              disabled={isLoading}
            />
            {fields.fechaContrato.errors && (
              <p className="text-sm text-red-500">{fields.fechaContrato.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.salario.id}>Salario *</Label>
            <Input
              key={fields.salario.key}
              id={fields.salario.id}
              name={fields.salario.name}
              type="number"
              step="0.01"
              defaultValue={fields.salario.initialValue as string}
              disabled={isLoading}
              placeholder="2500.00"
            />
            {fields.salario.errors && (
              <p className="text-sm text-red-500">{fields.salario.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Área *</Label>
            <Select value={area} onValueChange={setArea} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((areaItem) => (
                  <SelectItem key={areaItem.id} value={areaItem.id.toString()}>
                    {areaItem.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Turno *</Label>
            <Select value={turno} onValueChange={setTurno} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione turno" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TurnoLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Break *</Label>
            <Select value={breakOption} onValueChange={setBreakOption} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione break" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BreakLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Almuerzo *</Label>
            <Select value={almuerzo} onValueChange={setAlmuerzo} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione almuerzo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AlmuerzoLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : selectedPersonal ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
