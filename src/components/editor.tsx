import { Tabs } from "@/components/ui/tabs";
import { AddMasterButton, DeleteMasterButton, MasterTabs } from "@/components/master/queue";
import { MasterContents } from "@/components/master/content";
import { Button } from "@/components/ui/button";
import { useMasterStore } from "@/stores/master.store";
import { useShallow } from "zustand/react/shallow";
import { useProjectionStore } from "@/stores/projection.store";

export function Editor() {
    const [activeTab, setActiveTab] = useMasterStore(
        useShallow((s) => [s.activeTab, s.setActiveTab]),
    );

    const hasTabs = useProjectionStore((s) => s.projections.length > 0);

    return (
        <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="size-full">
                <div className="flex w-full flex-row items-center gap-4 px-4">
                    <span className="text-muted-foreground text-sm">Queue</span>
                    <MasterTabs />
                    <AddMasterButton />
                    {hasTabs && <DeleteMasterButton />}
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
