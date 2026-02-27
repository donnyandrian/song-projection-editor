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
import type { ProjectionItem, ProjectionTransition, ProjectionMaster } from "@/types";
import { TextStyleField } from "@/components/master/inspector/text";
import type { HandleUpdate, InputChanged } from "@/types/inspector";

export function Inspector() {
    const activeProjectionIndex = useMasterStore((s) => s.activeProjectionIndex);
    const activeContentIndex = useMasterStore((s) => s.activeContentIndex);
    const updateContent = useProjectionStore((s) => s.updateContent);
    const projections = useProjectionStore((s) => s.projections);

    const activeProjection = projections[activeProjectionIndex];
    const activeItem = activeProjection?.contents[activeContentIndex];

    if (!activeItem) {
        return (
            <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
                Select a node to inspect its properties.
            </div>
        );
    }

    const handleUpdate: HandleUpdate = (updater) => {
        updateContent(activeProjectionIndex, activeContentIndex, updater);
    };

    const itemKey = `${activeProjectionIndex}-${activeContentIndex}`;

    return (
        <div className="bg-background flex h-full flex-col overflow-hidden">
            <div className="border-b px-4 py-3">
                <h3 className="text-muted-foreground text-sm font-medium">Inspector</h3>
            </div>

            <Tabs defaultValue="content" className="flex flex-1 flex-col overflow-hidden">
                <div className="px-4 pt-3">
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
                    />
                    <InspectorBackgroundTab
                        activeItem={activeItem}
                        handleUpdate={handleUpdate}
                        activeProjection={activeProjection}
                    />
                    <InspectorTransitionTab activeItem={activeItem} handleUpdate={handleUpdate} />
                </div>
            </Tabs>
        </div>
    );
}

interface TabProps {
    activeItem: ProjectionItem;
    handleUpdate: HandleUpdate;
}
interface ContentTabProps extends TabProps {
    itemKey: string;
}
function InspectorContentTab({ itemKey, activeItem, handleUpdate }: ContentTabProps) {
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

    const contentChanged: InputChanged = (e) => {
        handleUpdate((old) => {
            // Discard Component edits as string, fallback for Primitives and Text
            if (old.type === "Component") return old;
            return { ...old, content: e.target.value };
        });
    };

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
                    <Input
                        value={activeItem.group ?? ""}
                        onChange={groupChanged}
                        placeholder="Optional Group"
                    />
                </Field>

                <FieldSeparator />

                <Field>
                    <FieldLabel>Content Resource</FieldLabel>
                    <Input
                        value={typeof activeItem.content === "string" ? activeItem.content : ""}
                        onChange={contentChanged}
                        placeholder={
                            activeItem.type === "Text" ? "Enter text..." : "Filename or URL"
                        }
                    />
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
}
function InspectorBackgroundTab({
    activeItem,
    handleUpdate,
    activeProjection,
}: BackgroundTabProps) {
    const backgroundChanged: InputChanged = (e) => {
        handleUpdate((old) => ({
            ...old,
            bg: e.target.value || undefined,
        }));
    };

    return (
        <TabsContent value="background" className="m-0 flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Background Source</FieldLabel>
                    <Input
                        value={activeItem.bg ?? ""}
                        onChange={backgroundChanged}
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
