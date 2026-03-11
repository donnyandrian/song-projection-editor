import { Button } from "@/components/ui/button";
import { Checkbox } from "../../ui/checkbox";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { exportProjections, type ExportProjectionOptions } from "@/lib/export";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionMasterWithId } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ExportDialogType = "all" | "active" | "separate";

export interface ExportConfigDialogProps {
    type: ExportDialogType;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

type ExportConfig = Omit<ExportProjectionOptions, "separateFiles">;

const defaultExportConfig: Required<ExportConfig> = {
    minifiedMetadata: false,
    productionMode: false,
};

interface ExportOptionFieldProps {
    id: string;
    checked: boolean;
    label: string;
    description?: string;
    onCheckedChange: (checked: boolean) => void;
}

type LocalCheckedState = boolean | "indeterminate";

function checkboxStateToBoolean(checked: LocalCheckedState): boolean {
    return checked === true;
}

function ExportOptionField({
    id,
    checked,
    label,
    description,
    onCheckedChange,
}: ExportOptionFieldProps) {
    const handleCheckedChange = useCallback(
        (nextChecked: LocalCheckedState) => {
            onCheckedChange(checkboxStateToBoolean(nextChecked));
        },
        [onCheckedChange],
    );

    return (
        <Field orientation="horizontal" className="items-start gap-3">
            <Checkbox id={id} checked={checked} onCheckedChange={handleCheckedChange} />
            <FieldContent>
                <FieldLabel asChild>
                    <Label htmlFor={id}>{label}</Label>
                </FieldLabel>
                {description && <FieldDescription>{description}</FieldDescription>}
            </FieldContent>
        </Field>
    );
}

function getDialogMeta(type: ExportDialogType): {
    title: string;
    description: string;
    submitLabel: string;
} {
    switch (type) {
        case "active":
            return {
                title: "Export Active Projection",
                description: "Configure how the active projection should be exported.",
                submitLabel: "Export Active",
            };
        case "separate":
            return {
                title: "Export Separate Files",
                description:
                    "Configure how all projections should be exported as separate JSON files in a ZIP archive.",
                submitLabel: "Export Separate",
            };
        case "all":
        default:
            return {
                title: "Export All",
                description:
                    "Configure how all projections should be exported into a single ZIP archive.",
                submitLabel: "Export All",
            };
    }
}

function buildFilename(type: ExportDialogType, activeTitle?: string): string {
    switch (type) {
        case "active": {
            const safeTitle = (activeTitle ?? "projection")
                .replace(/[^a-z0-9]/gi, "_")
                .toLowerCase();
            return `projection-${safeTitle}.zip`;
        }
        case "separate":
            return "projections-separate.zip";
        case "all":
        default:
            return "projections-all.zip";
    }
}

function resolveTarget(
    type: ExportDialogType,
    projections: ProjectionMasterWithId[],
    activeIndex: number,
) {
    let targetProjections: ProjectionMasterWithId[] = projections;
    let separateFiles = false;

    switch (type) {
        case "active": {
            const activeProjection = projections[activeIndex];
            targetProjections = activeProjection ? [activeProjection] : [];
            break;
        }
        case "separate":
            separateFiles = true;
            break;
        case "all":
        default:
            break;
    }

    return { targetProjections, separateFiles };
}

export function ExportConfigDialog({ type, setOpenDialog }: ExportConfigDialogProps) {
    const projections = useProjectionStore((s) => s.projections);
    const activeProjectionIndex = useMasterStore((s) => s.activeProjectionIndex);

    const [config, setConfig] = useState<Required<ExportConfig>>(defaultExportConfig);

    const activeProjection = projections[activeProjectionIndex];
    const dialogMeta = useMemo(() => getDialogMeta(type), [type]);

    useEffect(() => {
        setConfig(defaultExportConfig);
    }, [type]);

    const handleConfigChange = useCallback(
        <K extends keyof ExportConfig>(key: K) =>
            (value: ExportConfig[K]) => {
                setConfig((prev) => ({
                    ...prev,
                    [key]: value,
                }));
            },
        [],
    );

    const handleExport = useCallback(async () => {
        const { targetProjections, separateFiles } = resolveTarget(
            type,
            projections,
            activeProjectionIndex,
        );

        if (targetProjections.length === 0) return;

        await exportProjections(targetProjections, buildFilename(type, activeProjection?.title), {
            separateFiles,
            ...config,
        });

        setOpenDialog(false);
    }, [activeProjection, activeProjectionIndex, config, projections, setOpenDialog, type]);

    return (
        <DialogContent
            showCloseButton={false}
            className="flex flex-col gap-4 overflow-hidden px-0! py-6 *:px-6 max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
        >
            <DialogHeader>
                <DialogTitle>{dialogMeta.title}</DialogTitle>
                <DialogDescription>{dialogMeta.description}</DialogDescription>
            </DialogHeader>

            <FieldGroup className="no-scrollbar -my-2 flex-1 overflow-y-auto py-2">
                <ExportOptionField
                    id="export-minified-metadata"
                    checked={config.minifiedMetadata}
                    label="Minified metadata"
                    description="Reduce metadata formatting in the exported file to keep the package leaner."
                    onCheckedChange={handleConfigChange("minifiedMetadata")}
                />
                <ExportOptionField
                    id="export-production-mode"
                    checked={config.productionMode}
                    label="Production mode"
                    description="Recommended only for the final version when no more editing is needed. Editing the exported file later is still possible, but it may result in unexpected behavior. If you still need to edit it, keep this unchecked."
                    onCheckedChange={handleConfigChange("productionMode")}
                />
            </FieldGroup>

            <DialogFooter className="-mb-6">
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={() => void handleExport()}>{dialogMeta.submitLabel}</Button>
            </DialogFooter>
        </DialogContent>
    );
}
