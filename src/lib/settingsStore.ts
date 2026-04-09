import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AspectOrbs {
  conjunction: number;
  sextile: number;
  square: number;
  trine: number;
  opposition: number;
}

export interface SettingsState {
  orbs: AspectOrbs;
  setOrbs: (orbs: Partial<AspectOrbs>) => void;
  resetOrbs: () => void;
}

export const defaultOrbs: AspectOrbs = {
  conjunction: 8,
  sextile: 6,
  square: 8,
  trine: 8,
  opposition: 8,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      orbs: defaultOrbs,
      setOrbs: (newOrbs) =>
        set((state) => ({
          orbs: { ...state.orbs, ...newOrbs },
        })),
      resetOrbs: () => set({ orbs: defaultOrbs }),
    }),
    {
      name: 'astromap-settings',
    }
  )
);
