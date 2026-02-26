import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionMasterWithId } from "@/types";
import { create } from "zustand";

interface MasterState {
    activeTab: string;
    activeProjectionIndex: number;
    activeContentIndex: number;
}

interface MasterActions {
    getActiveProjectionIndex: (index?: number) => number;
    getActiveProjection: (index?: number) => ProjectionMasterWithId | null;

    setActiveTab: (tab: string) => void;
    setActiveProjectionIndex: (index: number) => void;
    setActiveContentIndex: (index: number) => void;
}

type MasterStore = MasterState & MasterActions;

const getProjectionIndexById = (id: string) => useProjectionStore.getState().getIndexById(id);
export const useMasterStore = create<MasterStore>((set, get) => ({
    activeTab: "master-1",
    activeProjectionIndex: -1,
    activeContentIndex: -1,

    getActiveProjectionIndex: (index) => {
        const _index = index ?? getProjectionIndexById(get().activeTab);
        set({ activeProjectionIndex: _index });
        return _index;
    },
    getActiveProjection: (index) => {
        const _index = index ?? get().getActiveProjectionIndex();
        if (_index < 0) return null;
        const p = useProjectionStore.getState().projections[_index];
        return p;
    },

    setActiveTab: (tab) => {
        const index = getProjectionIndexById(tab);
        const p = get().getActiveProjection(index);
        set({
            activeTab: tab,
            activeProjectionIndex: index,
            activeContentIndex: (p?.contents.length ?? 0) > 0 ? 0 : -1,
        });
    },
    setActiveProjectionIndex: (index) => set({ activeProjectionIndex: index }),
    setActiveContentIndex: (index) => set({ activeContentIndex: index }),
}));
