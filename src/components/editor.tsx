import { Tabs } from "@/components/ui/tabs";
import { AddMasterButton, DeleteMasterButton, ImportExportButton, MasterTabs } from "@/components/master/queue";
import { MasterContents } from "@/components/master/content";
import { useMasterStore } from "@/stores/master.store";
import { useShallow } from "zustand/react/shallow";
import { Inspector } from "@/components/master/inspector";
import { ButtonGroup } from "@/components/ui/button-group";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { useEffect } from "react";
import { useProjectionStore } from "@/stores/projection.store";

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

    return (
        <div className="flex size-full flex-row overflow-hidden">
            <NavigatorKeyboard />
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-1 flex-col overflow-hidden pt-2"
            >
                <div className="flex w-full flex-row items-center gap-4 px-4">
                    <h3 className="text-muted-foreground text-sm font-medium select-none">Queue</h3>
                    <MasterTabs />
                    <ButtonGroup>
                        <ButtonGroup>
                            <ImportExportButton />
                        </ButtonGroup>
                        <ButtonGroup>
                            <AddMasterButton />
                        </ButtonGroup>
                        {hasActiveTab && (
                            <ButtonGroup>
                                <DeleteMasterButton />
                            </ButtonGroup>
                        )}
                    </ButtonGroup>
                </div>
                <MasterContents />
            </Tabs>
            <aside className="bg-background hidden flex-col border-l sm:flex sm:w-80">
                <Inspector />
            </aside>
        </div>
    );
}
