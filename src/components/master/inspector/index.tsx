import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import type {
    ProjectionItem,
    ProjectionTransition,
    ProjectionMaster,
    ProjectionMasterWithId,
} from "@/types";
import { TextStyleField } from "@/components/master/inspector/text";
import type { HandleUpdate, InputChanged } from "@/types/inspector";
import { MediaInput, type ApplyScope, type AreaName } from "@/components/master/media-input";
import * as mi from "@/const/media-input";
import { useInspectorStore } from "@/stores/inspector.store";
import { useMemo, useRef } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsStore } from "@/stores/settings.store";
import type { AppSettings } from "@/types/settings";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { TransformedInput } from "@/components/core/transformed-input";
import { ProjectionItemSchema } from "@/schemas/projection";
import { Switcher } from "@/components/master/inspector/component";

interface InspectorProps {
    children?: React.ReactNode;
}
export function Inspector({ children }: InspectorProps) {
    const inspectMode = useInspectorStore((s) => s.mode);

    const activeProjectionIndex = useMasterStore((s) => s.activeProjectionIndex);
    const activeContentIndex = useMasterStore((s) => s.activeContentIndex);
    const projections = useProjectionStore((s) => s.projections);

    const activeProjection = projections[activeProjectionIndex];
    const activeItem = activeProjection?.contents[activeContentIndex];

    const handleUpdateQueue = (
        updater: (old: ProjectionMasterWithId) => ProjectionMasterWithId,
    ) => {
        useProjectionStore.getState().updateProjection(activeProjectionIndex, updater);
    };

    const handleUpdate: HandleUpdate = (updater) => {
        useProjectionStore
            .getState()
            .updateContent(activeProjectionIndex, activeContentIndex, updater);
    };

    const itemKey = `${activeProjectionIndex}-${activeContentIndex}`;

    const applyBatchUpdate = (assetId: string, scope: ApplyScope, sourceArea: AreaName) => {
        if (scope === "single") {
            handleUpdate((old) => ({
                ...old,
                ...(sourceArea === mi.CONTENT_AREANAME
                    ? ({ content: assetId } as ProjectionItem)
                    : { bg: assetId }),
            }));
            return;
        }

        const store = useProjectionStore.getState();
        const newProjections = store.projections.map((proj) => {
            const newContents = proj.contents.map((item) => {
                const newItem = { ...item };

                if (scope === "area") {
                    if (sourceArea === "background") {
                        newItem.bg = assetId;
                    } else if (
                        sourceArea === mi.CONTENT_AREANAME &&
                        (newItem.type === "Image" || newItem.type === "Video")
                    ) {
                        newItem.content = assetId;
                    }
                } else if (scope === "all") {
                    newItem.bg = assetId;
                    if (newItem.type === "Image" || newItem.type === "Video") {
                        newItem.content = assetId;
                    }
                }
                return newItem;
            });

            return { ...proj, contents: newContents };
        });

        store.setProjectionsWithIds(newProjections);
    };

    const renderContent = () => {
        if (inspectMode === "settings") {
            return <InspectorSettingsTab />;
        }

        if (!activeProjection) {
            return (
                <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
                    Select a queue to inspect its properties.
                </div>
            );
        }

        if (inspectMode === "content") {
            if (!activeItem) {
                return (
                    <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
                        Select a node to inspect its properties.
                    </div>
                );
            }

            return (
                <Tabs
                    defaultValue="content"
                    activationMode="manual"
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    <div className="px-4 pt-3 max-sm:pt-0">
                        <TabsList className="w-full grid-cols-3">
                            <TabsTrigger value="content" className="flex-1">
                                Content
                            </TabsTrigger>
                            <TabsTrigger value="background" className="flex-1">
                                Background
                            </TabsTrigger>
                            <TabsTrigger value="transition" className="flex-1">
                                Transition
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="no-scrollbar relative flex-1 overflow-y-auto p-4">
                        <InspectorContentTab
                            itemKey={itemKey}
                            activeItem={activeItem}
                            handleUpdate={handleUpdate}
                            applyBatchUpdate={applyBatchUpdate}
                            activeProjection={activeProjection}
                        />
                        <InspectorBackgroundTab
                            activeItem={activeItem}
                            handleUpdate={handleUpdate}
                            activeProjection={activeProjection}
                            applyBatchUpdate={applyBatchUpdate}
                        />
                        <InspectorTransitionTab
                            activeItem={activeItem}
                            handleUpdate={handleUpdate}
                        />
                    </div>
                </Tabs>
            );
        }

        // Render queue mode
        return (
            <div className="no-scrollbar relative flex-1 overflow-y-auto p-4">
                <InspectorQueueTab
                    activeProjection={activeProjection}
                    handleUpdateQueue={handleUpdateQueue}
                    applyBatchUpdate={applyBatchUpdate}
                />
            </div>
        );
    };

    return (
        <div className="bg-background flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-muted-foreground text-sm font-medium select-none">Inspector</h3>
                {children}
            </div>
            {renderContent()}
        </div>
    );
}

