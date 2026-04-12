import { TransformedInput } from "@/components/core/transformed-input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Add01Icon, Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback } from "react";

interface VotumProps {
    title: string;
    content: { key: string; value: string }[];
    contentChanged: (val: string) => void;
}
export function VotumField({ title, content, contentChanged }: VotumProps) {
    const handleUpdate = useCallback(
        (key: string, val: unknown) => {
            contentChanged(
                JSON.stringify({
                    type: "Votum",
                    props: { title, content, [key]: val },
                }),
            );
        },
        [content, contentChanged, title],
    );

    const addItem = useCallback(() => {
        handleUpdate("content", [...content, { key: "", value: "" }]);
    }, [content, handleUpdate]);

    const updateItem = useCallback(
        (index: number) => (key: string, val: string) => {
            handleUpdate("content", [
                ...content.slice(0, index),
                { key, value: val },
                ...content.slice(index + 1),
            ]);
        },
        [content, handleUpdate],
    );

    const removeItem = useCallback(
        (index: number) => () => {
            handleUpdate("content", [...content.slice(0, index), ...content.slice(index + 1)]);
        },
        [content, handleUpdate],
    );

    return (
        <FieldGroup>
            <Field>
                <FieldLabel>Title</FieldLabel>
                <TransformedInput
                    value={title ?? ""}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    transformer={(val) => val.trim()}
                    placeholder="Title"
                    required
                />
            </Field>
            <Field>
                <FieldLabel>Votum Content</FieldLabel>
                <div className="flex flex-col gap-2">
                    {content?.map(({ key, value }, i) => (
                        <div key={i} className="flex items-center gap-2 last-of-type:mb-2">
                            <ButtonGroup className="w-full">
                                <TransformedInput
                                    value={key ?? ""}
                                    onChange={(e) => updateItem(i)(e.target.value, value ?? "")}
                                    transformer={(val) => val.trim()}
                                    placeholder="Key"
                                    className="grow-0! basis-16!"
                                    required
                                />
                                <TransformedInput
                                    value={value ?? ""}
                                    onChange={(e) => updateItem(i)(key ?? "", e.target.value)}
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
