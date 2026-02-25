import { create } from "zustand";

interface TabsState {
    activeTab: string;
}

interface TabsActions {
    setActiveTab: (tab: string) => void;
}

type TabsStore = TabsState & TabsActions;

export const useTabsStore = create<TabsStore>((set) => ({
    activeTab: "master-1",

    setActiveTab: (tab) => set({ activeTab: tab }),
}));
