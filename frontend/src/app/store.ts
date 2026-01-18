import { create } from 'zustand';

export type HeartLayers = {
  myocardium: boolean;
  valves: boolean;
  arteries: boolean;
  chambers: boolean;
};

export type PathologyMode = 'none' | 'cad';

type UiState = {
  layers: HeartLayers;
  beat: boolean;
  opacity: number; // 0.2..1
  sectionEnabled: boolean;
  clip: number; // -1..1 (used as a fallback control when gizmo is off)
  pathology: PathologyMode;
  hoveredPart?: string;
  selectedPart?: string;

  resetViewNonce: number;

  setLayer: (key: keyof HeartLayers, value: boolean) => void;
  setBeat: (value: boolean) => void;
  setOpacity: (value: number) => void;
  setSectionEnabled: (value: boolean) => void;
  setClip: (value: number) => void;
  setPathology: (value: PathologyMode) => void;
  setHoveredPart: (value?: string) => void;
  setSelectedPart: (value?: string) => void;
  resetView: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  layers: {
    myocardium: true,
    valves: true,
    arteries: true,
    chambers: true,
  },
  beat: true,
  opacity: 1,
  sectionEnabled: false,
  clip: 0,
  pathology: 'none',
  resetViewNonce: 0,

  setLayer: (key, value) =>
    set((s) => ({
      layers: { ...s.layers, [key]: value },
    })),
  setBeat: (value) => set({ beat: value }),
  setOpacity: (value) => set({ opacity: value }),
  setSectionEnabled: (value) => set({ sectionEnabled: value }),
  setClip: (value) => set({ clip: value }),
  setPathology: (value) => set({ pathology: value }),
  setHoveredPart: (value) => set({ hoveredPart: value }),
  setSelectedPart: (value) => set({ selectedPart: value }),
  resetView: () => set((s) => ({ resetViewNonce: s.resetViewNonce + 1 })),
}));
