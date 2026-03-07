import { IconDropdownButton, IconDropdownMenuItem } from "@/components/core/buttons";
import { AddMasterContent, AddMasterQueue } from "@/components/master/add/dialog";
import { DeleteMasterContent, DeleteMasterQueue } from "@/components/master/delete/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShortcut } from "@/hooks/use-shortcuts";
import { useShortcutsStore } from "@/stores/shortcuts.store";
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
import { useMemo, useRef, useState } from "react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
    duplContent,
    duplQueue,
    exportActive,
    exportAll,
    exportSeparate,
    importFileChange,
} from "@/lib/queue";

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

    useShortcut({ key: "a" }, () => {
        if (useMasterStore.getState().activeProjectionIndex < 0) return;

        setDialogType("content");
        setOpenDialog(true);
    });
    useShortcut({ key: "a", shift: true }, () => {
        setDialogType("queue");
        setOpenDialog(true);
    });

    const openChanged = (open: boolean) => {
        useShortcutsStore.getState().toggleShortcuts(!open);
        setOpenDialog(open);
    };

    return (
        <Dialog open={openDialog} onOpenChange={openChanged}>
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

    useShortcut({ key: "Delete" }, () => {
        const { activeProjectionIndex, activeContentIndex } = useMasterStore.getState();
        if (activeProjectionIndex < 0 || activeContentIndex < 0) return;

        setDialogType("content");
        setOpenDialog(true);
    });
    useShortcut({ key: "Delete", shift: true }, () => {
        setDialogType("queue");
        setOpenDialog(true);
    });

    const openChanged = (open: boolean) => {
        useShortcutsStore.getState().toggleShortcuts(!open);
        setOpenDialog(open);
    };

    return (
        <AlertDialog open={openDialog} onOpenChange={openChanged}>
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

    useShortcut({ key: "D", shift: true }, duplQueue);
    useShortcut({ key: "D" }, duplContent);

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
                onSelect={duplQueue}
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
                    onSelect={duplContent}
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

    useShortcut({ key: "I", shift: true }, handleImportClick);
    useShortcut({ key: "E", shift: true }, exportAll);
    useShortcut({ key: "P", shift: true }, exportActive);

    return (
        <>
            <input
                type="file"
                accept=".zip"
                className="hidden"
                ref={fileInputRef}
                onChange={importFileChange}
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
                            onSelect={exportAll}
                        />
                        <IconDropdownMenuItem
                            label={"Export Separate"}
                            text="Export Separate Files"
                            icon={Files01Icon}
                            iconStrokeWidth={1.75}
                            onSelect={exportSeparate}
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
                        onSelect={exportActive}
                    />
                )}
            </IconDropdownButton>
        </>
    );
}
