import { create } from "zustand";

interface InspectorState {
    mode: "queue" | "content";
}

interface InspectorActions {
    setMode: (mode: "queue" | "content") => void;
}

type InspectorStore = InspectorState & InspectorActions;

export const useInspectorStore = create<InspectorStore>((set) => ({
    mode: "content",

    setMode: (mode) => set({ mode }),
}));
