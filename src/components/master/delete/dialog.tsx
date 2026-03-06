import { useProjectionStore } from "@/stores/projection.store";
import { useMasterStore } from "@/stores/master.store";
import { useCallback } from "react";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DialogProps {
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
export function DeleteMasterQueue({ setOpenDialog }: DialogProps) {
    const handleDelete = useCallback(() => {
        const index = useMasterStore.getState().activeProjectionIndex;
        const newId = useProjectionStore.getState().deleteProjection(index);

        if (newId === null) return;

        useMasterStore.getState().setActiveTab(newId);

        setOpenDialog(false);
    }, [setOpenDialog]);

    return (
        <AlertDialogContent size="sm">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Queue</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete this active queue? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant={"destructive"} onClick={handleDelete}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

export function DeleteMasterContent({ setOpenDialog }: DialogProps) {
    const handleDelete = useCallback(() => {
        const pIndex = useMasterStore.getState().activeProjectionIndex;
        const cIndex = useMasterStore.getState().activeContentIndex;
        const newIndex = useProjectionStore.getState().deleteContent(pIndex, cIndex);

        if (newIndex === null) return;

        useMasterStore.getState().setActiveContentIndex(newIndex);

        setOpenDialog(false);
    }, [setOpenDialog]);

    return (
        <AlertDialogContent size="sm">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Content</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete this active content? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant={"destructive"} onClick={handleDelete}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}
