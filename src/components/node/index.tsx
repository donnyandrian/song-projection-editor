import { cn } from "@/lib/utils";
import { typeNodeToColor, typeNodeToIcon } from "@/lib/node";
import { HugeiconsIcon } from "@hugeicons/react";
import type { NodeType } from "@/types/node";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

function NodeContainer({ children }: { children?: React.ReactNode }) {
    return <div className="flex h-full flex-row items-start px-4">{children}</div>;
}

interface NodeProps {
    type: NodeType;
    index: number;
    label?: string;
}
function Node(props: NodeProps) {
    const typeColor = typeNodeToColor(props.type);
    const typeIcon = typeNodeToIcon(props.type);

    return (
        <FieldLabel
            htmlFor={`content-${props.index}`}
            className="rounded-md! border-0! border-transparent bg-transparent!"
        >
            <Field orientation="horizontal" className="p-0!">
                <FieldContent>
                    <div
                        className={cn(
                            "flex w-24 shrink-0 flex-row items-center justify-start gap-1 rounded-sm border px-2 py-1 select-none md:w-32",
                            typeColor,
                            "group-has-data-[state=checked]/field-label:inset-ring-2",
                            "opacity-65 group-has-data-[state=checked]/field-label:opacity-100",
                        )}
                    >
                        <HugeiconsIcon
                            icon={typeIcon}
                            className="size-3.5 shrink-0"
                            strokeWidth={2.25}
                        />
                        <span className="truncate text-sm">{props.label || "Item"}</span>
                    </div>
                </FieldContent>
                <RadioGroupItem
                    value={props.index.toString()}
                    id={`content-${props.index}`}
                    className="sr-only"
                />
            </Field>
        </FieldLabel>
    );
}

export { Node, NodeContainer };
