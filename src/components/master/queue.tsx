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
    Delete03Icon,
    KeyframesDoubleIcon,
    Layers01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useMemo, useState } from "react";

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
            <IconDropdownButton label="Add Item" icon={Add01Icon} iconStrokeWidth={2.5}>
                <DialogTrigger asChild>
                    <IconDropdownMenuItem
                        label={"Add Queue"}
                        text="Queue"
                        icon={KeyframesDoubleIcon}
                        iconStrokeWidth={2}
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
                            iconStrokeWidth={2}
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
                label="Delete Item"
                icon={Delete03Icon}
                iconStrokeWidth={2}
                iconClassName="text-destructive"
            >
                <AlertDialogTrigger asChild>
                    <IconDropdownMenuItem
                        label={"Delete Queue"}
                        text="Queue"
                        icon={KeyframesDoubleIcon}
                        iconStrokeWidth={2}
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
                            iconStrokeWidth={2}
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
