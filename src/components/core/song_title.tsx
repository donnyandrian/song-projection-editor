import { ComplexContainer } from "./complex-container";
import { addConverter } from "@/lib/component-converter";
import { cn } from "@/lib/utils";
import { memo } from "react";

type SongTitleProps = {
    title: string;
    author?: string;
    className?: string;
    titleClassName?: string;
};

function SongTitle({ title, author, className, titleClassName }: SongTitleProps) {
    return (
        <ComplexContainer className="gap-12">
            <span className={cn("song-title text-white", className, titleClassName)}>{title}</span>
            {author && (
                <span
                    className={cn(
                        "geologica-base geologica text-4.5xl/tight relative font-medium whitespace-pre-line text-white",
                        "before:absolute before:top-1/2 before:bottom-1/2 before:-left-64 before:h-1 before:w-48 before:bg-white",
                        "after:absolute after:top-1/2 after:-right-64 after:bottom-1/2 after:h-1 after:w-48 after:bg-white",
                        className,
                    )}
                >
                    {author}
                </span>
            )}
        </ComplexContainer>
    );
}
export const SongTitleMemo = memo(SongTitle);

import { object, string } from "zod";
// eslint-disable-next-line react-refresh/only-export-components
export const registerSongTitle = () => {
    console.log("Registering SongTitle");
    addConverter(
        "SongTitle",
        object({
            title: string(),
            author: string().optional(),
            className: string().optional(),
            titleClassName: string().optional(),
        }),
        (content) => {
            return <SongTitleMemo key={content.key} {...content.props} />;
        },
    );
};
registerSongTitle();
