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
import { useMemo } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";

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

    if (!activeProjection) {
        return (
            <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
                Select a queue to inspect its properties.
            </div>
        );
    }

    if (!activeItem) {
        return (
            <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
                Select a node to inspect its properties.
            </div>
        );
    }

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
                ...(sourceArea === mi.CONTENT_AREANAME ? { content: assetId } : { bg: assetId }),
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

    return (
        <div className="bg-background flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-muted-foreground text-sm font-medium select-none">Inspector</h3>
                {children}
            </div>

            {inspectMode === "content" ? (
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
            ) : (
                <div className="no-scrollbar relative flex-1 overflow-y-auto p-4">
                    <InspectorQueueTab
                        activeProjection={activeProjection}
                        handleUpdateQueue={handleUpdateQueue}
                        applyBatchUpdate={applyBatchUpdate}
                    />
                </div>
            )}
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
    const typeChanged = (val: "Text" | "Image" | "Video") => {
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
            }
            return { ...base, type: val };
        });
    };

    const nameChanged: InputChanged = (e) => {
        handleUpdate((old) => ({ ...old, name: e.target.value }));
    };

    const groupChanged: InputChanged = (e) => {
        handleUpdate((old) => ({ ...old, group: e.target.value }));
    };

    const contentChanged = (val: string) => {
        handleUpdate((old) => {
            // Discard Component edits as string, fallback for Primitives and Text
            if (old.type === "Component") return old;
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
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                        value={activeItem.name ?? ""}
                        onChange={nameChanged}
                        placeholder="Optional Name"
                    />
                </Field>

                <Field>
                    <FieldLabel>Group</FieldLabel>
                    <Combobox
                        items={availableGroups}
                        value={activeItem.group ?? ""}
                        onValueChange={(val) => {
                            if (val) handleUpdate((old) => ({ ...old, group: val }));
                        }}
                    >
                        <ComboboxInput
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
                    {activeItem.type === "Text" || activeItem.type === "Component" ? (
                        <Textarea
                            value={typeof activeItem.content === "string" ? activeItem.content : ""}
                            onChange={(e) => contentChanged(e.target.value)}
                            placeholder="Enter text..."
                            className="min-h-25"
                        />
                    ) : (
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
                    )}
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
    const titleChanged: InputChanged = (e) => {
        handleUpdateQueue((old) => ({ ...old, title: e.target.value }));
    };

    const titleBlurred = () => {
        // Enforce a fallback if the title is left completely empty
        if (!activeProjection.title?.trim()) {
            handleUpdateQueue((old) => ({ ...old, title: "Untitled Master" }));
        }
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

    return (
        <div className="flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Queue Title</FieldLabel>
                    <Input
                        value={activeProjection.title}
                        onChange={titleChanged}
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
            </FieldGroup>
        </div>
    );
}
