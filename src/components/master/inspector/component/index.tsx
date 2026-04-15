import { SongTitleField } from "@/components/master/inspector/component/song-title";
import { SyafaatField } from "@/components/master/inspector/component/syafaat";
import { VotumField } from "@/components/master/inspector/component/votum";
import { WelcomePageField } from "@/components/master/inspector/component/welcome-page";
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

type ComponentType = "SongTitle" | "Syafaat" | "Votum" | "WelcomePage" | "Custom";

type TypeFunctionReturn<V extends boolean> = V extends true ? string : React.ReactNode;
type TypeFunction = <V extends boolean>(
    isNew: V,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any,
    setActiveType: V extends true ? undefined : (t: ComponentType) => void,
    contentChanged: (val: string) => void,
) => TypeFunctionReturn<V>;

const COMPONENT_TYPE_SELECT_OPTIONS: { key: ComponentType; value: string }[] = [
    { key: "SongTitle", value: "Song Title" },
    { key: "Syafaat", value: "Syafaat" },
    { key: "Votum", value: "Votum" },
    { key: "WelcomePage", value: "Welcome Page" },
    { key: "Custom", value: "Custom" },
];

const COMPONENT_TYPE_MAP: Record<string, TypeFunction> = {
    SongTitle: (isNew, props, setActiveType, contentChanged) => {
        if (isNew === true) {
            return JSON.stringify({
                type: "SongTitle",
                props: { title: "" },
            }) as TypeFunctionReturn<typeof isNew>;
        }

        setActiveType!("SongTitle");
        return (
            <SongTitleField contentChanged={contentChanged} {...props} />
        ) as TypeFunctionReturn<typeof isNew>;
    },
    Syafaat: (isNew, props, setActiveType, contentChanged) => {
        if (isNew === true) {
            return JSON.stringify({
                type: "Syafaat",
                props: { items: [] },
            }) as TypeFunctionReturn<typeof isNew>;
        }

        setActiveType!("Syafaat");
        return (<SyafaatField contentChanged={contentChanged} {...props} />) as TypeFunctionReturn<
            typeof isNew
        >;
    },
    Votum: (isNew, props, setActiveType, contentChanged) => {
        if (isNew === true) {
            return JSON.stringify({
                type: "Votum",
                props: {
                    title: "",
                    content: [],
                },
            }) as TypeFunctionReturn<typeof isNew>;
        }

        setActiveType!("Votum");
        return (<VotumField contentChanged={contentChanged} {...props} />) as TypeFunctionReturn<
            typeof isNew
        >;
    },
    WelcomePage: (isNew, props, setActiveType, contentChanged) => {
        if (isNew === true) {
            return JSON.stringify({
                type: "WelcomePage",
                props: {
                    baseSource: "",
                    loopSource: "",
                },
            }) as TypeFunctionReturn<typeof isNew>;
        }

        setActiveType!("WelcomePage");
        return (
            <WelcomePageField contentChanged={contentChanged} {...props} />
        ) as TypeFunctionReturn<typeof isNew>;
    },
};

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
                const { type: rdType, props: rdProps } = res.data;
                if (rdType in COMPONENT_TYPE_MAP === true) {
                    return COMPONENT_TYPE_MAP[rdType](
                        false,
                        rdProps,
                        setActiveType,
                        contentChanged,
                    );
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
        if (v in COMPONENT_TYPE_MAP === true) {
            contentChanged(COMPONENT_TYPE_MAP[v](true, undefined, undefined, contentChanged));
        } else {
            contentChanged(JSON.stringify(""));
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
                            {COMPONENT_TYPE_SELECT_OPTIONS.map((o) => (
                                <SelectItem key={o.key} value={o.key}>
                                    {o.value}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            {activeTypeComponent}
        </FieldGroup>
    );
}
