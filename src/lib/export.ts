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

function pickMajorFromInheritedProperties(projection: ProjectionMasterWithId) {
    const freqBg = new Map<typeof projection.bg, number>();
    const freqTransition = new Map<typeof projection.transition, number>();

    let maxCountBg = 0;
    let maxCountTransition = 0;

    let mostCommonBg = projection.contents[0].bg ?? projection.bg;
    let mostCommonTransition = projection.contents[0].transition ?? projection.transition;

    for (const content of projection.contents) {
        const bg = content.bg ?? projection.bg;
        const transition = content.transition ?? projection.transition;

        const countBg = (freqBg.get(bg) || 0) + 1;
        freqBg.set(bg, countBg);

        const countTransition = (freqTransition.get(transition) || 0) + 1;
        freqTransition.set(transition, countTransition);

        if (countBg > maxCountBg) {
            maxCountBg = countBg;
            mostCommonBg = bg;
        }

        if (countTransition > maxCountTransition) {
            maxCountTransition = countTransition;
            mostCommonTransition = transition;
        }
    }

    const finalBg = mostCommonBg !== projection.bg ? mostCommonBg : projection.bg;
    const finalTransition =
        mostCommonTransition !== projection.transition
            ? mostCommonTransition
            : projection.transition;

    return { finalBg, finalTransition };
}

function stripInheritedProperties(
    projection: ProjectionMasterWithId,
    productionMode: boolean,
): ExportProjectionData {
    if (!productionMode) return projection;

    // If all the contents' background or transition are different from the projection's
    // rewrite the projection's background and transition to the most common value
    const { finalBg, finalTransition } = pickMajorFromInheritedProperties(projection);

    projection.bg = finalBg;
    projection.transition = finalTransition;
    for (const content of projection.contents) {
        if (content.bg === finalBg) delete content.bg;
        if (content.transition === finalTransition) delete content.transition;
    }

    return projection;
}

function stringifyProjectionData(
    data: ExportProjectionData | ExportProjectionData[],
    minified: boolean,
) {
    const indent = minified ? undefined : 2;

    if (Array.isArray(data)) {
        const result: unknown[] = [];
        for (const d of data) {
            const res = ProjectionMasterSchema.safeEncode(d);
            if (!res.success) {
                console.error("Invalid object or Schema mismatch. Error: ", res.error);
                continue;
            }
            result.push(res.data);
        }
        return JSON.stringify(result, null, indent);
    }

    const res = ProjectionMasterSchema.safeEncode(data);
    if (!res.success) {
        console.error("Invalid object or Schema mismatch. Error: ", res.error);
        return "";
    }
    return JSON.stringify(res.data, null, indent);
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
    // Snapshot the input immediately, before any async work.
    const snapshotProjections = targetProjections.map((p) => ({
        ...p,
        contents: p.contents.map((content) => ({ ...content })),
    }));

    const {
        separateFiles = false,
        minifiedMetadata = false,
        productionMode = false,
        includeSettings = false,
    } = options;

    const assets = useAssetStore.getState().assets;
    const zipData: Record<string, Uint8Array> = {};
    const usedAssetPaths = new Set<string>();
    const exportData: ExportProjectionData[] = [];

    for (const projection of snapshotProjections) {
        const stripped = stripInheritedProperties(projection, productionMode);
        exportData.push(stripped);

        // Identify used assets
        if (stripped.bg?.startsWith("asset://")) usedAssetPaths.add(stripped.bg);

        for (const content of stripped.contents) {
            if (content.bg?.startsWith("asset://")) usedAssetPaths.add(content.bg);

            if (typeof content.content === "string") {
                if (content.content.startsWith("asset://")) usedAssetPaths.add(content.content);
            } else {
                for (const path of extractAssetPaths(content.content[1])) {
                    usedAssetPaths.add(path);
                }
            }
        }
    }

    // Add assets to ZIP
    await Promise.all(
        Array.from(usedAssetPaths, async (assetPath) => {
            const asset = assets[assetPath];
            if (asset) {
                const arrayBuffer = await asset.file.arrayBuffer();
                // Strip the "asset://" prefix to create a valid zip path/filename
                const safeName = assetPath.replace("asset://", "");
                zipData[`assets/${safeName}`] = new Uint8Array(arrayBuffer);
            }
        }),
    );

    // Add JSON projection data
    if (separateFiles) {
        for (let i = 0; i < exportData.length; i++) {
            const p = exportData[i];
            const safeTitle = p.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            zipData[`projection-${i + 1}-${safeTitle}.json`] = strToU8(
                stringifyProjectionData(p, minifiedMetadata),
            );
        }
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
