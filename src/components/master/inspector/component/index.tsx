import { SongTitleField } from "@/components/master/inspector/component/song-title";
import { Field, FieldGroup } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AllowedComponentSchemas } from "@/schemas/converter";
import { useMemo, useState } from "react";

type ComponentType = "SongTitle" | "Custom";

interface SwitcherProps {
    content: string;
    contentChanged: (val: string) => void;
}
export function Switcher({ content, contentChanged }: SwitcherProps) {
    const [activeType, setActiveType] = useState<ComponentType>("SongTitle");

    const activeTypeComponent = useMemo(() => {
        try {
            const p = JSON.parse(content);
            const res = AllowedComponentSchemas().safeParse(p);
            if (!res.success) throw res.error;

            if (typeof res.data !== "string") {
                switch (res.data.type) {
                    case "SongTitle": {
                        setActiveType("SongTitle");
                        return (
                            <SongTitleField contentChanged={contentChanged} {...res.data.props} />
                        );
                    }
                }
            }

            return (
                <Textarea
                    value={content}
                    onChange={(e) => contentChanged(e.target.value)}
                    placeholder="Enter component JSON..."
                    className="min-h-25"
                />
            );
        } catch (e) {
            console.error("Invalid JSON or Schema mismatch. Error: ", e);
            return (
                <Textarea
                    value={content}
                    onChange={(e) => contentChanged(e.target.value)}
                    placeholder="Enter component JSON..."
                    className="min-h-25"
                />
            );
        }
    }, [content, contentChanged]);

    const selectChanged = (v: ComponentType) => {
        setActiveType(v);
        switch (v) {
            case "SongTitle": {
                contentChanged(JSON.stringify({ type: "SongTitle", props: { title: "" } }));
                break;
            }
            default: {
                contentChanged(JSON.stringify(""));
                break;
            }
        }
    };

    return (
        <FieldGroup>
            <Field>
                <Select
                    value={activeType}
                    onValueChange={(_v) => selectChanged(_v as ComponentType)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="SongTitle">Song Title</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            {activeTypeComponent}
        </FieldGroup>
    );
}
