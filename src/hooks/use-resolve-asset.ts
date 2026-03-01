import { useAssetStore } from "@/stores/asset.store";

export function useResolveAsset(src?: string) {
    // Select ONLY the specific objectUrl from the store.
    // Zustand will only trigger a re-render if THIS specific string changes.
    // If the asset exists in the store, return its active blob URL.
    // Otherwise, fallback to the original string (for external URLs, base64, or missing assets).
    return useAssetStore((s) => {
        if (!src?.startsWith("asset://")) return src;
        return s.assets[src]?.objectUrl ?? src;
    });
}
