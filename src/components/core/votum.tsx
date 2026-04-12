import { EssentialContent } from "./essential-content";
import { ComplexContainer } from "./complex-container";
import { memo } from "react";

interface VotumProps {
    title: string;
    content: { key: string; value: string }[];
}
function Votum({ title, content }: VotumProps) {
    return (
        <ComplexContainer>
            <EssentialContent className="outline-shadow gap-16 px-63 text-[oklch(0.4198_0.0896_128.56)]">
                <h1 className="section-title mx-0">Votum</h1>
                <div className="flex h-1/2 w-full flex-col gap-8 text-6xl [--brown:oklch(0.7159_0.1195_81.39)]">
                    <h2 className="text-center font-bold text-(--brown)">{title}</h2>
                    <div className="flex w-full flex-col gap-10 *:leading-tight">
                        {content?.map(({ key, value }) => (
                            <p key={key}>
                                <sup className="text-(--brown)">{key}</sup> {value}
                            </p>
                        ))}
                    </div>
                </div>
            </EssentialContent>
        </ComplexContainer>
    );
}
export const VotumMemo = memo(Votum) as typeof Votum;
