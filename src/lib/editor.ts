import { useShortcut } from "@/hooks/use-shortcuts";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";

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

export function NavigatorKeyboard() {
    useShortcut({ key: "ArrowUp" }, handlePrevProjection);
    useShortcut({ key: "ArrowDown" }, handleNextProjection);
    useShortcut({ key: "ArrowLeft" }, handlePrevContent);
    useShortcut({ key: "ArrowRight" }, handleNextContent);

    return null;
}
