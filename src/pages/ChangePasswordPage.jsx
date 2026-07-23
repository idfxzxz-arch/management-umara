import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

const schema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Konfirmasi password tidak sama",
  });

export function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    await changePassword(values.password);
    toast.success("Password berhasil diganti.");
    navigate("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-green-700 text-white">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold">Change Password</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          First login tidak boleh masuk dashboard sebelum password diganti.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Password Baru</span>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <span className="text-xs text-red-600">
                Minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol.
              </span>
            )}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Konfirmasi Password</span>
            <Input type="password" {...register("confirm")} />
            {errors.confirm && (
              <span className="text-xs text-red-600">
                {errors.confirm.message}
              </span>
            )}
          </label>
          <Button className="w-full">Simpan Password</Button>
        </form>
      </Card>
    </main>
  );
}
