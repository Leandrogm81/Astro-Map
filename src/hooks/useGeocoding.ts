import { useState, useCallback } from 'react';
import { GeocodingResult } from '@/types';
import { geocodeLocation } from '@/lib/geocoding';

export function useGeocoding() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 3) return;

    setIsSearching(true);
    try {
      const results = await geocodeLocation(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Erro na busca geográfica:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    showResults,
    setShowResults,
    isSearching,
    handleSearch,
  };
}
