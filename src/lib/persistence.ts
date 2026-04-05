import { db } from "@/lib/db";
import { jsonObjectToProjection } from "@/lib/json-to-projection";
import { ProjectionMasterSchema } from "@/schemas/projection";
import { useAssetStore } from "@/stores/asset.store";
import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionMasterWithId } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const PROJECTIONS_STORAGE_KEY = "xellanix-song-projection-editor:projections";

// ─── Projections ──────────────────────────────────────────────────────────────

/**
 * Serialise the current in-memory projection array (including UUIDs) to a
 * JSON string and write it to localStorage.
 *
 * The Component codec's `encode` path is invoked via `ProjectionMasterSchema
 * .safeEncode` so React nodes are converted back to raw JSON before storage.
 */
export function saveProjections(projections: ProjectionMasterWithId[]): void {
    try {
        const serialised: unknown[] = [];

        for (const projection of projections) {
            const result = ProjectionMasterSchema.safeEncode(projection);
            if (!result.success) {
                console.warn("[persistence] Failed to encode projection:", result.error);
                continue;
            }
            // Attach the runtime id so we can restore it without regenerating UUIDs.
            serialised.push({ ...(result.data as object), id: projection.id });
        }

        localStorage.setItem(PROJECTIONS_STORAGE_KEY, JSON.stringify(serialised));
    } catch (err) {
        console.error("[persistence] Failed to save projections:", err);
    }
}

/**
 * Read projections from localStorage and inject them into the projection store.
 * IDs are preserved so that any in-flight references (active tab, etc.) remain valid.
 *
 * @returns `true` if at least one projection was restored.
 */
export function loadProjections(): boolean {
    const raw = localStorage.getItem(PROJECTIONS_STORAGE_KEY);
    if (!raw) return false;

    try {
        const parsed: unknown[] = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return false;

        const restored: ProjectionMasterWithId[] = [];

        for (const item of parsed) {
            // Extract the id we embedded at save-time before passing to the schema parser.
            const id =
                typeof item === "object" && item !== null && "id" in item
                    ? String((item as Record<string, unknown>).id)
                    : undefined;

            if (!id) {
                console.warn("[persistence] Skipping projection without id:", item);
                continue;
            }

            const projection = jsonObjectToProjection(item);
            if (!projection) continue;

            restored.push({ ...projection, id });
        }

        if (restored.length === 0) return false;

        useProjectionStore.getState().setProjectionsWithIds(restored);
        return true;
    } catch (err) {
        console.error("[persistence] Failed to load projections:", err);
        return false;
    }
}

// ─── Assets ───────────────────────────────────────────────────────────────────

/**
 * Read all assets from IndexedDB and rehydrate the asset store.
 * Each `File` is reconstructed from the stored `ArrayBuffer` so the browser can
 * create a fresh `objectUrl` for it.
 */
export async function loadAssets(): Promise<void> {
    try {
        const stored = await db.assets.toArray();
        const addAsset = useAssetStore.getState().addAsset;

        for (const record of stored) {
            const file = new File([record.data], record.name, {
                type: record.type || "application/octet-stream",
            });
            // Pass the original id so asset:// references in projections stay valid.
            addAsset(file, record.id);
        }
    } catch (err) {
        console.error("[persistence] Failed to load assets from IndexedDB:", err);
    }
}

/**
 * Diff the current asset map against the previously known set of IDs and
 * apply the minimum number of IndexedDB writes needed to keep them in sync.
 *
 * @param previousIds  The set of asset IDs that were present before this update.
 * @returns            The updated set of asset IDs (to be stored as the new baseline).
 */
export async function syncAssets(previousIds: Set<string>): Promise<Set<string>> {
    const currentAssets = useAssetStore.getState().assets;
    const currentIds = new Set(Object.keys(currentAssets));

    // ── Deletions ─────────────────────────────────────────────────────────────
    const toDelete: string[] = [];
    for (const id of previousIds) {
        if (!currentIds.has(id)) toDelete.push(id);
    }
    if (toDelete.length > 0) {
        try {
            await db.assets.bulkDelete(toDelete);
        } catch (err) {
            console.error("[persistence] Failed to delete assets from IndexedDB:", err);
        }
    }

    // ── Additions ─────────────────────────────────────────────────────────────
    const toAdd = Object.entries(currentAssets).filter(([id]) => !previousIds.has(id));
    for (const [id, asset] of toAdd) {
        try {
            const data = await asset.file.arrayBuffer();
            await db.assets.put({
                id,
                name: asset.file.name,
                type: asset.file.type || "application/octet-stream",
                data,
            });
        } catch (err) {
            console.error(`[persistence] Failed to store asset "${id}" in IndexedDB:`, err);
        }
    }

    return currentIds;
}
