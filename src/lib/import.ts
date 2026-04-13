import { unzipSync, strFromU8 } from "fflate";
import { useAssetStore } from "@/stores/asset.store";
import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionMaster } from "@/types";
import { jsonArrayToProjections } from "@/lib/json-to-projection";

export async function importProjectionsZip(zipFile: File) {
    const arrayBuffer = await zipFile.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(arrayBuffer));

    const addAsset = useAssetStore.getState().addAsset;

    // Restore Assets first
    for (const [path, uint8Array] of Object.entries(unzipped)) {
        if (path.startsWith("assets/") && uint8Array.length > 0) {
            const safeName = path.replace("assets/", "");
            const originalId = `asset://${safeName}`;
            let mime = "application/octet-stream";

            if (safeName.endsWith(".mp4")) mime = "video/mp4";
            else if (safeName.endsWith(".webm")) mime = "video/webm";
            else if (safeName.endsWith(".svg")) mime = "image/svg+xml";
            else if (/\.(jpg|jpeg|png|gif|webp)$/i.exec(safeName))
                mime = `image/${safeName.split(".").pop()}`;

            const file = new File([uint8Array as unknown as BlobPart], safeName, { type: mime });
            addAsset(file, originalId);
        }
    }

    const importedProjections: ProjectionMaster[] = [];

    // Read all JSON files directly without modifying references
    for (const [path, uint8Array] of Object.entries(unzipped)) {
        if (path.endsWith(".json") && !path.startsWith("assets/")) {
            if (path.endsWith("settings.json")) continue;

            const parsed: ProjectionMaster[] = jsonArrayToProjections(strFromU8(uint8Array));
            importedProjections.push(...parsed);
        }
    }

    if (importedProjections.length === 0) throw new Error("Missing JSON files");

    // Inject raw JSON straight into Store
    const store = useProjectionStore.getState();
    importedProjections.forEach((p) => store.addProjection(p));
}

export function getFileNameFromId(id: string) {
    // Strip UUID from id
    // e.g. "asset://123e4567-e89b-12d3-a456-426614174000-filename.png" -> "filename.png"
    return id.replace(/^asset:\/\/[0-9a-fA-F-]{36}-/, "");
}
