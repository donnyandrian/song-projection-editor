import { EssentialContent } from "./essential-content";
import { ComplexContainer } from "./complex-container";
import { memo } from "react";

interface SyafaatProps {
    items: string[];
}
function Syafaat({ items }: SyafaatProps) {
    return (
        <ComplexContainer>
            <EssentialContent className="outline-shadow gap-16 pr-52 pb-28 pl-63 text-7xl text-[oklch(0.4198_0.0896_128.56)]">
                <h1 className="w-full font-extrabold text-[oklch(0.7159_0.1195_81.39)]">
                    Pokok-pokok doa:
                </h1>
                <ul className="-ml-7 flex w-full flex-col gap-4">
                    {items.map((value, key) => (
                        <li key={key} className="flex gap-6 leading-tight">
                            <span className="text-[160%] leading-[0.7]">•</span>
                            <span>{value}</span>
                        </li>
                    ))}
                </ul>
            </EssentialContent>
        </ComplexContainer>
    );
}
const SyafaatMemo = memo(Syafaat);

export { SyafaatMemo };
