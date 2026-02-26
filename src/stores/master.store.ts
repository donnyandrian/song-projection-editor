import { create } from "zustand";

interface MasterState {
    activeTab: string;
}

interface MasterActions {
    setActiveTab: (tab: string) => void;
}

type MasterStore = MasterState & MasterActions;

export const useMasterStore = create<MasterStore>((set) => ({
    activeTab: "master-1",

    setActiveTab: (tab) => set({ activeTab: tab }),
}));
