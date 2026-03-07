import { Tabs } from "@/components/ui/tabs";
import {
    AddMasterButton,
    DeleteMasterButton,
    DuplicateMasterButton,
    ImportExportButton,
    MasterTabs,
} from "@/components/master/queue";
import { MasterContents } from "@/components/master/content";
import { useMasterStore } from "@/stores/master.store";
import { useShallow } from "zustand/react/shallow";
import { InspectMode, Inspector } from "@/components/master/inspector";
import { ButtonGroup } from "@/components/ui/button-group";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { useEffect, useMemo, useState } from "react";
import { useProjectionStore } from "@/stores/projection.store";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function NavigatorKeyboard() {
    const [registerShortcut, unregisterShortcut] = useGlobalKeyboard();

    useEffect(() => {
        const handlePrevProjection = () => {
            const masterStore = useMasterStore.getState();
            const projectionStore = useProjectionStore.getState();
            const projections = projectionStore.projections;
            const currentIndex = masterStore.activeProjectionIndex;

            if (currentIndex > 0 && projections[currentIndex - 1]) {
                masterStore.setActiveTab(projections[currentIndex - 1].id);
            }
        };

        const handleNextProjection = () => {
            const masterStore = useMasterStore.getState();
            const projectionStore = useProjectionStore.getState();
            const projections = projectionStore.projections;
            const currentIndex = masterStore.activeProjectionIndex;

            if (
                currentIndex < projections.length - 1 &&
                currentIndex >= 0 &&
                projections[currentIndex + 1]
            ) {
                masterStore.setActiveTab(projections[currentIndex + 1].id);
            } else if (currentIndex === -1 && projections.length > 0 && projections[0]) {
                masterStore.setActiveTab(projections[0].id);
            }
        };

        const handlePrevContent = () => {
            const masterStore = useMasterStore.getState();
            const activeIndex = masterStore.activeContentIndex;

            if (activeIndex > 0) {
                masterStore.setActiveContentIndex(activeIndex - 1);
            }
        };

        const handleNextContent = () => {
            const masterStore = useMasterStore.getState();
            const projectionStore = useProjectionStore.getState();
            const pIndex = masterStore.activeProjectionIndex;

            if (pIndex < 0) return;

            const contents = projectionStore.projections[pIndex]?.contents;
            if (!contents) return;

            const activeIndex = masterStore.activeContentIndex;
            if (activeIndex < contents.length - 1) {
                masterStore.setActiveContentIndex(activeIndex + 1);
            }
        };

        registerShortcut("ArrowUp", handlePrevProjection);
        registerShortcut("ArrowDown", handleNextProjection);
        registerShortcut("ArrowLeft", handlePrevContent);
        registerShortcut("ArrowRight", handleNextContent);

        return () => {
            unregisterShortcut("ArrowUp");
            unregisterShortcut("ArrowDown");
            unregisterShortcut("ArrowLeft");
            unregisterShortcut("ArrowRight");
        };
    }, [registerShortcut, unregisterShortcut]);

    return null;
}

export function Editor() {
    const [activeTab, setActiveTab] = useMasterStore(
        useShallow((s) => [s.activeTab, s.setActiveTab]),
    );

    const hasActiveTab = useMasterStore((s) => s.activeProjectionIndex >= 0);
    const [mobileView, setMobileView] = useState<"queue" | "inspector">("queue");

    const modeSelector = useMemo(() => <InspectMode />, []);
    const inspector = useMemo(() => <Inspector children={modeSelector} />, [modeSelector]);

    const isInspector = mobileView === "inspector";

    return (
        <div className="flex size-full flex-row overflow-hidden">
            <NavigatorKeyboard />
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-1 flex-col overflow-hidden pt-2"
            >
                <div className="flex w-full flex-row items-center gap-4 px-4">
                    <h3 className="text-muted-foreground text-sm font-medium select-none max-sm:hidden">
                        Queue
                    </h3>

                    <div className="sm:hidden">
                        <Select
                            value={mobileView}
                            onValueChange={(v: "queue" | "inspector") => setMobileView(v)}
                        >
                            <SelectTrigger className="text-muted-foreground h-auto w-auto gap-1 border-0 p-0 text-sm font-medium shadow-none focus:ring-0 [&>svg]:size-4">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="queue">Queue</SelectItem>
                                    <SelectItem value="inspector">Inspector</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className={cn("contents", isInspector && "max-sm:hidden")}>
                        <MasterTabs />
                        <ButtonGroup className="ml-auto">
                            <ButtonGroup>
                                <ImportExportButton />
                            </ButtonGroup>
                            <ButtonGroup className="[&>*:not(:first-child)>*]:rounded-l-none [&>*:not(:first-child)>*]:border-l-0 [&>*:not(:last-child)>*]:rounded-r-none">
                                <AddMasterButton />
                                <DuplicateMasterButton />
                            </ButtonGroup>
                            {hasActiveTab && (
                                <ButtonGroup>
                                    <DeleteMasterButton />
                                </ButtonGroup>
                            )}
                        </ButtonGroup>
                    </div>

                    <div className={cn("hidden *:ml-auto", isInspector && "max-sm:contents")}>
                        {modeSelector}
                    </div>
                </div>
                <div className={cn("contents", isInspector && "max-sm:hidden")}>
                    <MasterContents />
                </div>
                <div
                    className={cn(
                        "flex-1 flex-col overflow-hidden sm:hidden [&>div>div:first-child]:hidden",
                        isInspector ? "flex" : "hidden",
                    )}
                >
                    {inspector}
                </div>
            </Tabs>
            <aside className="bg-background hidden flex-col border-l sm:flex sm:w-80">
                {inspector}
            </aside>
        </div>
    );
}
