import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { CSS_PROPERTIES } from "@/const/css";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { generateId } from "@/lib/utils";

export interface StyleItem {
    id: string;
    property: string;
    value: string;
}

interface CssStylesInputProps {
    styles: StyleItem[];
    onChange: (styles: StyleItem[]) => void;
}

export function CssStylesInput({ styles, onChange }: CssStylesInputProps) {
    const addStyle = () => {
        onChange([...styles, { id: generateId(), property: "", value: "" }]);
    };

    const removeStyle = (id: string) => {
        onChange(styles.filter((s) => s.id !== id));
    };

    const updateStyle = (id: string, field: "property" | "value", val: string) => {
        onChange(styles.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
    };

    return (
        <Field>
            <FieldLabel>CSS Styles</FieldLabel>
            <div className="flex flex-col gap-2">
                {styles.map((style) => {
                    const comboboxValue = CSS_PROPERTIES.includes(style.property)
                        ? style.property
                        : "";

                    return (
                        <div key={style.id} className="flex items-center gap-2 last-of-type:mb-2">
                            <div className="flex-1">
                                <Combobox
                                    items={CSS_PROPERTIES}
                                    value={comboboxValue}
                                    autoHighlight
                                    onValueChange={(val) =>
                                        val && updateStyle(style.id, "property", val)
                                    }
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
                                    value={style.value}
                                    onChange={(e) => updateStyle(style.id, "value", e.target.value)}
                                    placeholder="Value"
                                />
                            </div>
                            <Button
                                type="button" // Prevents parent form submission
                                variant={"ghost"}
                                size={"icon"}
                                className="text-muted-foreground hover:text-destructive px-2! py-0"
                                aria-label={"Remove"}
                                onClick={() => removeStyle(style.id)}
                            >
                                <span className="sr-only">Remove</span>
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.25} />
                            </Button>
                        </div>
                    );
                })}
                <Button type="button" variant="outline" size="sm" onClick={addStyle}>
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
