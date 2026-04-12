import { usePersistence } from "@/hooks/use-persistence";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Viewer } from "@/components/viewer";
import { Editor } from "@/components/editor";
import { useMasterStore } from "@/stores/master.store";
import { useShallow } from "zustand/react/shallow";
import { GlobalKeyboardListener } from "@/hooks/use-shortcuts";
import { useConverter } from "@/hooks/use-converter";

export default function App() {
    usePersistence();
    useConverter();

    return (
        <ResizablePanelGroup orientation="vertical" className="size-full">
            <ResizablePanel defaultSize="55%" minSize="5rem" className="bg-sidebar-accent relative">
                <div className="absolute top-full size-full shadow-[0px_-8px_42px_0px_rgba(0,0,0,0.15)]"></div>
                <ViewScreen />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-sidebar-accent *:bg-sidebar-accent" />
            <GlobalKeyboardListener />
            <TooltipProvider>
                <ResizablePanel
                    defaultSize="45%"
                    minSize="16.25rem"
                    className="flex flex-col gap-2"
                >
                    <Editor />
                </ResizablePanel>
            </TooltipProvider>
        </ResizablePanelGroup>
    );
}

function ViewScreen() {
    const [currentProjection, currentIndex] = useMasterStore(
        useShallow((s) => [s.activeProjectionIndex, s.activeContentIndex]),
    );

    return <Viewer currentIndex={currentIndex} currentProjection={currentProjection} />;
}
