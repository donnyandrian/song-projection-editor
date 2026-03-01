import { zipSync, strToU8 } from "fflate";
import { useAssetStore } from "@/stores/asset.store";
import type { ProjectionMasterWithId } from "@/types";

export async function exportProjections(
    targetProjections: ProjectionMasterWithId[],
    filename = "export.zip",
    separateFiles = false,
) {
    const assets = useAssetStore.getState().assets;
    const zipData: Record<string, Uint8Array> = {};
    const usedAssetIds = new Set<string>();

    // Identify used assets
    targetProjections.forEach((proj) => {
        if (proj.bg && proj.bg.startsWith("asset://")) usedAssetIds.add(proj.bg);
        proj.contents.forEach((content) => {
            if (content.bg && content.bg.startsWith("asset://")) usedAssetIds.add(content.bg);
            if (typeof content.content === "string" && content.content.startsWith("asset://")) {
                usedAssetIds.add(content.content);
            }
        });
    });

    // Add assets to ZIP
    for (const assetId of usedAssetIds) {
        const asset = assets[assetId];
        if (asset) {
            const arrayBuffer = await asset.file.arrayBuffer();
            // Strip the "asset://" prefix to create a valid zip path/filename
            const safeName = assetId.replace("asset://", "");
            zipData[`assets/${safeName}`] = new Uint8Array(arrayBuffer);
        }
    }

    // Add JSON projection data
    if (separateFiles) {
        targetProjections.forEach((p, i) => {
            const safeTitle = p.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            zipData[`projection-${i + 1}-${safeTitle}.json`] = strToU8(JSON.stringify(p, null, 2));
        });
    } else {
        zipData["projections.json"] = strToU8(JSON.stringify(targetProjections, null, 2));
    }

    // Generate and download
    const zipped = zipSync(zipData);
    const blob = new Blob([zipped as unknown as BlobPart], { type: "application/zip" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}
