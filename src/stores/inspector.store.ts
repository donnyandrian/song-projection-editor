import { create } from "zustand";

type InspectorMode = "queue" | "content" | "settings";

interface InspectorState {
    mode: InspectorMode;
}

interface InspectorActions {
    setMode: (mode: InspectorMode) => void;
}

type InspectorStore = InspectorState & InspectorActions;

export const useInspectorStore = create<InspectorStore>((set) => ({
    mode: "content",

    setMode: (mode) => set({ mode }),
}));
