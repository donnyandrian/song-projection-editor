import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useCallback } from "react";
import { VIDEO_ACCEPT, WELCOME_PAGE_AREANAME } from "@/const/media-input";
import { MediaInput } from "@/components/master/media-input";

interface WelcomePageProps {
    baseSource: string;
    loopSource: string;
    contentChanged: (val: string) => void;
}
export function WelcomePageField({ baseSource, loopSource, contentChanged }: WelcomePageProps) {
    const handleUpdate = useCallback(
        (key: string, val: string) => {
            contentChanged(
                JSON.stringify({
                    type: "WelcomePage",
                    props: { baseSource, loopSource, [key]: val },
                }),
            );
        },
        [baseSource, contentChanged, loopSource],
    );

    return (
        <FieldGroup>
            <Field>
                <FieldLabel>Base Source</FieldLabel>
                <MediaInput
                    value={baseSource ?? ""}
                    onChange={(val) => handleUpdate("baseSource", val)}
                    areaName={WELCOME_PAGE_AREANAME}
                    accept={VIDEO_ACCEPT}
                    placeholder="Filename, URL, or Select Upload"
                />
            </Field>
            <Field>
                <FieldLabel>Loop Source</FieldLabel>
                <MediaInput
                    value={loopSource ?? ""}
                    onChange={(val) => handleUpdate("loopSource", val)}
                    areaName={WELCOME_PAGE_AREANAME}
                    accept={VIDEO_ACCEPT}
                    placeholder="Filename, URL, or Select Upload"
                />
            </Field>
        </FieldGroup>
    );
}
