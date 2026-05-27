import { CssStylesInput, type StyleItem } from "@/components/master/shared/css-styles-input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { generateId } from "@/lib/utils";
import { useMasterStore } from "@/stores/master.store";
import { useCallback, useRef, useState } from "react";

interface FieldProps {
    type: "style" | "titleStyle";
    currentStyles?: React.CSSProperties;
    handleUpdate: (key: string, val: unknown) => void;
}
function StyleField({ type, currentStyles, handleUpdate }: FieldProps) {
    const activeItemStyle = (currentStyles as Record<string, string | number>) || {};

    // Initialize local state once from the global item state to maintain stable IDs
    const [styles, setStyles] = useState<StyleItem[]>(() =>
        Object.entries(activeItemStyle).map(([property, value]) => ({
            id: generateId(),
            property,
            value: String(value),
        })),
    );

    const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);
    const update = useCallback(
        (newStyles: StyleItem[]) => {
            setStyles(newStyles);

            if (timerId.current) {
                clearTimeout(timerId.current);
            }

            // Debounce the global state update
            timerId.current = setTimeout(() => {
                const newStyleRecord: Record<string, string | number> = {};
                for (const s of newStyles) {
                    const p = s.property.trim();
                    if (p) newStyleRecord[p] = s.value;
                }

                handleUpdate(type, newStyleRecord);
                timerId.current = null;
            }, 300);
        },
        [handleUpdate, type],
    );

    return (
        <CssStylesInput
            label={type === "titleStyle" ? "Title CSS Styles" : "Overall CSS Styles"}
            styles={styles}
            onChange={update}
        />
    );
}

interface SongTitleProps {
    title: string;
    medleyTitle?: string;
    author?: string;
    style?: React.CSSProperties;
    titleStyle?: React.CSSProperties;
    contentChanged: (val: unknown) => void;
}
export function SongTitleField({ contentChanged, ...props }: SongTitleProps) {
    const handleUpdate = useCallback(
        (key: string, val: unknown) => {
            contentChanged({
                type: "SongTitle",
                props: { ...props, [key]: val },
            });
        },
        [contentChanged, props],
    );

    const itemKey = useMasterStore((s) => `${s.activeProjectionIndex}-${s.activeContentIndex}`);

    return (
        <FieldGroup>
            <Field>
                <FieldLabel>Title</FieldLabel>
                <Textarea
                    value={props.title ?? ""}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    placeholder="Title"
                    className="min-h-8"
                    required
                />
            </Field>
            <Field>
                <FieldLabel>Medley Title</FieldLabel>
                <Textarea
                    value={props.medleyTitle ?? ""}
                    onChange={(e) => handleUpdate("medleyTitle", e.target.value)}
                    placeholder="Title"
                    className="min-h-8"
                    required
                />
            </Field>
            <Field>
                <FieldLabel>Author</FieldLabel>
                <Textarea
                    value={props.author ?? ""}
                    onChange={(e) => handleUpdate("author", e.target.value)}
                    placeholder="Author"
                    className="min-h-8"
                />
            </Field>
            <Field>
                <StyleField
                    key={itemKey}
                    type="titleStyle"
                    currentStyles={props.titleStyle}
                    handleUpdate={handleUpdate}
                />
            </Field>
            <Field>
                <StyleField
                    key={itemKey}
                    type="style"
                    currentStyles={props.style}
                    handleUpdate={handleUpdate}
                />
            </Field>
        </FieldGroup>
    );
}
