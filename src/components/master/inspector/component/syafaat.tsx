import { TransformedInput } from "@/components/core/transformed-input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Add01Icon, Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback } from "react";

interface SyafaatProps {
    items: string[];
    contentChanged: (val: string) => void;
}
export function SyafaatField({ items, contentChanged }: SyafaatProps) {
    const handleUpdate = useCallback(
        (key: string, val: unknown) => {
            contentChanged(
                JSON.stringify({
                    type: "Syafaat",
                    props: { items, [key]: val },
                }),
            );
        },
        [contentChanged, items],
    );

    const addItem = useCallback(() => {
        handleUpdate("items", [...items, ""]);
    }, [handleUpdate, items]);

    const updateItem = useCallback(
        (index: number) => (val: string) => {
            handleUpdate("items", [...items.slice(0, index), val, ...items.slice(index + 1)]);
        },
        [handleUpdate, items],
    );

    const removeItem = useCallback(
        (index: number) => () => {
            handleUpdate("items", [...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [handleUpdate, items],
    );

    return (
        <FieldGroup>
            <Field>
                <FieldLabel>Syafaat Content</FieldLabel>
                <div className="flex flex-col gap-2">
                    {items?.map((value, i) => (
                        <div key={i} className="flex items-center gap-2 last-of-type:mb-2">
                            <ButtonGroup className="w-full">
                                <TransformedInput
                                    value={value ?? ""}
                                    onChange={(e) => updateItem(i)(e.target.value)}
                                    transformer={(val) => val.trim()}
                                    placeholder="Value"
                                    required
                                />
                            </ButtonGroup>
                            <Button
                                type="button" // Prevents parent form submission
                                variant={"ghost"}
                                size={"icon"}
                                className="text-muted-foreground hover:text-destructive px-2! py-0"
                                aria-label={"Remove"}
                                onClick={removeItem(i)}
                            >
                                <span className="sr-only">Remove</span>
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.25} />
                            </Button>
                        </div>
                    ))}
                    <ButtonGroup className="w-full">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={addItem}
                        >
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={2.25} />
                            Add Item
                        </Button>
                    </ButtonGroup>
                </div>
            </Field>
        </FieldGroup>
    );
}
