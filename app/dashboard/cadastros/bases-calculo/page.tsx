"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

interface BaseCalculo {
    id: number;
    codigo: string;
    descricao: string;
    ativo: boolean;
}

export default function BasesCalculoPage() {
    const router = useRouter();
    const [bases, setBases] = useState<BaseCalculo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        loadBases();
    }, []);

    const loadBases = async () => {
        try {
            setLoading(true);
            const response = await api.get("/bases-calculo");
            setBases(response.data);
        } catch (error) {
            setError("Erro ao carregar bases de cálculo");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta base de cálculo?")) {
            return;
        }

        try {
            await api.delete(`/bases-calculo/${id}`);
            loadBases();
        } catch (error: any) {
            setError(error.response?.data?.message || "Erro ao excluir base de cálculo");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bases de Cálculo</h1>
                <Link href="/dashboard/cadastros/bases-calculo/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Base de Cálculo
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ativo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bases.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    Nenhuma base de cálculo cadastrada
                                </td>
                            </tr>
                        ) : (
                            bases.map((base) => (
                                <tr key={base.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {base.codigo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {base.descricao}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        {base.ativo ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    router.push(`/dashboard/cadastros/bases-calculo/edit/${base.id}`)
                                                }
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(base.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
