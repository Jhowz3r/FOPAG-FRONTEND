"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import api from "@/lib/axios";

const baseCalculoSchema = z.object({
    codigo: z.string().min(1, "Código é obrigatório"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    ativo: z.boolean().default(true),
});

type BaseCalculoFormData = z.infer<typeof baseCalculoSchema>;

export default function NewBaseCalculoPage() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string>("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<BaseCalculoFormData>({
        resolver: zodResolver(baseCalculoSchema),
        defaultValues: {
            ativo: true,
        },
    });

    const onSubmit = async (data: BaseCalculoFormData) => {
        try {
            setErrorMessage("");
            await api.post("/bases-calculo", data);
            router.push("/dashboard/cadastros/bases-calculo");
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message || "Erro ao salvar base de cálculo"
            );
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Nova Base de Cálculo</h1>
                </div>
            </div>

            {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <div className="space-y-6">
                    <Input
                        label="Código"
                        {...register("codigo")}
                        error={errors.codigo?.message}
                        required
                    />

                    <Input
                        label="Descrição"
                        {...register("descricao")}
                        error={errors.descricao?.message}
                        required
                    />

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="ativo"
                            {...register("ativo")}
                        />
                        <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                            Ativo
                        </label>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Salvar
                    </Button>
                </div>
            </form>
        </div>
    );
}