export function InspectMode() {
    const inspectMode = useInspectorStore((s) => s.mode);
    const setInspectMode = useInspectorStore((s) => s.setMode);

    return (
        <Select value={inspectMode} onValueChange={setInspectMode}>
            <SelectTrigger size="sm" className="h-7 w-28 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-28 min-w-28 **:text-xs">
                <SelectItem value="queue">Queue</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
        </Select>
    );
}

interface TabProps {
    activeItem: ProjectionItem;
    handleUpdate: HandleUpdate;
}
interface ContentTabProps extends TabProps {
    itemKey: string;
    applyBatchUpdate: (assetId: string, scope: ApplyScope, sourceArea: AreaName) => void;
    activeProjection: ProjectionMasterWithId;
}
function InspectorContentTab({
    itemKey,
    activeItem,
    handleUpdate,
    applyBatchUpdate,
    activeProjection,
}: ContentTabProps) {
    const typeChanged = (val: "Text" | "Image" | "Video" | "Component") => {
        handleUpdate((old) => {
            // Extract the base fields shared across all primitive/text items
            const base = {
                name: old.name,
                group: old.group,
                bg: old.bg,
                transition: old.transition,
                // Extract string content to preserve value if it was a string
                content: typeof old.content === "string" ? old.content : "",
            };

            if (val === "Text") {
                return { ...base, type: "Text", options: {} };
            } else if (val === "Component") {
                return {
                    ...base,
                    type: "Component",
                    content: ["", ""] as [React.ReactNode, string],
                };
            }
            return { ...base, type: val };
        });
    };

    const nameChanged: InputChanged = (e) => {
        // Fallback to undefined if the string is empty
        handleUpdate((old) => ({ ...old, name: e.target.value || undefined }));
    };

    const groupChanged: InputChanged = (e) => {
        // Fallback to undefined if the string is empty
        handleUpdate((old) => ({ ...old, group: e.target.value || undefined }));
    };

    const contentChanged = (val: string) => {
        handleUpdate((old) => {
            // Component edits as string, fallback for Primitives and Text
            if (old.type === "Component") {
                try {
                    const p = { type: "Component", content: JSON.parse(val) };
                    const res = ProjectionItemSchema.safeParse(p);
                    if (!res.success) throw res.error;

                    return {
                        ...old,
                        content: [res.data.content[0], val] as [React.ReactNode, string],
                    };
                } catch (e) {
                    console.error("Invalid JSON or Schema mismatch. Error: ", e);
                    return {
                        ...old,
                        content: [old.content[0], val] as [React.ReactNode, string],
                    };
                }
            }
            return { ...old, content: val };
        });
    };

    const availableGroups = useMemo(() => {
        const groups = new Set<string>();
        for (const item of activeProjection.contents) {
            if (item.group) groups.add(item.group);
        }
        return Array.from(groups);
    }, [activeProjection.contents]);

    let contentField: React.ReactNode = null;
    switch (activeItem.type) {
        case "Component": {
            contentField = (
                <Switcher content={activeItem.content[1]} contentChanged={contentChanged} />
            );
            break;
        }
        case "Text":
            contentField = (
                <Textarea
                    value={activeItem.content}
                    onChange={(e) => contentChanged(e.target.value)}
                    placeholder="Enter text..."
                    className="min-h-25"
                />
            );
            break;
        default:
            contentField = (
                <MediaInput
                    value={typeof activeItem.content === "string" ? activeItem.content : ""}
                    onChange={contentChanged}
                    onUploadApply={(assetId, scope) =>
                        applyBatchUpdate(assetId, scope, mi.CONTENT_AREANAME)
                    }
                    areaName={mi.CONTENT_AREANAME}
                    accept={activeItem.type === "Image" ? mi.IMAGE_ACCEPT : mi.VIDEO_ACCEPT}
                    placeholder="Filename, URL, or Select Upload"
                />
            );
            break;
    }

    return (
        <TabsContent value="content" className="m-0 flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select value={activeItem.type} onValueChange={typeChanged}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Text">Text</SelectItem>
                                <SelectItem value="Image">Image</SelectItem>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Component">Component</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                <Field>
                    <FieldLabel>Name</FieldLabel>
                    <TransformedInput
                        value={activeItem.name ?? ""}
                        onChange={nameChanged}
                        transformer={(val) => val.trim()}
                        placeholder="Optional Name"
                    />
                </Field>

                <Field>
                    <FieldLabel>Group</FieldLabel>
                    <Combobox
                        items={availableGroups}
                        value={activeItem.group ?? ""}
                        onValueChange={(val) => {
                            // Fallback to undefined if the string is empty
                            handleUpdate((old) => ({ ...old, group: val?.trim() || undefined }));
                        }}
                    >
                        <ComboboxInput
                            render={
                                <TransformedInput
                                    transformer={(val) => val.trim()}
                                    data-slot="input-group-control"
                                    className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
                                />
                            }
                            value={activeItem.group ?? ""}
                            onChange={groupChanged}
                            placeholder="Optional Group"
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

                <Field>
                    <FieldLabel>Content Resource</FieldLabel>
                    {contentField}
                </Field>

                {activeItem.type === "Text" && (
                    <TextStyleField
                        key={itemKey}
                        activeItem={activeItem}
                        handleUpdate={handleUpdate}
                    />
                )}
            </FieldGroup>
        </TabsContent>
    );
}

