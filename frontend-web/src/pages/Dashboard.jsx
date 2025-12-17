import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRightOnRectangleIcon,
    ClipboardDocumentCheckIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [audits, setAudits] = useState([]);
    const { logout, user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudits = async () => {
            try {
                const response = await api.get('/audits/');
                // Sort by date desc
                const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setAudits(sorted);
            } catch (error) {
                console.error("Error fetching audits", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAudits();

        // Poll for updates every 10 seconds to see new syncs live
        const interval = setInterval(fetchAudits, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'VALIDATED': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'VALIDATED': return <CheckCircleIcon className="w-4 h-4 mr-1" />;
            case 'COMPLETED': return <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />;
            default: return <ClockIcon className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Panel de Auditoría</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500 hidden sm:block">
                                Hola, <span className="font-medium text-gray-900">{user?.username || 'Usuario'}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 focus:outline-none transition"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats / Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Resumen de Actividad</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Visualizando {audits.length} auditorías registradas en el sistema.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : audits.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay auditorías</h3>
                        <p className="mt-1 text-sm text-gray-500">Sincroniza desde la app móvil para ver datos aquí.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {audits.map((audit) => (
                            <div
                                key={audit.id}
                                className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(audit.status)}`}>
                                            {getStatusIcon(audit.status)}
                                            {audit.status}
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <CalendarIcon className="w-3 h-3 mr-1" />
                                            {new Date(audit.date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={audit.establishment_name}>
                                        {audit.establishment_name || 'Sin Nombre'}
                                    </h3>

                                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-2">
                                                {(audit.auditor || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span>{audit.auditor || 'Auditor'}</span>
                                        </div>
                                        {audit.score > 0 && (
                                            <span className="font-semibold text-gray-900">
                                                Puntaje: {audit.score}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center w-full">
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
