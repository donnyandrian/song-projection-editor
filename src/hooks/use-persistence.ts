import { useEffect, useRef } from "react";
import { loadAssets, loadProjections, saveProjections, syncAssets } from "@/lib/persistence";
import { useAssetStore } from "@/stores/asset.store";
import { useProjectionStore } from "@/stores/projection.store";
import { useMasterStore } from "@/stores/master.store";

const PROJECTION_SAVE_DEBOUNCE_MS = 500;
const ASSET_SYNC_DEBOUNCE_MS = 300;

/**
 * usePersistence
 *
 * Bootstraps cross-session persistence for the projection editor:
 *
 * • On mount — assets are restored from IndexedDB first (so asset:// URLs
 *   embedded in projection content resolve correctly), then projections are
 *   restored from localStorage with their original UUIDs intact.
 *
 * • After load — subscribes to both stores. Projection changes are debounced
 *   and written to localStorage; asset additions/removals are diffed and
 *   synced to IndexedDB via Dexie.
 *
 * Call this hook once, at the top of the component tree (e.g. inside <App>).
 */
export function usePersistence() {
    // Prevents store subscriptions from writing stale/empty data before the
    // initial load has completed.
    const loadedRef = useRef(false);

    // Tracks which asset IDs were present at the last sync point so we can
    // compute the minimal set of IndexedDB writes on each change.
    const assetIdsRef = useRef<Set<string>>(new Set());

    const projSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const assetSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        void (async () => {
            // 1. Restore assets first — projection content may reference asset://
            //    URLs that must be in the store before projections are parsed.
            await loadAssets();

            if (cancelled) return;

            // 2. Snapshot the restored asset IDs as the new sync baseline.
            assetIdsRef.current = new Set(Object.keys(useAssetStore.getState().assets));

            // 3. Restore projections (preserving UUIDs).
            const restored = loadProjections();

            if (cancelled) return;

            // 4. If projections were restored, activate the first one so the
            //    editor tab bar has a valid selection.
            if (restored) {
                const firstProjection = useProjectionStore.getState().projections[0];
                if (firstProjection) {
                    useMasterStore.getState().setActiveTab(firstProjection.id);
                }
            }

            loadedRef.current = true;
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // ── Projection persistence ─────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = useProjectionStore.subscribe((_state) => {
            if (!loadedRef.current) return;

            // Debounce to avoid a localStorage write on every individual keystroke
            // or rapid store mutation.
            if (projSaveTimerRef.current !== null) {
                clearTimeout(projSaveTimerRef.current);
            }

            projSaveTimerRef.current = setTimeout(() => {
                projSaveTimerRef.current = null;
                saveProjections(useProjectionStore.getState().projections);
            }, PROJECTION_SAVE_DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            if (projSaveTimerRef.current !== null) {
                clearTimeout(projSaveTimerRef.current);
                projSaveTimerRef.current = null;
            }
        };
    }, []);

    // ── Asset persistence ──────────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = useAssetStore.subscribe((_state) => {
            if (!loadedRef.current) return;

            // Debounce: user may drop multiple files in quick succession.
            if (assetSyncTimerRef.current !== null) {
                clearTimeout(assetSyncTimerRef.current);
            }

            assetSyncTimerRef.current = setTimeout(async () => {
                assetSyncTimerRef.current = null;
                // syncAssets reads the latest state internally and returns the
                // new set of IDs to use as the next baseline.
                assetIdsRef.current = await syncAssets(assetIdsRef.current);
            }, ASSET_SYNC_DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            if (assetSyncTimerRef.current !== null) {
                clearTimeout(assetSyncTimerRef.current);
                assetSyncTimerRef.current = null;
            }
        };
    }, []);
}
