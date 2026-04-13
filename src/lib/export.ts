import { zipSync, strToU8 } from "fflate";
import { useAssetStore } from "@/stores/asset.store";
import type { ProjectionMasterWithId } from "@/types";
import { useSettingsStore } from "@/stores/settings.store";
import { ProjectionMasterSchema } from "@/schemas/projection";

export interface ExportProjectionOptions {
    separateFiles?: boolean;
    minifiedMetadata?: boolean;
    productionMode?: boolean;
    includeSettings?: boolean;
}

type ExportProjectionData = ProjectionMasterWithId;

function stripInheritedProperties(
    projection: ProjectionMasterWithId,
    productionMode: boolean,
): ExportProjectionData {
    if (!productionMode) {
        return {
            ...projection,
            contents: projection.contents.map((content) => ({ ...content })),
        };
    }

    return {
        ...projection,
        contents: projection.contents.map((content) => {
            const nextContent = { ...content };

            if (nextContent.bg === projection.bg) {
                delete nextContent.bg;
            }

            if (nextContent.transition === projection.transition) {
                delete nextContent.transition;
            }

            return nextContent;
        }),
    };
}

function stringifyProjectionData(
    data: ExportProjectionData | ExportProjectionData[],
    minified: boolean,
) {
    let result: unknown;
    if (Array.isArray(data)) {
        result = [];
        for (const d of data) {
            const res = ProjectionMasterSchema.safeEncode(d);
            if (!res.success) {
                console.error("Invalid object or Schema mismatch. Error: ", res.error);
                continue;
            }
            (result as unknown[]).push(res.data);
        }
    } else {
        result = {};
        const res = ProjectionMasterSchema.safeEncode(data);
        if (!res.success) {
            console.error("Invalid object or Schema mismatch. Error: ", res.error);
            return "";
        }
        result = res.data;
    }
    return JSON.stringify(result, null, minified ? undefined : 2);
}

/**
 * Extracts all asset paths matching the format:
 * asset://<<UUID>>-<<NAME>>.<<EXTENSION>>
 * * @param input - The stringified object or raw string to search
 * @returns An array of unique asset paths found
 */
export const extractAssetPaths = (input: string): string[] => {
    if (!input) return [];

    /**
     * Regex breakdown:
     * asset:\/\/           - Literal prefix
     * [a-fA-F0-9-]{36}     - Standard UUID
     * -                    - Separator
     * [^<>:"/\\|?*]+       - <<NAME>>: OS-safe pattern (allows spaces)
     * \.                   - The literal dot
     * [^\s<>:"/\\|?*]+     - <<EXTENSION>>: OS-safe pattern (exclude spaces)
     */
    const assetRegex =
        /asset:\/\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}-[^<>:"/\\|?*]+\.[^\s<>:"/\\|?*]+/g;

    const matches = input.match(assetRegex);

    return matches ? [...new Set(matches)] : [];
};

export async function exportProjections(
    targetProjections: ProjectionMasterWithId[],
    filename = "export.zip",
    options: ExportProjectionOptions = {},
) {
    const {
        separateFiles = false,
        minifiedMetadata = false,
        productionMode = false,
        includeSettings = false,
    } = options;

    const assets = useAssetStore.getState().assets;
    const zipData: Record<string, Uint8Array> = {};
    const usedAssetIds = new Set<string>();
    const exportData = targetProjections.map((projection) =>
        stripInheritedProperties(projection, productionMode),
    );

    // Identify used assets
    exportData.forEach((proj) => {
        if (proj.bg && proj.bg.startsWith("asset://")) usedAssetIds.add(proj.bg);
        proj.contents.forEach((content) => {
            if (content.bg && content.bg.startsWith("asset://")) usedAssetIds.add(content.bg);
            if (typeof content.content === "string" && content.content.startsWith("asset://")) {
                usedAssetIds.add(content.content);
            } else if (typeof content.content !== "string") {
                const assetPaths = extractAssetPaths(content.content[1]);
                assetPaths.forEach((path) => usedAssetIds.add(path));
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
        exportData.forEach((p, i) => {
            const safeTitle = p.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            zipData[`projection-${i + 1}-${safeTitle}.json`] = strToU8(
                stringifyProjectionData(p, minifiedMetadata),
            );
        });
    } else {
        zipData["projections.json"] = strToU8(
            stringifyProjectionData(exportData, minifiedMetadata),
        );
    }

    if (includeSettings) {
        const settings = useSettingsStore.getState().global;
        zipData["settings.json"] = strToU8(
            JSON.stringify(settings, null, minifiedMetadata ? undefined : 2),
        );
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
