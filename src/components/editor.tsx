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
import { useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NavigatorKeyboard } from "@/lib/editor";

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
                activationMode="manual"
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
