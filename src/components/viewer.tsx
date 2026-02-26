import { memo } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

import { SlideBackgroundComposer, SlideComposer } from "@/components/slide-composer";
import { ContentResizer } from "@/components/core/content-resizer";
import { useShallow } from "zustand/react/shallow";
import { transitionVariants, useTransitionStore } from "@/stores/transition.store";
import { useSettingsStore } from "@/stores/settings.store";

export function Backcover() {
    const [contentResolution, color] = useSettingsStore(
        useShallow((s) => [s.global.remap.contentResolution, s.global.backdrop.color]),
    );

    return (
        <div
            style={{
                width: `${contentResolution.width}px`,
                height: `${contentResolution.height}px`,
                backgroundColor: color,
            }}
        />
    );
}

const ForegroundAnimator = memo(
    function ForegroundAnimator({
        motionKey,
        transition,
        children,
    }: {
        motionKey: string | number;
        transition: string;
        children: React.ReactNode;
    }) {
        return (
            <AnimatePresence custom={transition}>
                <motion.div
                    key={motionKey}
                    className="absolute h-full w-full"
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={transition}
                    variants={transitionVariants}
                    data-slot="foreground"
                >
                    <ContentResizer className="h-full w-full">{children}</ContentResizer>
                </motion.div>
            </AnimatePresence>
        );
    },
    (prev, next) => prev.motionKey === next.motionKey && prev.transition === next.transition,
);

const buildFKey = (projection: number, index: number) => {
    return index < 0 ? index : `${projection}-${index}`;
};
interface ViewerProps {
    currentProjection: number;
    currentIndex: number;
}
export const Viewer = memo(function Viewer({
    currentProjection = 0,
    currentIndex = 0,
}: ViewerProps) {
    const motionKey = buildFKey(currentProjection, currentIndex);
    const transition = useTransitionStore((s) => s.getTransition(currentProjection, currentIndex));

    return (
        <>
            <SlideBackgroundComposer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
            />

            <ForegroundAnimator motionKey={motionKey} transition={transition}>
                <SlideComposer currentProjection={currentProjection} currentIndex={currentIndex} />
            </ForegroundAnimator>
        </>
    );
});

export const ViewerContainer = memo(function ViewerContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    const contentResolution = useSettingsStore((s) => s.global.remap.contentResolution);

    return (
        <div
            className="relative w-full"
            style={{
                aspectRatio: `${contentResolution.width}/${contentResolution.height}`,
            }}
            data-slot="viewer"
        >
            {children}
        </div>
    );
});
