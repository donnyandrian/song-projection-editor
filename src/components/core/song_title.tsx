import { ComplexContainer } from "./complex-container";
import { cn } from "@/lib/utils";
import { memo } from "react";

type SongTitleProps = {
    title: string;
    medleyTitle?: string;
    author?: string;
    style?: React.CSSProperties;
    titleStyle?: React.CSSProperties;
};

function SongTitle(props: SongTitleProps) {
    return (
        <ComplexContainer className="gap-12">
            <span
                className={"song-title whitespace-pre-line text-white"}
                style={{ ...props.style, ...props.titleStyle }}
            >
                {props.title} {props.medleyTitle && <span className="text-5xl/tight">medley</span>}{" "}
                {props.medleyTitle}
            </span>
            {props.author && (
                <span
                    className={cn(
                        "geologica-base geologica text-4.5xl/tight relative font-medium whitespace-pre-line text-white",
                        "before:absolute before:top-1/2 before:bottom-1/2 before:-left-64 before:h-1 before:w-48 before:bg-white",
                        "after:absolute after:top-1/2 after:-right-64 after:bottom-1/2 after:h-1 after:w-48 after:bg-white",
                    )}
                    style={props.style}
                >
                    {props.author}
                </span>
            )}
        </ComplexContainer>
    );
}
export const SongTitleMemo = memo(SongTitle);
