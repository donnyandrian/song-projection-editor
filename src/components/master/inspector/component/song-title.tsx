import { TransformedInput } from "@/components/core/transformed-input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCallback } from "react";

interface SongTitleProps {
    title: string;
    author?: string;
    className?: string;
    titleClassName?: string;
    contentChanged: (val: string) => void;
}
export function SongTitleField({
    title,
    author,
    className,
    titleClassName,
    contentChanged,
}: SongTitleProps) {
    const handleUpdate = useCallback(
        (key: string, val: string) => {
            contentChanged(
                JSON.stringify({
                    type: "SongTitle",
                    props: { title, author, className, titleClassName, [key]: val },
                }),
            );
        },
        [author, className, contentChanged, title, titleClassName],
    );

    return (
        <FieldGroup>
            <Field>
                <FieldLabel>Title</FieldLabel>
                <Textarea
                    value={title ?? ""}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    placeholder="Title"
                    className="min-h-8"
                    required
                />
            </Field>
            <Field>
                <FieldLabel>Author</FieldLabel>
                <Textarea
                    value={author ?? ""}
                    onChange={(e) => handleUpdate("author", e.target.value)}
                    placeholder="Author"
                    className="min-h-8"
                />
            </Field>
            <Field>
                <FieldLabel>Title Classname</FieldLabel>
                <TransformedInput
                    value={titleClassName ?? ""}
                    onChange={(e) => handleUpdate("titleClassName", e.target.value)}
                    transformer={(val) => val.trim()}
                    placeholder="Title Classname"
                />
            </Field>
            <Field>
                <FieldLabel>Classname</FieldLabel>
                <TransformedInput
                    value={className ?? ""}
                    onChange={(e) => handleUpdate("className", e.target.value)}
                    transformer={(val) => val.trim()}
                    placeholder="Classname"
                />
            </Field>
        </FieldGroup>
    );
}