interface BackgroundTabProps extends TabProps {
    activeProjection?: ProjectionMaster;
    applyBatchUpdate: (assetId: string, scope: ApplyScope, sourceArea: AreaName) => void;
}
function InspectorBackgroundTab({
    activeItem,
    handleUpdate,
    activeProjection,
    applyBatchUpdate,
}: BackgroundTabProps) {
    const backgroundChanged = (val: string) => {
        handleUpdate((old) => ({ ...old, bg: val || undefined }));
    };

    return (
        <TabsContent value="background" className="m-0 flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Background Source</FieldLabel>
                    <MediaInput
                        value={activeItem.bg ?? ""}
                        onChange={backgroundChanged}
                        onUploadApply={(assetId, scope) =>
                            applyBatchUpdate(assetId, scope, mi.BACKGROUND_AREANAME)
                        }
                        areaName={mi.BACKGROUND_AREANAME}
                        accept={mi.BACKGROUND_ACCEPT}
                        placeholder={
                            activeProjection?.bg
                                ? `Inheriting: ${activeProjection.bg}`
                                : "No background"
                        }
                    />
                    <FieldDescription>
                        Leave empty to inherit the master queue's background.
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </TabsContent>
    );
}

function InspectorTransitionTab({ activeItem, handleUpdate }: TabProps) {
    const transitionChanged = (val: ProjectionTransition | "inherit") => {
        handleUpdate((old) => ({
            ...old,
            transition: val === "inherit" ? undefined : val,
        }));
    };

    return (
        <TabsContent value="transition" className="m-0 flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Transition</FieldLabel>
                    <Select
                        value={activeItem.transition ?? "inherit"}
                        onValueChange={transitionChanged}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Inherit" />
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
        </TabsContent>
    );
}

