import { IconDropdownButton, IconDropdownMenuItem } from "@/components/core/buttons";
import { AddMasterContent, AddMasterQueue } from "@/components/master/add/dialog";
import { DeleteMasterContent, DeleteMasterQueue } from "@/components/master/delete/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { downloadBlob, downloadJson, importJson } from "@/lib/utils";
import { ImportSchema } from "@/schemas/master";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";
import {
    Add01Icon,
    Delete03Icon,
    File02Icon,
    FileExportIcon,
    FileImportIcon,
    Files01Icon,
    FileViewIcon,
    KeyframesDoubleIcon,
    Layers01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useMemo, useState } from "react";
import { zipSync, strToU8 } from "fflate";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function MasterTabs() {
    const projections = useProjectionStore((s) => s.projections);

    if (projections.length === 0) return null;

    return (
        <TabsList className="justify-start overflow-scroll *:px-6">
            {projections.map((p) => (
                <TabsTrigger key={p.id} value={p.id}>
                    {p.title}
                </TabsTrigger>
            ))}
        </TabsList>
    );
}

export function AddMasterButton() {
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<"queue" | "content">("queue");

    const dialogContent = useMemo(() => {
        return dialogType === "queue" ? (
            <AddMasterQueue setOpenDialog={setOpenDialog} />
        ) : (
            <AddMasterContent setOpenDialog={setOpenDialog} />
        );
    }, [dialogType]);

    const hasActiveQueue = useMasterStore((s) => s.activeProjectionIndex >= 0);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("A", () => {
            if (useMasterStore.getState().activeProjectionIndex < 0) return;

            setDialogType("content");
            setOpenDialog(true);
        });
        register("Shift+A", () => {
            setDialogType("queue");
            setOpenDialog(true);
        });

        return () => {
            unregister("A");
            unregister("Shift+A");
        };
    }, [register, unregister]);

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <IconDropdownButton
                size="icon-sm"
                label="Add Item"
                icon={Add01Icon}
                iconStrokeWidth={2.25}
            >
                <DialogTrigger asChild>
                    <IconDropdownMenuItem
                        label={"Add Queue"}
                        text="Queue"
                        icon={KeyframesDoubleIcon}
                        iconStrokeWidth={1.75}
                        onSelect={() => setDialogType("queue")}
                        accelerator={{
                            key: "A",
                            shift: true,
                        }}
                    />
                </DialogTrigger>
                {hasActiveQueue && (
                    <DialogTrigger asChild>
                        <IconDropdownMenuItem
                            label={"Add Content"}
                            text="Content"
                            icon={Layers01Icon}
                            iconStrokeWidth={1.75}
                            onSelect={() => setDialogType("content")}
                            accelerator={{
                                key: "A",
                            }}
                        />
                    </DialogTrigger>
                )}
            </IconDropdownButton>
            {dialogContent}
        </Dialog>
    );
}

export function DeleteMasterButton() {
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<"queue" | "content">("queue");

    const dialogContent = useMemo(() => {
        return dialogType === "queue" ? (
            <DeleteMasterQueue setOpenDialog={setOpenDialog} />
        ) : (
            <DeleteMasterContent setOpenDialog={setOpenDialog} />
        );
    }, [dialogType]);

    const hasContents = useMasterStore((s) => {
        const index = s.activeProjectionIndex;
        return (s.getActiveProjection(index)?.contents.length ?? 0) > 0;
    });

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Delete", () => {
            if ((useMasterStore.getState().getActiveProjection()?.contents?.length ?? 0) <= 0)
                return;

            setDialogType("content");
            setOpenDialog(true);
        });
        register("Shift+Delete", () => {
            setDialogType("queue");
            setOpenDialog(true);
        });

        return () => {
            unregister("Delete");
            unregister("Shift+Delete");
        };
    }, [register, unregister]);

    return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <IconDropdownButton
                size="icon-sm"
                label="Delete Item"
                icon={Delete03Icon}
                iconStrokeWidth={1.75}
                iconClassName="text-destructive"
            >
                <AlertDialogTrigger asChild>
                    <IconDropdownMenuItem
                        label={"Delete Queue"}
                        text="Queue"
                        icon={KeyframesDoubleIcon}
                        iconStrokeWidth={1.75}
                        onSelect={() => setDialogType("queue")}
                        accelerator={{
                            key: "Delete",
                            shift: true,
                        }}
                    />
                </AlertDialogTrigger>
                {hasContents && (
                    <AlertDialogTrigger asChild>
                        <IconDropdownMenuItem
                            label={"Delete Content"}
                            text="Content"
                            icon={Layers01Icon}
                            iconStrokeWidth={1.75}
                            onSelect={() => setDialogType("content")}
                            accelerator={{
                                key: "Delete",
                            }}
                        />
                    </AlertDialogTrigger>
                )}
            </IconDropdownButton>
            {dialogContent}
        </AlertDialog>
    );
}

