import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface LocalAsset {
    id: string;
    file: File;
    objectUrl: string; // Used to preview in the browser (URL.createObjectURL)
}

interface AssetStore {
    assets: Record<string, LocalAsset>;
    addAsset: (file: File, id?: string) => string;
    removeAsset: (id: string) => void;
    clearAssets: () => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
    assets: {},
    addAsset: (file: File, providedId?: string) => {
        const id = providedId ?? `asset://${uuidv4()}-${file.name}`;
        const objectUrl = URL.createObjectURL(file);

        set((state) => ({
            assets: {
                ...state.assets,
                [id]: { id, file, objectUrl },
            },
        }));

        return id;
    },
    removeAsset: (id: string) => {
        set((state) => {
            const newAssets = { ...state.assets };
            if (newAssets[id]) {
                URL.revokeObjectURL(newAssets[id].objectUrl); // Prevent memory leaks
                delete newAssets[id];
            }
            return { assets: newAssets };
        });
    },
    clearAssets: () => {
        set((state) => {
            Object.values(state.assets).forEach((asset) => URL.revokeObjectURL(asset.objectUrl));
            return { assets: {} };
        });
    },
}));
