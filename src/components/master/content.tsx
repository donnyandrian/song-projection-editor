import { Node, NodeContainer } from "@/components/node";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TabsContent } from "@/components/ui/tabs";
import { pToMaster } from "@/lib/master";
import { useProjectionStore } from "@/stores/projection.store";
import type { NodeType } from "@/types/node";

export function MasterContents() {
    const projections = useProjectionStore((s) => s.projections);

    return (
        <>
            <MasterContent id="master-1" {...pToMaster(projections[0])} />
            <MasterContent id="master-2" {...pToMaster(projections[0])} />
            {projections.map((p) => (
                <MasterContent key={p.id} id={p.id} {...pToMaster(p)} />
            ))}
        </>
    );
}

interface MasterContentProps {
    id: string;
    contents: {
        type: NodeType;
        label: string;
    }[];
    backgrounds: string[];
    transitions: string[];
}
function MasterContent({ id, contents, backgrounds, transitions }: MasterContentProps) {
    return (
        <TabsContent value={id}>
            <ResizablePanelGroup
                orientation="vertical"
                className="h-full w-auto overflow-x-scroll! *:max-w-none! *:overflow-visible! *:data-[slot=resizable-panel]:w-fit!"
            >
                <ResizablePanel
                    defaultSize="10rem"
                    minSize="5rem"
                    className="flex max-w-none! flex-col items-start gap-2 py-2"
                >
                    <span className="text-muted-foreground sticky left-0 px-4 text-xs">
                        Content
                    </span>
                    <NodeContainer>
                        {contents.map((c, i) => (
                            <Node key={i} {...c} />
                        ))}
                    </NodeContainer>
                </ResizablePanel>
                <ResizableHandle className="sticky left-0 h-px!" />
                <ResizablePanel
                    defaultSize="5rem"
                    minSize="5rem"
                    className="flex max-w-none! flex-col items-start gap-2 py-2"
                >
                    <span className="text-muted-foreground sticky left-0 px-4 text-xs">
                        Background
                    </span>
                    <NodeContainer>
                        {backgrounds.map((bg, i) => (
                            <Node key={i} type="background" label={bg} />
                        ))}
                    </NodeContainer>
                </ResizablePanel>
                <ResizableHandle className="sticky left-0 h-px!" />
                <ResizablePanel
                    defaultSize="5rem"
                    minSize="5rem"
                    className="flex max-w-none! flex-col items-start gap-2 py-2"
                >
                    <span className="text-muted-foreground sticky left-0 px-4 text-xs">
                        Transition
                    </span>
                    <NodeContainer>
                        {transitions.map((t, i) => (
                            <Node key={i} type="transition" label={t} />
                        ))}
                    </NodeContainer>
                </ResizablePanel>
            </ResizablePanelGroup>
        </TabsContent>
    );
}
