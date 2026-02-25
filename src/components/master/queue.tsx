import { IconDropdownButton, IconDropdownMenuItem } from "@/components/core/buttons";
import { AddMasterContent, AddMasterQueue } from "@/components/master/add/dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { useProjectionStore } from "@/stores/projection.store";
import { Add01Icon, KeyframesDoubleIcon, Layers01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useMemo, useState } from "react";

export function MasterTabs() {
    const projections = useProjectionStore((s) => s.projections);

    return (
        <TabsList className="justify-start overflow-scroll *:px-6">
            <TabsTrigger value="master-1">Master 1</TabsTrigger>
            <TabsTrigger value="master-2">Master 2</TabsTrigger>
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

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("A", () => {
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
            </IconDropdownButton>
            {dialogContent}
        </Dialog>
    );
}
