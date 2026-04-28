'use client';

import React, { useState, useEffect } from 'react';
import { SavedChart, NatalChart } from '@/types';
import { deleteChartSynced, getSavedChartsSynced } from '@/lib/storage';
import { Calendar, MapPin, Trash2, ChevronRight, Pencil } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getTierLimits } from '@/lib/limits';

interface SavedChartsProps {
  onSelectChart: (savedChart: SavedChart) => void;
  onEditChart?: (savedChart: SavedChart) => void;
}

export default function SavedCharts({ onSelectChart, onEditChart }: SavedChartsProps) {
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();

  const tierLimits = getTierLimits(profile?.tier);

  useEffect(() => {
    if (!authLoading) {
      void loadCharts();
    }
  }, [authLoading, user]);

  const loadCharts = async () => {
    try {
      const saved = await getSavedChartsSynced(user);
      const validCharts = saved.filter((c) => 
        c && c.chart && c.chart.birthData && c.chart.birthData.name
      );
      setCharts(validCharts);
    } catch (err) {
      console.error('Error loading saved charts:', err);
      setCharts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este mapa astral?')) {
      await deleteChartSynced(id, user);
      await loadCharts();
    }
  };

  const handleSelect = (savedChart: SavedChart) => {
    onSelectChart(savedChart);
  };

  const handleEdit = (savedChart: SavedChart, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditChart) onEditChart(savedChart);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-medium text-purple-200 mb-2">
          Nenhum mapa astral salvo
        </h3>
        <p className="text-sm text-slate-400">
          Calcule seu primeiro mapa astral e ele aparecerá aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-purple-200">
          Mapas Astrais Salvos
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
          {charts.length} / {tierLimits.charts}
        </span>
      </div>

      <div className="space-y-1.5 md:space-y-3 max-h-96 overflow-y-auto">
        {charts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((savedChart) => (
            <div
              key={savedChart.id}
              onClick={() => handleSelect(savedChart)}
              className="group p-2 md:p-4 bg-slate-900/50 border border-purple-500/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-200 truncate text-sm md:text-base">
                      {savedChart.name || 'Mapa sem nome'}
                    </h4>
                    
                    <div className="mt-1.5 md:mt-2 flex flex-wrap items-center gap-2 md:gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {savedChart.birthData?.date || 'Data desconhecida'}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {(savedChart.birthData?.location || '').split(',')[0] || 'Local desconhecido'}
                      </span>
                    </div>

                  <p className="hidden md:block mt-1.5 md:mt-2 text-xs text-slate-500">
                    Salvo em {formatDate(savedChart.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 md:gap-2 ml-2 md:ml-4">
                  <button
                    onClick={(e) => handleEdit(savedChart, e)}
                    className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center p-0 md:p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    title="Editar Dados e Recalcular"
                  >
                    <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={(e) => void handleDelete(savedChart.id, e)}
                    className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center p-0 md:p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
