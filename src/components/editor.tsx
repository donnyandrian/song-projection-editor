import { Tabs } from "@/components/ui/tabs";
import { AddMasterButton, DeleteMasterButton, MasterTabs } from "@/components/master/queue";
import { MasterContents } from "@/components/master/content";
import { Button } from "@/components/ui/button";
import { useMasterStore } from "@/stores/master.store";
import { useShallow } from "zustand/react/shallow";

export function Editor() {
    const [activeTab, setActiveTab] = useMasterStore(
        useShallow((s) => [s.activeTab, s.setActiveTab]),
    );

    const hasActiveTab = useMasterStore((s) => s.activeProjectionIndex >= 0);

    return (
        <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="size-full">
                <div className="flex w-full flex-row items-center gap-4 px-4">
                    <span className="text-muted-foreground text-sm">Queue</span>
                    <MasterTabs />
                    <AddMasterButton />
                    {hasActiveTab && <DeleteMasterButton />}
                </div>
                <MasterContents />
            </Tabs>
            <div className="flex flex-row items-center justify-center gap-4 px-4 *:text-sm">
                <Button variant={"default"}>Contents</Button>
                <Button variant={"default"}>Transition</Button>
                <Button variant={"default"}>Background</Button>
            </div>
        </>
    );
}
