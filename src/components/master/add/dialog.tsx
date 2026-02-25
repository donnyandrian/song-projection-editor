import { Button } from "@/components/ui/button";
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useProjectionStore } from "@/stores/projection.store";
import { useTabsStore } from "@/stores/tabs.store";
import type { ProjectionTransition } from "@/types";
import { useCallback } from "react";

interface DialogProps {
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
export function AddQueueContent({ setOpenDialog }: DialogProps) {
    const handleSubmit = useCallback(
        (ev: React.SubmitEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);

            const id = useProjectionStore.getState().addProjection({
                title: data.get("title") as string,
                bg: data.get("background") as string,
                transition: data.get("transition") as ProjectionTransition,
                contents: [
                    {
                        type: "Text",
                        content: "Text Content",
                    },
                ],
            });

            useTabsStore.getState().setActiveTab(id);

            setOpenDialog(false);
        },
        [setOpenDialog],
    );

    return (
        <DialogContent
            showCloseButton={false}
            className="overflow-hidden max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Add Queue</DialogTitle>
                </DialogHeader>
                <FieldGroup className="flex-1">
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="queue-title">
                            Title <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="queue-title"
                            name="title"
                            type="text"
                            required
                            placeholder="Master 1"
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="queue-background">
                            Background <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="queue-background"
                            name="background"
                            type="text"
                            required
                            placeholder="background_1080.webm"
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">
                            Transition <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select defaultValue="fade" name="transition" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Transition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="fade">Fade</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
