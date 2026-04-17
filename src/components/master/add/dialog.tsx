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
import { CssStylesInput, type StyleItem } from "@/components/master/shared/css-styles-input";
import { MediaInput } from "@/components/master/media-input";
import * as mi from "@/const/media-input";
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { SongTitleMemo } from "@/components/core/song_title";
import { convertReactToJson } from "@/lib/component-converter";

type ContentT = ProjectionMaster["contents"][number];

interface DialogProps {
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FormBackgroundMediaInputProps {
    defaultValue?: string;
    required?: boolean;
    placeholder?: string;
}
function FormBackgroundMediaInput({
    defaultValue = "",
    required = false,
    placeholder,
}: FormBackgroundMediaInputProps) {
    const [value, setValue] = useState(defaultValue);

    return (
        <div className="relative flex w-full flex-col">
            <MediaInput
                value={value}
                onChange={setValue}
                onUploadApply={(id) => setValue(id)}
                areaName={mi.BACKGROUND_AREANAME}
                accept={mi.BACKGROUND_ACCEPT}
                placeholder={placeholder || "background_1080.webm"}
            />
            <input
                type="text"
                name="background"
                value={value}
                onChange={() => {
                    /* no-op */
                }}
                required={required}
                className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-px w-px opacity-0"
                tabIndex={-1}
            />
        </div>
    );
}

export function AddSongQueue({ setOpenDialog }: DialogProps) {
    const handleSubmit = useCallback(
        (ev: React.SubmitEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);

            const titleVal = (data.get("title") as string).trim();
            const transitionVal = data.get("transition") as ProjectionTransition;

            const content = (
                <SongTitleMemo
                    title={titleVal}
                    author={(data.get("author") as string).trim() || undefined}
                />
            );

            const id = useProjectionStore.getState().addProjection({
                title: titleVal,
                bg: data.get("background") as string,
                transition: transitionVal,
                contents: [
                    {
                        type: "Component",
                        name: titleVal,
                        content: [content, JSON.stringify(convertReactToJson(content))],
                        group: "Title",
                    } as ContentT,
                ],
            });

            const { setActiveTab, setActiveContentIndex } = useMasterStore.getState();
            setActiveTab(id);
            setActiveContentIndex(0);

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
                    <DialogTitle>Add Song</DialogTitle>
                </DialogHeader>
                <FieldGroup className="no-scrollbar -my-2 flex-1 overflow-y-auto py-2">
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="queue-title">
                            Title <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Textarea
                            id="queue-title"
                            name="title"
                            required
                            placeholder="Goodness of God (Live)"
                            onChange={(e) => (e.target.value = e.target.value.trimStart())}
                            onBlur={(e) => (e.target.value = e.target.value.trim())}
                            className="min-h-8"
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="queue-author">
                            Author
                        </FieldLabel>
                        <Textarea
                            id="queue-author"
                            name="author"
                            required
                            placeholder="Bethel Music & Jenn Johnson"
                            onChange={(e) => (e.target.value = e.target.value.trimStart())}
                            onBlur={(e) => (e.target.value = e.target.value.trim())}
                            className="min-h-8"
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">
                            Background <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FormBackgroundMediaInput required />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">
                            Transition <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select defaultValue="fade" name="transition" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Fade" />
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
                <DialogFooter className="-mb-6">
                    <DialogClose render={<Button variant={"outline"}>Cancel</Button>} />
                    <Button type="submit">Add</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

const LYRICS_PART_PLACEHOLDER = `Item 1, Line 1
Item 1, Line 2

Item 2`;
export function AddLyricsPartContent({ setOpenDialog }: DialogProps) {
    const activeProjectionIndex = useMasterStore((s) => s.activeProjectionIndex);
    const currentProjection = useMemo(() => {
        return useMasterStore.getState().getActiveProjection(activeProjectionIndex);
    }, [activeProjectionIndex]);

    const [group, setGroup] = useState<string | null>(null);
    const availableGroups = useMemo(() => {
        if (!currentProjection?.contents) return [];
        const groups = new Set<string>();
        for (const item of currentProjection.contents) {
            if (item.group) groups.add(item.group);
        }
        return Array.from(groups);
    }, [currentProjection?.contents]);

    const handleSubmit = useCallback(
        (ev: React.SubmitEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);

            const index = useMasterStore.getState().getActiveProjectionIndex();
            if (index < 0) return;

            const items = (data.get("content") as string)
                .split("\n\n")
                .map((s) => s.trim())
                .filter((s) => s);
            if (items.length === 0) return;

            const typedData = (() => {
                let style: Record<string, string> | undefined = undefined;
                try {
                    const styleStr = data.get("options-style") as string;
                    if (styleStr) {
                        const parsed = JSON.parse(styleStr) as StyleItem[];
                        if (parsed.length > 0) {
                            style = {};
                            parsed.forEach((s) => {
                                if (s.property && s.value) {
                                    style![s.property] = s.value;
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse styles", e);
                }

                return {
                    options: {
                        style: {
                            color: "white",
                            textAlign: "center",
                            marginInline: "calc(var(--spacing) * 64)",
                            fontFamily: "geologica",
                            fontVariationSettings: "'slnt' -10,'CRSV' 1,'SHRP' 0",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            fontSize: "8rem",
                            lineHeight: 1.125,
                            textShadow:
                                "0px 1px 2px color-mix(in oklab, hsl(212,51%,51%) 100%, transparent), 0px 3px 2px color-mix(in oklab, hsl(212,51%,51%) 100%, transparent), 0px 4px 8px color-mix(in oklab, hsl(212,51%,51%) 100%, transparent)",
                            ...style,
                        },
                    } as Extract<ContentT, { type: "Text" }>["options"],
                };
            })();

            const groupVal = (data.get("group") as string).trim() || undefined;
            const bgVal = (data.get("background") as string).trim() || undefined;
            const _tVal = (data.get("transition") as string).trim();

            const contents: ContentT[] = [];
            for (const item of items) {
                contents.push({
                    type: "Text",
                    content: item,
                    ...typedData,

                    group: groupVal,
                    bg: bgVal,
                    transition: _tVal === "inherit" || !_tVal ? undefined : _tVal,
                } as ContentT);
            }

            const last = useProjectionStore.getState().addContents(index, contents);

            useMasterStore.getState().setActiveContentIndex(last);
            setOpenDialog(false);
            setGroup(null);
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
                    <DialogTitle>Add Lyrics Part</DialogTitle>
                </DialogHeader>
                <FieldGroup className="no-scrollbar -my-2 flex-1 overflow-y-auto py-2">
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="content-group">
                            Group
                        </FieldLabel>
                        <Combobox
                            items={availableGroups}
                            value={group ?? ""}
                            onValueChange={(val) => setGroup(val?.trim() || null)}
                        >
                            <ComboboxInput
                                id="content-group"
                                name="group"
                                value={group ?? ""}
                                onChange={(e) => setGroup(e.target.value.trimStart() || null)}
                                onBlur={(e) => setGroup(e.target.value.trim() || null)}
                                placeholder="Group 1"
                                showTrigger={availableGroups.length > 0}
                            />
                            {availableGroups.length > 0 && (
                                <ComboboxContent>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            )}
                        </Combobox>
                    </Field>
                    <FieldSeparator />
                    <TextInput
                        placeholder={LYRICS_PART_PLACEHOLDER}
                        description="Items are separated by empty line."
                    />
                    <Field>
                        <FieldLabel className="gap-0.5">Background</FieldLabel>
                        <FormBackgroundMediaInput defaultValue={currentProjection?.bg || ""} />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">Transition</FieldLabel>
                        <Select name="transition" defaultValue={"inherit"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Transition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="inherit">Inherit</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="fade">Fade</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
                <DialogFooter className="-mb-6">
                    <DialogClose render={<Button variant={"outline"}>Cancel</Button>} />
                    <Button type="submit">Add</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

export function AddMasterQueue({ setOpenDialog }: DialogProps) {
    const handleSubmit = useCallback(
        (ev: React.SubmitEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);

            const id = useProjectionStore.getState().addProjection({
                title: (data.get("title") as string).trim(),
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
                            onChange={(e) => (e.target.value = e.target.value.trimStart())}
                            onBlur={(e) => (e.target.value = e.target.value.trim())}
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">
                            Background <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FormBackgroundMediaInput required />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">
                            Transition <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select defaultValue="fade" name="transition" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Fade" />
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
                <DialogFooter className="-mb-6">
                    <DialogClose render={<Button variant={"outline"}>Cancel</Button>} />
                    <Button type="submit">Add</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

export function AddMasterContent({ setOpenDialog }: DialogProps) {
    const activeProjectionIndex = useMasterStore((s) => s.activeProjectionIndex);
    const currentProjection = useMemo(() => {
        return useMasterStore.getState().getActiveProjection(activeProjectionIndex);
    }, [activeProjectionIndex]);

    const [group, setGroup] = useState<string | null>(null);
    const availableGroups = useMemo(() => {
        if (!currentProjection?.contents) return [];
        const groups = new Set<string>();
        for (const item of currentProjection.contents) {
            if (item.group) groups.add(item.group);
        }
        return Array.from(groups);
    }, [currentProjection?.contents]);

    const [fields, setFields] = useState<React.ReactNode>(<TextInput />);
    const typeChanged = useCallback((value: ContentT["type"]) => {
        switch (value) {
            case "Text":
                setFields(<TextInput />);
                break;
            case "Image":
                setFields(<ImageInput />);
                break;
            case "Video":
                setFields(<VideoInput />);
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
                                const parsed = JSON.parse(styleStr) as StyleItem[];
                                if (parsed.length > 0) {
                                    style = {};
                                    parsed.forEach((s) => {
                                        if (s.property && s.value) {
                                            style![s.property] = s.value;
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse styles", e);
                        }

                        return {
                            options: {
                                style: {
                                    color: "white",
                                    textAlign: "center",
                                    marginInline: "calc(var(--spacing) * 64)",
                                    fontFamily: "geologica",
                                    fontVariationSettings: "'slnt' -10,'CRSV' 1,'SHRP' 0",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    fontSize: "8rem",
                                    lineHeight: 1.125,
                                    textShadow:
                                        "0px 1px 2px color-mix(in oklab, hsl(212,51%,51%) 100%, transparent), 0px 3px 2px color-mix(in oklab, hsl(212,51%,51%) 100%, transparent), 0px 4px 8px color-mix(in oklab, hsl(212,51%,51%) 100%, transparent)",
                                    ...style,
                                },
                            } as Extract<ContentT, { type: "Text" }>["options"],
                        };
                    }
                    default:
                        return {};
                }
            };

            const transitionVal = (data.get("transition") as string).trim();

            const last = useProjectionStore.getState().addContent(index, {
                type: data.get("type"),
                content: data.get("content") as string,
                ...typedData(),

                name: (data.get("name") as string).trim() || undefined,
                group: (data.get("group") as string).trim() || undefined,
                bg: (data.get("background") as string).trim() || undefined,
                transition: transitionVal === "inherit" ? undefined : transitionVal || undefined,
            } as ContentT);

            useMasterStore.getState().setActiveContentIndex(last);
            setOpenDialog(false);
            setGroup(null);
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
                        <Input
                            id="content-name"
                            name="name"
                            type="text"
                            placeholder="Content 1"
                            onChange={(e) => (e.target.value = e.target.value.trimStart())}
                            onBlur={(e) => (e.target.value = e.target.value.trim())}
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="content-group">
                            Group
                        </FieldLabel>
                        <Combobox
                            items={availableGroups}
                            value={group ?? ""}
                            onValueChange={(val) => setGroup(val?.trim() || null)}
                        >
                            <ComboboxInput
                                id="content-group"
                                name="group"
                                value={group ?? ""}
                                onChange={(e) => setGroup(e.target.value.trimStart() || null)}
                                onBlur={(e) => setGroup(e.target.value.trim() || null)}
                                placeholder="Group 1"
                                showTrigger={availableGroups.length > 0}
                            />
                            {availableGroups.length > 0 && (
                                <ComboboxContent>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            )}
                        </Combobox>
                    </Field>
                    <FieldSeparator />
                    {fields}
                    <Field>
                        <FieldLabel className="gap-0.5">Background</FieldLabel>
                        <FormBackgroundMediaInput
                            placeholder={
                                currentProjection?.bg && `Inheriting: ${currentProjection.bg}`
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="gap-0.5">Transition</FieldLabel>
                        <Select name="transition" defaultValue={"inherit"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Transition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="inherit">Inherit</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="fade">Fade</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
                <DialogFooter className="-mb-6">
                    <DialogClose render={<Button variant={"outline"}>Cancel</Button>} />
                    <Button type="submit">Add</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

interface TextInputProps {
    placeholder?: string;
    description?: string;
}
function TextInput({ placeholder, description }: TextInputProps) {
    const [styles, setStyles] = useState<StyleItem[]>([]);

    return (
        <>
            <Field>
                <FieldLabel className="gap-0.5" htmlFor="content-content">
                    Content <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                    id="content-content"
                    name="content"
                    required
                    placeholder={placeholder || "This is a text content"}
                    className="min-h-25"
                />
                {description && <FieldDescription>{description}</FieldDescription>}
            </Field>
            <CssStylesInput styles={styles} onChange={setStyles} />
            <input type="hidden" name="options-style" value={JSON.stringify(styles)} />
        </>
    );
}

function ImageInput() {
    const [value, setValue] = useState("");

    return (
        <Field>
            <FieldLabel className="gap-0.5">
                Content <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="relative flex w-full flex-col">
                <MediaInput
                    value={value}
                    onChange={setValue}
                    onUploadApply={(id) => setValue(id)}
                    areaName={mi.CONTENT_AREANAME}
                    accept={mi.IMAGE_ACCEPT}
                    placeholder="foreground_1080.webp"
                />
                <input
                    type="text"
                    name="content"
                    value={value}
                    onChange={() => {
                        /* no-op */
                    }}
                    required
                    className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-px w-px opacity-0"
                    tabIndex={-1}
                />
            </div>
        </Field>
    );
}

function VideoInput() {
    const [value, setValue] = useState("");

    return (
        <Field>
            <FieldLabel className="gap-0.5">
                Content <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="relative flex w-full flex-col">
                <MediaInput
                    value={value}
                    onChange={setValue}
                    onUploadApply={(id) => setValue(id)}
                    areaName={mi.CONTENT_AREANAME}
                    accept={mi.VIDEO_ACCEPT}
                    placeholder="foreground_1080.webm"
                />
                <input
                    type="text"
                    name="content"
                    value={value}
                    onChange={() => {
                        /* no-op */
                    }}
                    required
                    className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-px w-px opacity-0"
                    tabIndex={-1}
                />
            </div>
        </Field>
    );
}