export function ImportExportButton() {
    const hasActiveQueue = useMasterStore((s) => s.activeProjectionIndex >= 0);
    const hasProjections = useProjectionStore((s) => s.projections.length > 0);

    const handleImport = () => {
        importJson((data) => {
            try {
                // Safely validate and strip internal IDs or excess keys
                const parsed = ImportSchema.parse(data);
                const store = useProjectionStore.getState();

                if (Array.isArray(parsed)) {
                    parsed.forEach((p) => store.addProjection(p));
                } else {
                    store.addProjection(parsed);
                }
            } catch (err) {
                console.error("Invalid projection data format", err);
                alert("Invalid projection data format. Import failed.");
            }
        });
    };

    const handleExportAll = () => {
        const projections = useProjectionStore.getState().projections;
        if (projections.length === 0) return;
        downloadJson(projections, "projections-all.json");
    };

    const handleExportActive = () => {
        const activeProjectionIndex = useMasterStore.getState().activeProjectionIndex;
        const projections = useProjectionStore.getState().projections;

        if (activeProjectionIndex < 0) return;

        const activeProjection = projections[activeProjectionIndex];
        if (!activeProjection) return;

        // Basic sanitization for the filename
        const safeTitle = activeProjection.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        downloadJson(activeProjection, `projection-${safeTitle}.json`);
    };

    const handleExportSeparate = () => {
        const projections = useProjectionStore.getState().projections;
        if (projections.length === 0) return;

        // Prepare files for fflate
        const files: Record<string, Uint8Array> = {};

        projections.forEach((p, i) => {
            const safeTitle = p.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            // Prefixing with index (i + 1) to guarantee filename uniqueness if multiple projections share a title
            const filename = `projection-${i + 1}-${safeTitle}.json`;
            files[filename] = strToU8(JSON.stringify(p, null, 2));
        });

        // Pack them synchronously
        const zipped = zipSync(files) as unknown as BlobPart;
        const blob = new Blob([zipped], { type: "application/zip" });

        downloadBlob(blob, "projections-separate.zip");
    };

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Shift+I", handleImport);
        register("Shift+E", handleExportAll);
        register("Shift+P", handleExportActive);

        return () => {
            unregister("Shift+I");
            unregister("Shift+E");
            unregister("Shift+P");
        };
    }, [register, unregister]);

    return (
        <IconDropdownButton
            size="icon-sm"
            label="Import/Export"
            icon={File02Icon}
            iconStrokeWidth={1.75}
        >
            <IconDropdownMenuItem
                label={"Import JSON"}
                text="Import Projections"
                icon={FileImportIcon}
                iconStrokeWidth={1.75}
                accelerator={{ key: "I", shift: true }}
                onSelect={handleImport}
            />{" "}
            {hasProjections && (
                <>
                    <DropdownMenuSeparator />
                    <IconDropdownMenuItem
                        label={"Export All"}
                        text="Export All (Single File)"
                        icon={FileExportIcon}
                        iconStrokeWidth={1.75}
                        accelerator={{ key: "E", shift: true }}
                        onSelect={handleExportAll}
                    />
                    <IconDropdownMenuItem
                        label={"Export Separate"}
                        text="Export Separate Files"
                        icon={Files01Icon}
                        iconStrokeWidth={1.75}
                        onSelect={handleExportSeparate}
                    />
                </>
            )}
            {hasActiveQueue && (
                <IconDropdownMenuItem
                    label={"Export Active"}
                    text="Export Active Projection"
                    icon={FileViewIcon}
                    iconStrokeWidth={1.75}
                    accelerator={{ key: "P", shift: true }}
                    onSelect={handleExportActive}
                />
            )}
        </IconDropdownButton>
    );
}
