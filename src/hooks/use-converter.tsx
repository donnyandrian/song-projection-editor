import { array, object, string } from "zod";
import { addConverter } from "@/lib/component-converter";
import { useEffect } from "react";
import { SongTitleMemo } from "@/components/core/song_title";
import { VotumMemo } from "@/components/core/votum";

export const registerSongTitle = () => {
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

export const registerVotum = () => {
    addConverter(
        "Votum",
        object({
            title: string(),
            content: array(
                object({
                    key: string(),
                    value: string(),
                }),
            ),
        }),
        (content) => {
            return <VotumMemo key={content.key} {...content.props} />;
        },
    );
};

export function useConverter() {
    useEffect(() => {
        registerSongTitle();
        registerVotum();
    }, []);
}