function InspectorQueueTab({
    activeProjection,
    handleUpdateQueue,
    applyBatchUpdate,
}: {
    activeProjection: ProjectionMasterWithId;
    handleUpdateQueue: (updater: (old: ProjectionMasterWithId) => ProjectionMasterWithId) => void;
    applyBatchUpdate: (assetId: string, scope: ApplyScope, sourceArea: AreaName) => void;
}) {
    const availableGroups = useMemo(() => {
        const groups = new Set<string>();
        for (const item of activeProjection.contents) {
            groups.add(item.group || "");
        }
        return Array.from(groups);
    }, [activeProjection.contents]);

    const titleChanged: InputChanged = (e) => {
        handleUpdateQueue((old) => ({ ...old, title: e.target.value }));
    };

    const titleBlurred = (e: React.FocusEvent<HTMLInputElement>) => {
        // Enforce a fallback if the title is left completely empty
        handleUpdateQueue((old) => ({ ...old, title: e.target.value.trim() || "Untitled Master" }));
    };

    const backgroundChanged = (val: string) => {
        handleUpdateQueue((old) => ({ ...old, bg: val || "transparent" }));
    };

    const transitionChanged = (val: ProjectionTransition) => {
        handleUpdateQueue((old) => ({
            ...old,
            transition: val,
        }));
    };

    const addLoopQueue = () => {
        handleUpdateQueue((old) => ({
            ...old,
            loopQueue: [...(old.loopQueue || []), { group: 1 }],
        }));
    };

    const updateLoopQueueType = (index: number, type: "group" | "item") => {
        handleUpdateQueue((old) => {
            const newLoopQueue = [...(old.loopQueue || [])];
            newLoopQueue[index] = type === "group" ? { group: 1 } : { item: 1 };
            return { ...old, loopQueue: newLoopQueue };
        });
    };

    const updateLoopQueueValue = (index: number, type: "group" | "item", value: string) => {
        handleUpdateQueue((old) => {
            const newLoopQueue = [...(old.loopQueue || [])];
            const numValue = parseInt(value, 10);
            newLoopQueue[index] = type === "group" ? { group: numValue } : { item: numValue };
            return { ...old, loopQueue: newLoopQueue };
        });
    };

    const removeLoopQueue = (index: number) => {
        handleUpdateQueue((old) => {
            const newLoopQueue = [...(old.loopQueue || [])];
            newLoopQueue.splice(index, 1);
            return { ...old, loopQueue: newLoopQueue };
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Queue Title</FieldLabel>
                    <TransformedInput
                        value={activeProjection.title}
                        onChange={titleChanged}
                        transformer={(v) => v.trim() || "Untitled Master"}
                        onBlur={titleBlurred}
                        placeholder="Master 1"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel>Default Background</FieldLabel>
                    <MediaInput
                        value={activeProjection.bg}
                        onChange={backgroundChanged}
                        onUploadApply={(assetId, scope) => {
                            backgroundChanged(assetId);
                            if (scope !== "single") {
                                applyBatchUpdate(assetId, scope, mi.BACKGROUND_AREANAME);
                            }
                        }}
                        areaName={mi.BACKGROUND_AREANAME}
                        accept={mi.BACKGROUND_ACCEPT}
                        placeholder="No background"
                    />
                    <FieldDescription>
                        Fallback background applied to all nodes in this queue.
                    </FieldDescription>
                </Field>

                <Field>
                    <FieldLabel>Default Transition</FieldLabel>
                    <Select
                        value={activeProjection.transition ?? "fade"}
                        onValueChange={transitionChanged}
                        required
                    >
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

                <Field>
                    <FieldLabel>Loop Queue</FieldLabel>
                    <div className="flex flex-col gap-2">
                        {activeProjection.loopQueue?.map((loop, index) => {
                            const isGroup = loop.group !== undefined;
                            const type = isGroup ? "group" : "item";
                            const value = isGroup ? loop.group : loop.item;

                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <ButtonGroup className="w-full">
                                        <Select
                                            value={type}
                                            onValueChange={(val: "group" | "item") =>
                                                updateLoopQueueType(index, val)
                                            }
                                        >
                                            <SelectTrigger className="w-25">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="group">Group</SelectItem>
                                                <SelectItem value="item">Item</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={String(value)}
                                            onValueChange={(val) =>
                                                updateLoopQueueValue(index, type, val)
                                            }
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isGroup
                                                    ? availableGroups.map((g, i) => (
                                                          <SelectItem key={g} value={String(i + 1)}>
                                                              {g || "Untitled Group"}
                                                          </SelectItem>
                                                      ))
                                                    : activeProjection.contents.map((item, i) => (
                                                          <SelectItem key={i} value={String(i + 1)}>
                                                              {item.name || `Item ${i + 1}`}
                                                          </SelectItem>
                                                      ))}
                                            </SelectContent>
                                        </Select>
                                    </ButtonGroup>

                                    <Button
                                        type="button"
                                        variant={"ghost"}
                                        size={"icon"}
                                        className="text-muted-foreground hover:text-destructive px-2! py-0"
                                        aria-label={"Remove"}
                                        onClick={() => removeLoopQueue(index)}
                                    >
                                        <span className="sr-only">Remove</span>
                                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.25} />
                                    </Button>
                                </div>
                            );
                        })}
                        <Button variant="outline" size="sm" onClick={addLoopQueue}>
                            Add Loop
                        </Button>
                    </div>
                </Field>
            </FieldGroup>
        </div>
    );
}

