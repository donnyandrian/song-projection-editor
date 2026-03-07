import { exportProjections } from "@/lib/export";
import { importProjectionsZip } from "@/lib/import";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";

export const duplQueue = () => {
    const { activeProjectionIndex, setActiveTab } = useMasterStore.getState();
    if (activeProjectionIndex < 0) return;

    const newId = useProjectionStore.getState().duplicateProjection(activeProjectionIndex);
    if (newId) {
        setActiveTab(newId);
    }
};

export const duplContent = () => {
    const { activeProjectionIndex, activeContentIndex, setActiveContentIndex } =
        useMasterStore.getState();
    if (activeProjectionIndex < 0 || activeContentIndex < 0) return;

    const newIndex = useProjectionStore
        .getState()
        .duplicateContent(activeProjectionIndex, activeContentIndex);
    if (newIndex !== null) {
        setActiveContentIndex(newIndex);
    }
};

export const importFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        if (file.name.endsWith(".zip")) {
            await importProjectionsZip(file);
        } else {
            alert("Please select a valid .zip export file.");
        }
    } catch (err) {
        console.error("Import failed", err);
        alert("Failed to import. The file might be corrupted or in an older format.");
    }

    // Reset the input so the user can import the same file again if needed
    e.target.value = "";
};

export const exportAll = () => {
    const projections = useProjectionStore.getState().projections;
    if (projections.length === 0) return;
    void exportProjections(projections, "projections-all.zip", false);
};

export const exportActive = () => {
    const activeProjectionIndex = useMasterStore.getState().activeProjectionIndex;
    const projections = useProjectionStore.getState().projections;

    if (activeProjectionIndex < 0) return;

    const activeProjection = projections[activeProjectionIndex];
    if (!activeProjection) return;

    // Basic sanitization for the filename
    const safeTitle = activeProjection.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    void exportProjections([activeProjection], `projection-${safeTitle}.zip`, false);
};

export const exportSeparate = () => {
    const projections = useProjectionStore.getState().projections;
    if (projections.length === 0) return;

    void exportProjections(projections, "projections-separate.zip", true);
};
