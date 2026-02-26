import { Node, NodeContainer } from "@/components/node";
import { RadioGroup } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { pToMaster } from "@/lib/master";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";
import type { NodeType } from "@/types/node";

export function MasterContents() {
    const projections = useProjectionStore((s) => s.projections);

    return (
        <>
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
    const activeContentIndex = useMasterStore((s) => s.activeContentIndex);

    const selectionChanged = (value: string) => {
        const index = parseInt(value, 10);
        if (isNaN(index)) return;
        useMasterStore.getState().setActiveContentIndex(index);
    };

    return (
        <TabsContent value={id}>
            <RadioGroup
                defaultValue="0"
                className="flex size-full flex-col gap-0!"
                value={activeContentIndex.toString()}
                onValueChange={selectionChanged}
            >
                <div className="relative flex h-full w-auto flex-col overflow-x-scroll!">
                    <div className="flex min-h-17 flex-1 flex-col items-start gap-1 py-2">
                        <span className="text-muted-foreground sticky left-0 px-4 text-xs">
                            Content
                        </span>
                        <NodeContainer>
                            {contents.map((c, i) => (
                                <Node key={i} index={i} {...c} />
                            ))}
                        </NodeContainer>
                    </div>
                    <Separator className="sticky left-0 h-px" />
                    <div className="flex h-17 min-h-17 flex-col items-start gap-1 py-2">
                        <span className="text-muted-foreground sticky left-0 px-4 text-xs">
                            Background
                        </span>
                        <NodeContainer>
                            {backgrounds.map((bg, i) => (
                                <Node key={i} index={i} type="background" label={bg} />
                            ))}
                        </NodeContainer>
                    </div>
                    <Separator className="sticky left-0 h-px" />
                    <div className="flex h-17 min-h-17 flex-col items-start gap-1 py-2">
                        <span className="text-muted-foreground sticky left-0 px-4 text-xs">
                            Transition
                        </span>
                        <NodeContainer>
                            {transitions.map((t, i) => (
                                <Node key={i} index={i} type="transition" label={t} />
                            ))}
                        </NodeContainer>
                    </div>
                </div>
            </RadioGroup>
        </TabsContent>
    );
}
