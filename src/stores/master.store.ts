import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionMasterWithId } from "@/types";
import { create } from "zustand";

interface MasterState {
    activeTab: string;
}

interface MasterActions {
    getActiveProjectionIndex(): number;
    getActiveProjection(): ProjectionMasterWithId | null;

    setActiveTab: (tab: string) => void;
}

type MasterStore = MasterState & MasterActions;

export const useMasterStore = create<MasterStore>((set, get) => ({
    activeTab: "master-1",

    getActiveProjectionIndex: () => useProjectionStore.getState().getIndexById(get().activeTab),
    getActiveProjection: () => {
        const index = get().getActiveProjectionIndex();
        if (index < 0) return null;
        const p = useProjectionStore.getState().projections[index];
        return p;
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
}));
