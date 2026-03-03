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
import {
    Add01Icon,
    Cancel01Icon,
    Copy01Icon,
    Task01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { generateId } from "@/lib/utils";
import { StyleClipboardSchema } from "@/schemas/css-styles-input";
import { IconButton } from "@/components/core/buttons";
import { ButtonGroup } from "@/components/ui/button-group";

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

    const handleCopy = async () => {
        try {
            // Only copy the essential data, stripping out the unique IDs
            const stylesToCopy = styles.map(({ property, value }) => ({
                property,
                value,
            }));
            await navigator.clipboard.writeText(JSON.stringify(stylesToCopy));
        } catch (err) {
            console.error("Failed to copy styles to clipboard: ", err);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const parsed: unknown = JSON.parse(text);

            // Validate the pasted JSON matches our expected shape
            const validatedStyles = StyleClipboardSchema.parse(parsed);

            // Generate new IDs for the pasted styles so they don't collide
            const newStyles: StyleItem[] = validatedStyles.map((style) => ({
                id: generateId(),
                property: style.property,
                value: style.value,
            }));

            // Append pasted styles to existing styles
            onChange([...styles, ...newStyles]);
        } catch (err) {
            console.error("Failed to paste styles from clipboard. Data may be invalid. ", err);
        }
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
                            <ButtonGroup className="w-full">
                                <Combobox
                                    items={CSS_PROPERTIES}
                                    value={comboboxValue}
                                    autoHighlight
                                    onValueChange={(val) =>
                                        val && updateStyle(style.id, "property", val)
                                    }
                                >
                                    <ComboboxInput placeholder="Property" className="flex-1" />
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
                                <Input
                                    value={style.value}
                                    onChange={(e) => updateStyle(style.id, "value", e.target.value)}
                                    placeholder="Value"
                                    className="flex-1"
                                />
                            </ButtonGroup>
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
                <ButtonGroup className="w-full items-center">
                    <ButtonGroup className="mr-auto">
                        <Button type="button" variant="outline" size="sm" onClick={addStyle}>
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={2.25} />
                            Add Property
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup>
                        <IconButton
                            type="button"
                            size="icon-sm"
                            label="Copy styles"
                            icon={Copy01Icon}
                            iconStrokeWidth={2}
                            onClick={handleCopy}
                        />
                        <IconButton
                            type="button"
                            size="icon-sm"
                            label="Paste styles"
                            icon={Task01Icon}
                            iconStrokeWidth={1.75}
                            onClick={handlePaste}
                        />
                    </ButtonGroup>
                </ButtonGroup>
            </div>
            <FieldDescription>
                Define custom React CSS properties for this text element. Use camelCase formatting.
            </FieldDescription>
        </Field>
    );
}
