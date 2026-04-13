import { VideoPlayer } from "./video-player";
import { ComplexContainer } from "./complex-container";
import { memo, useId } from "react";

interface WelcomePageProps {
    baseSource: string;
    loopSource: string;
}
function WelcomePage({ baseSource, loopSource }: WelcomePageProps) {
    const id = useId();

    const onEnded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const elem = document.getElementById(id) as HTMLVideoElement;
        void elem.play();
        e.currentTarget.style.display = "none";
    };

    return (
        <ComplexContainer className="dark text-foreground">
            <VideoPlayer src={baseSource} autoPlay muted onEnded={onEnded} />
            <VideoPlayer
                id={id}
                src={loopSource}
                muted
                loop
                className="absolute -z-1"
                preload="auto"
            />
        </ComplexContainer>
    );
}
export const WelcomePageMemo = memo(WelcomePage);
