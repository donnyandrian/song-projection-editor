import { Button } from "@/components/ui/button";
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
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
import { useMasterStore } from "@/stores/master.store";
import type { ProjectionMaster, ProjectionTransition } from "@/types";
import { useCallback, useMemo, useState } from "react";

interface DialogProps {
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
export function AddMasterQueue({ setOpenDialog }: DialogProps) {
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

            useMasterStore.getState().setActiveTab(id);

            setOpenDialog(false);
        },
        [setOpenDialog],
    );

    return (
        <DialogContent
            showCloseButton={false}
            className="flex flex-col overflow-hidden p-0! max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
        >
            <form
                onSubmit={handleSubmit}
                className="flex h-full flex-col gap-4 overflow-y-hidden py-6 *:px-6"
            >
                <DialogHeader>
                    <DialogTitle>Add Queue</DialogTitle>
                </DialogHeader>
                <FieldGroup className="no-scrollbar -my-2 flex-1 overflow-y-auto py-2">
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

type ContentT = ProjectionMaster["contents"][number];
export function AddMasterContent({ setOpenDialog }: DialogProps) {
    const currentProjection = useMemo(() => {
        return useMasterStore.getState().getActiveProjection();
    }, []);

    const [fields, setFields] = useState<React.ReactNode>(<TextInput />);
    const typeChanged = useCallback((value: ContentT["type"]) => {
        switch (value) {
            case "Text":
                setFields(<TextInput />);
                break;
            case "Image":
            case "Video":
                setFields(<ImageVideoInput />);
                break;
            default:
                setFields(null);
                break;
        }
    }, []);

    const handleSubmit = useCallback(
        (ev: React.SubmitEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);

            const index = useMasterStore.getState().getActiveProjectionIndex();
            if (index < 0) return;

            const type = data.get("type") as ContentT["type"];
            const typedData = () => {
                switch (type) {
                    case "Text":
                        return {
                            options: {
                                className:
                                    (data.get("options-className") as string).trim() || undefined,
                            } as Extract<ContentT, { type: "Text" }>["options"],
                        };
                    default:
                        return {};
                }
            };

            useProjectionStore.getState().addContent(index, {
                type: data.get("type"),
                content: data.get("content") as string,
                ...typedData(),

                name: (data.get("name") as string).trim() || undefined,
                group: (data.get("group") as string).trim() || undefined,
                bg: (data.get("background") as string).trim() || undefined,
                transition: (data.get("transition") as string).trim() || undefined,
            } as ContentT);

            setOpenDialog(false);
        },
        [setOpenDialog],
    );

    return (
        <DialogContent
            showCloseButton={false}
            className="flex flex-col overflow-hidden p-0! max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
        >
            <form
                onSubmit={handleSubmit}
                className="flex h-full flex-col gap-4 overflow-y-hidden py-6 *:px-6"
            >
                <DialogHeader>
                    <DialogTitle>Add Content</DialogTitle>
                </DialogHeader>
                <FieldGroup className="no-scrollbar -my-2 flex-1 overflow-y-auto py-2">
                    <Field>
                        <FieldLabel className="gap-0.5">
                            Type <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select
                            defaultValue="Text"
                            name="type"
                            required
                            onValueChange={typeChanged}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Content Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Text">Text</SelectItem>
                                    <SelectItem value="Image">Image</SelectItem>
                                    <SelectItem value="Video">Video</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="content-name">
                            Name
                        </FieldLabel>
                        <Input id="content-name" name="name" type="text" placeholder="Content 1" />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="content-group">
                            Group
                        </FieldLabel>
                        <Input id="content-group" name="group" type="text" placeholder="Group 1" />
                    </Field>
                    <FieldSeparator />
                    {fields}
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="content-background">
                            Background
                        </FieldLabel>
                        <Input
                            id="content-background"
                            name="background"
                            type="text"
                            placeholder="background_1080.webm"
                            defaultValue={currentProjection?.bg}
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">Transition</FieldLabel>
                        <Select name="transition" defaultValue={currentProjection?.transition}>
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

function TextInput() {
    return (
        <>
            <Field>
                <FieldLabel className="gap-0.5" htmlFor="content-content">
                    Content <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                    id="content-content"
                    name="content"
                    type="text"
                    required
                    placeholder="This is a text content"
                />
            </Field>
            <Field>
                <FieldLabel className="gap-0.5" htmlFor="content-options-className">
                    Style
                </FieldLabel>
                <Input
                    id="content-options-className"
                    name="options-className"
                    type="text"
                    placeholder="text-2xl text-red-500 font-semibold"
                />
                <FieldDescription>
                    The style to apply to the content. See{" "}
                    <a
                        href="https://tailwindcss.com/docs/styling-with-utility-classes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold"
                    >
                        TailwindCSS
                    </a>{" "}
                    docs.
                </FieldDescription>
            </Field>
        </>
    );
}

function ImageVideoInput() {
    return (
        <Field>
            <FieldLabel className="gap-0.5" htmlFor="content-content">
                Content <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
                id="content-content"
                name="content"
                type="text"
                required
                placeholder="foreground_1080.webp (or .webm)"
            />
        </Field>
    );
}
