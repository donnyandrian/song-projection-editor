import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import type { ProjectionItem } from "@/types";
import type { HandleUpdate } from "@/types/inspector";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { CSS_PROPERTIES } from "@/const/css";

interface FieldProps {
    activeItem: ProjectionItem;
    handleUpdate: HandleUpdate;
}
function TextStyleField({ activeItem, handleUpdate }: FieldProps) {
    const updateStyleKey = (oldKey: string, newKey: string) => {
        if (!newKey || oldKey === newKey) return;
        handleUpdate((old) => {
            if (old.type !== "Text") return old;
            const currentStyle = (old.options?.style as Record<string, string | number>) || {};
            const newStyle: Record<string, string | number> = { ...currentStyle };

            const val = newStyle[oldKey];
            delete newStyle[oldKey];
            newStyle[newKey] = val !== undefined ? val : "";

            return { ...old, options: { ...old.options, style: newStyle as React.CSSProperties } };
        });
    };

    const updateStyleValue = (key: string, value: string) => {
        handleUpdate((old) => {
            if (old.type !== "Text") return old;
            const currentStyle = (old.options?.style as Record<string, string | number>) || {};
            const newStyle: Record<string, string | number> = { ...currentStyle };

            newStyle[key] = value;
            return { ...old, options: { ...old.options, style: newStyle as React.CSSProperties } };
        });
    };

    const addStyleProperty = () => {
        handleUpdate((old) => {
            if (old.type !== "Text") return old;
            const currentStyle = (old.options?.style as Record<string, string | number>) || {};
            const newStyle: Record<string, string | number> = { ...currentStyle };

            let count = 1;
            let newKey = "property";
            while (newStyle[newKey] !== undefined) {
                count++;
                newKey = `property${count}`;
            }
            newStyle[newKey] = "";
            return { ...old, options: { ...old.options, style: newStyle as React.CSSProperties } };
        });
    };

    const removeStyleProperty = (key: string) => {
        handleUpdate((old) => {
            if (old.type !== "Text") return old;
            const currentStyle = (old.options?.style as Record<string, string | number>) || {};
            const newStyle: Record<string, string | number> = { ...currentStyle };

            delete newStyle[key];
            return { ...old, options: { ...old.options, style: newStyle as React.CSSProperties } };
        });
    };

    const activeItemStyle =
        activeItem.type === "Text"
            ? (activeItem.options?.style as Record<string, string | number>) || {}
            : {};

    return (
        <Field>
            <FieldLabel>CSS Styles</FieldLabel>
            <div className="flex flex-col gap-2">
                {Object.entries(activeItemStyle).map(([key, value]) => {
                    // Only pass the value to Combobox if it's a valid predefined property.
                    // Otherwise, pass an empty string to show the placeholder.
                    const comboboxValue = CSS_PROPERTIES.includes(key) ? key : "";

                    return (
                        <div key={key} className="flex items-center gap-2 last-of-type:mb-2">
                            <div className="flex-1">
                                <Combobox
                                    items={CSS_PROPERTIES}
                                    value={comboboxValue}
                                    autoHighlight
                                    onValueChange={(val) => val && updateStyleKey(key, val)}
                                >
                                    <ComboboxInput placeholder="Property" />
                                    <ComboboxContent className="w-60">
                                        <ComboboxEmpty>No match found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item: string) => (
                                                <ComboboxItem key={item} value={item}>
                                                    {item}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                            <div className="flex-1">
                                <Input
                                    value={String(value)}
                                    onChange={(e) => updateStyleValue(key, e.target.value)}
                                    placeholder="Value"
                                />
                            </div>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                className="text-muted-foreground hover:text-destructive px-2! py-0"
                                aria-label={"Remove"}
                                onClick={() => removeStyleProperty(key)}
                            >
                                <span className="sr-only">Remove</span>
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.25} />
                            </Button>
                        </div>
                    );
                })}
                <Button variant="outline" size="sm" onClick={addStyleProperty}>
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2.25} />
                    Add Property
                </Button>
            </div>
            <FieldDescription>
                Define custom React CSS properties for this text element. Use camelCase formatting.
            </FieldDescription>
        </Field>
    );
}

export { TextStyleField };
