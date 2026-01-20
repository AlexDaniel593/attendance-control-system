"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/src/presentation/components/ui/button";
import { Input } from "@/src/presentation/components/ui/input";
import { Label } from "@/src/presentation/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/presentation/components/ui/sheet";
import { loginSchema } from "@/src/presentation/validators/loginSchema";
import { MockAuthRepository } from "@/src/infrastructure/repositories/MockAuthRepository";
import { LoginUseCase } from "@/src/application/use-cases/LoginUseCase";

const authRepository = new MockAuthRepository();
const loginUseCase = new LoginUseCase(authRepository);

interface LoginSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginSheet({ open, onOpenChange }: LoginSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: "onSubmit",
    async onSubmit(event, context) {
      event.preventDefault();

      const submission = parseWithZod(context.formData, {
        schema: loginSchema,
      });

      if (submission.status !== "success") {
        return submission.reply();
      }

      setIsLoading(true);

      try {
        const user = await loginUseCase.execute(
          submission.value.username,
          submission.value.password
        );

        toast.success("Inicio de sesión exitoso", {
          description: `Bienvenido ${user.username}`,
        });

        onOpenChange(false);
        router.push("/dashboard");
      } catch (error) {
        toast.error("Error de autenticación", {
          description:
            error instanceof Error
              ? error.message
              : "Usuario o contraseña incorrectos",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Acceso Administrativo</SheetTitle>
          <SheetDescription>
            Ingresa tus credenciales para acceder al panel de administración
          </SheetDescription>
        </SheetHeader>

        <form id={form.id} onSubmit={form.onSubmit} noValidate className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor={fields.username.id}>Usuario</Label>
            <Input
              key={fields.username.key}
              id={fields.username.id}
              name={fields.username.name}
              defaultValue={fields.username.initialValue}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              disabled={isLoading}
            />
            {fields.username.errors && (
              <p className="text-sm text-red-500">{fields.username.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.password.id}>Contraseña</Label>
            <Input
              key={fields.password.key}
              id={fields.password.id}
              name={fields.password.name}
              type="password"
              defaultValue={fields.password.initialValue}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              disabled={isLoading}
            />
            {fields.password.errors && (
              <p className="text-sm text-red-500">{fields.password.errors}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