function InspectorSettingsTab() {
    const globalSettings = useSettingsStore((s) => s.global);
    const setSettings = useSettingsStore((s) => s.set);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string) as AppSettings;
                setSettings((state) => {
                    state.global = json;
                    state.globalActivator = "server";
                    Object.assign(state.temp, state.global);
                });
            } catch (err) {
                console.error("Failed to parse settings.json", err);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(globalSettings, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="no-scrollbar relative flex flex-1 flex-col gap-4 overflow-y-auto">
            <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImport}
            />
            <ButtonGroup className="w-full px-4 pt-3" orientation={"horizontal"}>
                <Button
                    variant="outline"
                    size={"sm"}
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Load JSON
                </Button>
                <Button variant="outline" size={"sm"} className="flex-1" onClick={handleExport}>
                    Export JSON
                </Button>
            </ButtonGroup>

            <Tabs defaultValue="backdrop" className="flex h-full flex-1 flex-col overflow-hidden">
                <div className="px-4">
                    <TabsList className="w-full grid-cols-3">
                        <TabsTrigger value="backdrop" className="flex-1">
                            Backdrop
                        </TabsTrigger>
                        <TabsTrigger value="cover" className="flex-1">
                            Cover
                        </TabsTrigger>
                        <TabsTrigger value="remap" className="flex-1">
                            Remap
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="no-scrollbar relative flex-1 overflow-y-auto p-4">
                    <TabsContent value="backdrop" className="m-0 flex flex-col gap-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Color</FieldLabel>
                                <Input
                                    type="color"
                                    value={globalSettings.backdrop.color}
                                    onChange={(e) =>
                                        setSettings((s) => {
                                            s.global.backdrop.color = e.target.value;
                                        })
                                    }
                                    className="h-10 cursor-pointer p-1"
                                />
                            </Field>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="cover" className="m-0 flex flex-col gap-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Type</FieldLabel>
                                <Select
                                    value={globalSettings.cover.type}
                                    onValueChange={(val: "image" | "video") =>
                                        setSettings((s) => {
                                            s.global.cover.type = val;
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>Content Resource</FieldLabel>
                                <MediaInput
                                    value={globalSettings.cover.content}
                                    onChange={(val) =>
                                        setSettings((s) => {
                                            s.global.cover.content = val;
                                        })
                                    }
                                    onUploadApply={(assetId) =>
                                        setSettings((s) => {
                                            s.global.cover.content = assetId;
                                        })
                                    }
                                    areaName={mi.COVER_AREANAME}
                                    accept={
                                        globalSettings.cover.type === "image"
                                            ? mi.IMAGE_ACCEPT
                                            : mi.VIDEO_ACCEPT
                                    }
                                    placeholder="URL or Media Input"
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Scale Strategy</FieldLabel>
                                <Select
                                    value={globalSettings.cover.scaleStrategy}
                                    onValueChange={(val: "fit" | "fill") =>
                                        setSettings((s) => {
                                            s.global.cover.scaleStrategy = val;
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fit">Fit</SelectItem>
                                        <SelectItem value="fill">Fill</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="remap" className="m-0 flex flex-col gap-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Screen Resolution</FieldLabel>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Width"
                                        value={globalSettings.remap.screenResolution.width}
                                        onChange={(e) =>
                                            setSettings((s) => {
                                                s.global.remap.screenResolution.width = Number(
                                                    e.target.value,
                                                );
                                            })
                                        }
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Height"
                                        value={globalSettings.remap.screenResolution.height}
                                        onChange={(e) =>
                                            setSettings((s) => {
                                                s.global.remap.screenResolution.height = Number(
                                                    e.target.value,
                                                );
                                            })
                                        }
                                    />
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel>Content Resolution</FieldLabel>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Width"
                                        value={globalSettings.remap.contentResolution.width}
                                        onChange={(e) =>
                                            setSettings((s) => {
                                                s.global.remap.contentResolution.width = Number(
                                                    e.target.value,
                                                );
                                            })
                                        }
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Height"
                                        value={globalSettings.remap.contentResolution.height}
                                        onChange={(e) =>
                                            setSettings((s) => {
                                                s.global.remap.contentResolution.height = Number(
                                                    e.target.value,
                                                );
                                            })
                                        }
                                    />
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel>Scale Strategy</FieldLabel>
                                <Select
                                    value={globalSettings.remap.scaleStrategy}
                                    onValueChange={(val: "fit" | "fill") =>
                                        setSettings((s) => {
                                            s.global.remap.scaleStrategy = val;
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fit">Fit</SelectItem>
                                        <SelectItem value="fill">Fill</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldGroup>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
