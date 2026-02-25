import { Tabs } from "@/components/ui/tabs";
import { AddMasterButton, MasterTabs } from "@/components/master/queue";
import { MasterContents } from "@/components/master/content";
import { Button } from "@/components/ui/button";
import { useTabsStore } from "@/stores/tabs.store";
import { useShallow } from "zustand/react/shallow";

export function Editor() {
    const [activeTab, setActiveTab] = useTabsStore(
        useShallow((s) => [s.activeTab, s.setActiveTab]),
    );

    return (
        <>
            <Tabs defaultValue="master-1" value={activeTab} onValueChange={setActiveTab} className="size-full">
                <div className="flex w-full flex-row items-center gap-4 px-4">
                    <span className="text-muted-foreground text-sm">Queue</span>
                    <MasterTabs />
                    <AddMasterButton/>
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
