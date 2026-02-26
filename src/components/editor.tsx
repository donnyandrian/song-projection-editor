import { Tabs } from "@/components/ui/tabs";
import { AddMasterButton, DeleteMasterButton, MasterTabs } from "@/components/master/queue";
import { MasterContents } from "@/components/master/content";
import { useMasterStore } from "@/stores/master.store";
import { useShallow } from "zustand/react/shallow";
import { Inspector } from "@/components/master/inspector";

export function Editor() {
    const [activeTab, setActiveTab] = useMasterStore(
        useShallow((s) => [s.activeTab, s.setActiveTab]),
    );

    const hasActiveTab = useMasterStore((s) => s.activeProjectionIndex >= 0);

    return (
        <div className="flex size-full flex-row overflow-hidden">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-1 flex-col overflow-hidden pt-2"
            >
                <div className="flex w-full flex-row items-center gap-4 px-4">
                    <h3 className="text-muted-foreground text-sm font-medium">Queue</h3>
                    <MasterTabs />
                    <AddMasterButton />
                    {hasActiveTab && <DeleteMasterButton />}
                </div>
                <MasterContents />
            </Tabs>
            <aside className="bg-background hidden flex-col border-l sm:flex sm:w-80">
                <Inspector />
            </aside>
        </div>
    );
}
