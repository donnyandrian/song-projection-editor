import { array, object, string } from "zod";
import { addConverter } from "@/lib/component-converter";
import { useEffect } from "react";
import { SongTitleMemo } from "@/components/core/song_title";
import { VotumMemo } from "@/components/core/votum";
import { WelcomePageMemo } from "@/components/core/welcome-page";
import { SyafaatMemo } from "@/components/core/syafaat";

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

export const registerSyafaat = () => {
    addConverter(
        "Syafaat",
        object({
            items: array(string()),
        }),
        (content) => {
            return <SyafaatMemo key={content.key} {...content.props} />;
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

export const registerWelcomePage = () => {
    addConverter(
        "WelcomePage",
        object({
            baseSource: string(),
            loopSource: string(),
        }),
        (content) => {
            return <WelcomePageMemo key={content.key} {...content.props} />;
        },
    );
};

export function useConverter() {
    useEffect(() => {
        registerSongTitle();
        registerSyafaat();
        registerVotum();
        registerWelcomePage();
    }, []);
}
