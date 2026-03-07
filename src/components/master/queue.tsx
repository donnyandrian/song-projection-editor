import { IconDropdownButton, IconDropdownMenuItem } from "@/components/core/buttons";
import { AddMasterContent, AddMasterQueue } from "@/components/master/add/dialog";
import { DeleteMasterContent, DeleteMasterQueue } from "@/components/master/delete/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";
import {
    Add01Icon,
    Copy01Icon,
    Delete03Icon,
    File02Icon,
    FileExportIcon,
    FileImportIcon,
    Files01Icon,
    FileViewIcon,
    KeyframesDoubleIcon,
    Layers01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useMemo, useRef, useState } from "react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { importProjectionsZip } from "@/lib/import";
import { exportProjections } from "@/lib/export";

export function MasterTabs() {
    const projections = useProjectionStore((s) => s.projections);

    if (projections.length === 0) return null;

    return (
        <TabsList className="justify-start overflow-scroll *:px-6">
            {projections.map((p) => (
                <TabsTrigger key={p.id} value={p.id}>
                    {p.title || "Untitled Master"}
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
                <DialogTrigger
                    render={
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
                    }
                />
                {hasActiveQueue && (
                    <DialogTrigger
                        render={
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
                        }
                    />
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

    const hasActiveContent = useMasterStore(
        (s) => s.activeProjectionIndex >= 0 && s.activeContentIndex >= 0,
    );

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Delete", () => {
            const { activeProjectionIndex, activeContentIndex } = useMasterStore.getState();
            if (activeProjectionIndex < 0 || activeContentIndex < 0) return;

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
                {hasActiveContent && (
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

export function DuplicateMasterButton() {
    const hasActiveQueue = useMasterStore((s) => s.activeProjectionIndex >= 0);
    const hasActiveContent = useMasterStore(
        (s) => s.activeProjectionIndex >= 0 && s.activeContentIndex >= 0,
    );

    const handleDuplicateQueue = () => {
        const { activeProjectionIndex, setActiveTab } = useMasterStore.getState();
        if (activeProjectionIndex < 0) return;

        const newId = useProjectionStore.getState().duplicateProjection(activeProjectionIndex);
        if (newId) {
            setActiveTab(newId);
        }
    };

    const handleDuplicateContent = () => {
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

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Shift+D", handleDuplicateQueue);
        register("D", handleDuplicateContent);

        return () => {
            unregister("Shift+D");
            unregister("D");
        };
    }, [register, unregister]);

    if (!hasActiveQueue) return null;

    return (
        <IconDropdownButton
            size="icon-sm"
            label="Duplicate Item"
            icon={Copy01Icon}
            iconStrokeWidth={2}
        >
            <IconDropdownMenuItem
                label={"Duplicate Queue"}
                text="Queue"
                icon={KeyframesDoubleIcon}
                iconStrokeWidth={1.75}
                onSelect={handleDuplicateQueue}
                accelerator={{
                    key: "D",
                    shift: true,
                }}
            />
            {hasActiveContent && (
                <IconDropdownMenuItem
                    label={"Duplicate Content"}
                    text="Content"
                    icon={Layers01Icon}
                    iconStrokeWidth={1.75}
                    onSelect={handleDuplicateContent}
                    accelerator={{
                        key: "D",
                    }}
                />
            )}
        </IconDropdownButton>
    );
}

export function ImportExportButton() {
    const hasActiveQueue = useMasterStore((s) => s.activeProjectionIndex >= 0);
    const hasProjections = useProjectionStore((s) => s.projections.length > 0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleExportAll = () => {
        const projections = useProjectionStore.getState().projections;
        if (projections.length === 0) return;
        void exportProjections(projections, "projections-all.zip", false);
    };

    const handleExportActive = () => {
        const activeProjectionIndex = useMasterStore.getState().activeProjectionIndex;
        const projections = useProjectionStore.getState().projections;

        if (activeProjectionIndex < 0) return;

        const activeProjection = projections[activeProjectionIndex];
        if (!activeProjection) return;

        // Basic sanitization for the filename
        const safeTitle = activeProjection.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        void exportProjections([activeProjection], `projection-${safeTitle}.zip`, false);
    };

    const handleExportSeparate = () => {
        const projections = useProjectionStore.getState().projections;
        if (projections.length === 0) return;

        void exportProjections(projections, "projections-separate.zip", true);
    };

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Shift+I", handleImportClick);
        register("Shift+E", handleExportAll);
        register("Shift+P", handleExportActive);

        return () => {
            unregister("Shift+I");
            unregister("Shift+E");
            unregister("Shift+P");
        };
    }, [register, unregister]);

    return (
        <>
            <input
                type="file"
                accept=".zip"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <IconDropdownButton
                size="icon-sm"
                label="Import/Export"
                icon={File02Icon}
                iconStrokeWidth={1.75}
            >
                <IconDropdownMenuItem
                    label={"Import ZIP"}
                    text="Import Projections"
                    icon={FileImportIcon}
                    iconStrokeWidth={1.75}
                    accelerator={{ key: "I", shift: true }}
                    onSelect={handleImportClick}
                />
                {hasProjections && (
                    <>
                        <DropdownMenuSeparator />
                        <IconDropdownMenuItem
                            label={"Export All"}
                            text="Export All (Single ZIP)"
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
        </>
    );
}
