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
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { useProjectionStore } from "@/stores/projection.store";
import { useMasterStore } from "@/stores/master.store";
import type { ProjectionMaster, ProjectionTransition } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { CSS_PROPERTIES } from "@/const/css";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";

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
                contents: [],
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
                    case "Text": {
                        let style: Record<string, string> | undefined = undefined;
                        try {
                            const styleStr = data.get("options-style") as string;
                            if (styleStr) {
                                const parsed = JSON.parse(styleStr) as {
                                    key: string;
                                    value: string;
                                }[];
                                if (parsed.length > 0) {
                                    style = {};
                                    parsed.forEach((s) => {
                                        if (s.key && s.value) {
                                            style![s.key] = s.value;
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse styles", e);
                        }

                        return {
                            options: {
                                style,
                            } as Extract<ContentT, { type: "Text" }>["options"],
                        };
                    }
                    default:
                        return {};
                }
            };

            const last = useProjectionStore.getState().addContent(index, {
                type: data.get("type"),
                content: data.get("content") as string,
                ...typedData(),

                name: (data.get("name") as string).trim() || undefined,
                group: (data.get("group") as string).trim() || undefined,
                bg: (data.get("background") as string).trim() || undefined,
                transition: (data.get("transition") as string).trim() || undefined,
            } as ContentT);

            useMasterStore.getState().setActiveContentIndex(last);
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

const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString();
};
function TextInput() {
    const [styles, setStyles] = useState<{ id: string; key: string; value: string }[]>([]);

    const addStyle = () => {
        setStyles((prev) => [...prev, { id: generateId(), key: "", value: "" }]);
    };

    const removeStyle = (id: string) => {
        setStyles((prev) => prev.filter((s) => s.id !== id));
    };

    const updateStyle = (id: string, field: "key" | "value", val: string) => {
        setStyles((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
    };

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
                <FieldLabel>CSS Styles</FieldLabel>
                <div className="flex flex-col gap-2">
                    {styles.map((style) => {
                        const comboboxValue = CSS_PROPERTIES.includes(style.key) ? style.key : "";
                        return (
                            <div
                                key={style.id}
                                className="flex items-center gap-2 last-of-type:mb-2"
                            >
                                <div className="flex-1">
                                    <Combobox
                                        items={CSS_PROPERTIES}
                                        value={comboboxValue}
                                        autoHighlight
                                        onValueChange={(val) =>
                                            val && updateStyle(style.id, "key", val)
                                        }
                                    >
                                        <ComboboxInput placeholder="Property" />
                                        <ComboboxContent className="w-60">
                                            <ComboboxEmpty>No match found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(item: string) => (
                                                    <ComboboxItem key={item} value={item}>
                                                        {item}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        value={style.value}
                                        onChange={(e) =>
                                            updateStyle(style.id, "value", e.target.value)
                                        }
                                        placeholder="Value"
                                    />
                                </div>
                                <Button
                                    type="button" // Important: Prevents form submission
                                    variant={"ghost"}
                                    size={"icon"}
                                    className="text-muted-foreground hover:text-destructive px-2! py-0"
                                    aria-label={"Remove"}
                                    onClick={() => removeStyle(style.id)}
                                >
                                    <span className="sr-only">Remove</span>
                                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.25} />
                                </Button>
                            </div>
                        );
                    })}
                    <Button type="button" variant="outline" size="sm" onClick={addStyle}>
                        <HugeiconsIcon icon={Add01Icon} strokeWidth={2.25} />
                        Add Property
                    </Button>
                </div>
                {/* Hidden input to pass state seamlessly to FormData in handleSubmit */}
                <input type="hidden" name="options-style" value={JSON.stringify(styles)} />
                <FieldDescription>
                    Define custom React CSS properties for this text element. Use camelCase
                    formatting.
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
