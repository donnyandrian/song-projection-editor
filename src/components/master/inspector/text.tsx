import type { ProjectionItem } from "@/types";
import type { HandleUpdate } from "@/types/inspector";
import { CssStylesInput, type StyleItem } from "@/components/master/shared/css-styles-input";
import { useEffect, useState } from "react";
import { generateId } from "@/lib/utils";

interface FieldProps {
    activeItem: ProjectionItem;
    handleUpdate: HandleUpdate;
}
function TextStyleField({ activeItem, handleUpdate }: FieldProps) {
    const activeItemStyle =
        activeItem.type === "Text"
            ? (activeItem.options?.style as Record<string, string | number>) || {}
            : {};

    // Initialize local state once from the global item state to maintain stable IDs
    const [styles, setStyles] = useState<StyleItem[]>(() =>
        Object.entries(activeItemStyle).map(([property, value]) => ({
            id: generateId(),
            property,
            value: String(value),
        })),
    );

    // Debounce the global state update
    useEffect(() => {
        // Set a timer to batch the update 300ms after the user stops typing
        // 300ms is the sweet spot: fast enough to feel "live", slow enough to prevent rendering lag
        const timeoutId = setTimeout(() => {
            handleUpdate((old) => {
                if (old.type !== "Text") return old;

                const newStyleRecord: Record<string, string | number> = {};
                for (const s of styles) {
                    const p = s.property.trim();
                    if (p) newStyleRecord[p] = s.value;
                }

                return {
                    ...old,
                    options: {
                        ...old.options,
                        style: newStyleRecord as React.CSSProperties,
                    },
                };
            });
        }, 300);

        // Cleanup the timer if the user types again before the 300ms is up
        return () => clearTimeout(timeoutId);
    }, [styles, handleUpdate]);

    return <CssStylesInput styles={styles} onChange={setStyles} />;
}

export { TextStyleField };
