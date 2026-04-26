'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BirthData, GeocodingResult } from '@/types';
import { getTimezoneFromCoordinates } from '@/lib/geocoding';
import { Search, MapPin, Clock, Calendar, User } from 'lucide-react';

import { useGeocoding } from '@/hooks/useGeocoding';

interface BirthFormProps {
  onSubmit: (data: BirthData) => void;
  initialData?: BirthData;
  loading?: boolean;
}

export default function BirthForm({ onSubmit, initialData, loading }: BirthFormProps) {
  // 1. Estados de Dados do Formulário
  const [formData, setFormData] = useState<BirthData>({
    name: initialData?.name || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    timezone: initialData?.timezone || '',
  });

  const [isEditingCoords, setIsEditingCoords] = useState(false);

  // 2. Hook Customizado de Geolocalização
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    showResults,
    setShowResults,
    isSearching,
    handleSearch
  } = useGeocoding();

  // 3. Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 4. Efeitos de Sincronização
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name || '',
        date: initialData.date || '',
        time: initialData.time || '',
        location: initialData.location || '',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        timezone: initialData.timezone || '',
      });
      setSearchQuery(initialData.location || '');
    }
  }, [initialData, setSearchQuery]);

  // Efeito para posicionamento do portal de resultados
  useEffect(() => {
    if (showResults && searchInputRef.current && dropdownRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      const el = dropdownRef.current;
      el.style.position = 'fixed';
      el.style.top = `${rect.bottom + 8}px`;
      el.style.left = `${rect.left}px`;
      el.style.width = `${rect.width}px`;
      el.style.zIndex = '9999';
    }
  }, [showResults, searchResults]);

  // 5. Handlers
  const onSearchClick = useCallback(async () => {
    await handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  const handleSelectLocation = (result: GeocodingResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: result.lat,
      longitude: result.lon,
      timezone: getTimezoneFromCoordinates(result.lat, result.lon),
    }));
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.date && formData.time && formData.latitude !== undefined && formData.longitude !== undefined) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3 md:space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="birthName" className="block text-sm font-medium text-purple-200 mb-1.5 md:mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Nome Completo
          </label>
          <input
            id="birthName"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2.5 md:py-3 bg-slate-900/80 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
            placeholder="Digite seu nome"
            required
          />
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-purple-200 mb-1.5 md:mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Data de Nascimento
            </label>
            <input
              id="birthDate"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-2.5 md:py-3 bg-slate-900/80 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all cursor-pointer"
              required
            />
          </div>

          <div>
            <label htmlFor="birthTime" className="block text-sm font-medium text-purple-200 mb-1.5 md:mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Hora de Nascimento
            </label>
            <input
              id="birthTime"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-2.5 md:py-3 bg-slate-900/80 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Localização */}
        <div className="relative">
          <div className="flex justify-between items-end mb-1.5 md:mb-2">
            <label htmlFor="birthLocation" className="text-sm font-medium text-purple-200">
              <MapPin className="inline w-4 h-4 mr-2 mb-0.5" />
              Local de Nascimento
            </label>
            <span className="text-[10px] text-slate-500 italic font-medium">Otimizado para o Brasil</span>
          </div>
          <div className="flex gap-2">
            <input
              id="birthLocation"
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onSearchClick())}
              className="flex-1 px-4 py-2.5 md:py-3 bg-slate-900/80 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              placeholder="Ex: São Paulo, SP, Brasil"
            />
            <button
              type="button"
              onClick={onSearchClick}
              disabled={isSearching || searchQuery.length < 3}
              title="Pesquisar local"
              aria-label="Pesquisar local"
              className="px-4 py-2.5 md:py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Resultados da busca */}
          {showResults && searchResults.length > 0 && createPortal(
            <div ref={dropdownRef} className="z-[9999] bg-slate-900 border border-purple-500/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto touch-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectLocation(result)}
                  className="w-full px-4 py-2.5 md:py-3 text-left hover:bg-purple-500/20 transition-colors border-b border-purple-500/10 last:border-0"
                >
                  <p className="text-sm text-white whitespace-normal break-words leading-snug">{result.display_name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {result.lat.toFixed(4)}°, {result.lon.toFixed(4)}°
                  </p>
                </button>
              ))}
            </div>,
            document.body
          )}

          {showResults && searchResults.length === 0 && !isSearching && createPortal(
            <div ref={dropdownRef} className="z-[9999] bg-slate-900 border border-purple-500/30 rounded-lg shadow-xl p-4">
              <p className="text-sm text-slate-400">Nenhum local encontrado. Tente digitar o nome da cidade e do estado.</p>
            </div>,
            document.body
          )}
        </div>

        {/* Coordenadas selecionadas */}
        {(formData.latitude !== 0 || formData.longitude !== 0) && (
          <div className="p-3 md:p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-200">
                <MapPin className="inline w-4 h-4 mr-2" />
                Coordenadas:
              </p>
              <button
                type="button"
                onClick={() => setIsEditingCoords(!isEditingCoords)}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                {isEditingCoords ? 'Salvar' : 'Editar manualmente'}
              </button>
            </div>
            {isEditingCoords ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  className="flex-1 px-2 py-1 bg-slate-900 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:border-purple-400"
                  placeholder="Lat"
                />
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  className="flex-1 px-2 py-1 bg-slate-900 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:border-purple-400"
                  placeholder="Lon"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                Latitude: {formData.latitude.toFixed(4)}° | Longitude: {formData.longitude.toFixed(4)}°
              </p>
            )}
          </div>
        )}
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={loading || !formData.latitude || !formData.longitude}
        className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-800/50 disabled:to-indigo-800/50 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculando Mapa Astral...
          </span>
        ) : (
          'Calcular Mapa Astral'
        )}
      </button>
    </form>
  );
}
