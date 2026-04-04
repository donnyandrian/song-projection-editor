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
    FieldSeparator,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { exportProjections, type ExportProjectionOptions } from "@/lib/export";
import { useMasterStore } from "@/stores/master.store";
import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionMasterWithId } from "@/types";
import { useCallback, useState } from "react";
import { sourceUrl, version } from "@/data/export-version";

export type ExportDialogType = "all" | "active" | "separate";

export interface ExportConfigDialogProps {
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

type ExportConfig = Omit<ExportProjectionOptions, "separateFiles">;

const defaultExportConfig: Required<ExportConfig> = {
    minifiedMetadata: true,
    productionMode: false,
    includeSettings: true,
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

export function ExportConfigDialog({ setOpenDialog }: ExportConfigDialogProps) {
    const activeProjectionIndex = useMasterStore((s) => s.activeProjectionIndex);

    const [exportType, setExportType] = useState<ExportDialogType>("all");
    const [config, setConfig] = useState<Required<ExportConfig>>(defaultExportConfig);

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
        const projections = useProjectionStore.getState().projections;
        const { targetProjections, separateFiles } = resolveTarget(
            exportType,
            projections,
            activeProjectionIndex,
        );

        if (targetProjections.length === 0) return;

        const activeProjection = projections[activeProjectionIndex];
        await exportProjections(
            targetProjections,
            buildFilename(exportType, activeProjection?.title),
            {
                separateFiles,
                ...config,
            },
        );

        setOpenDialog(false);
    }, [activeProjectionIndex, config, exportType, setOpenDialog]);

    return (
        <DialogContent
            showCloseButton={false}
            className="flex flex-col gap-4 overflow-hidden px-0! py-6 *:px-6 max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
        >
            <DialogHeader>
                <DialogTitle>
                    Export Projections{" "}
                    <a
                        className="bg-muted text-muted-foreground hover:text-foreground inline-flex h-5.5 items-center justify-center rounded-sm px-1 font-sans text-sm font-medium no-underline!"
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {version}
                    </a>
                </DialogTitle>
                <DialogDescription>
                    Configure how your projections should be exported.
                </DialogDescription>
            </DialogHeader>

            <FieldGroup className="no-scrollbar -my-2 flex-1 overflow-y-auto py-2">
                <Field orientation="horizontal" className="items-center justify-between gap-3">
                    <FieldContent>
                        <FieldLabel>Target mode</FieldLabel>
                        <FieldDescription>Choose what should be exported.</FieldDescription>
                    </FieldContent>
                    <Select
                        value={exportType}
                        onValueChange={(v) => setExportType(v as ExportDialogType)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All - Single File</SelectItem>
                                <SelectItem value="separate">All - Separate Files</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectItem value="active" disabled={activeProjectionIndex < 0}>
                                    Active Projection
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <FieldSeparator />
                <ExportOptionField
                    id="export-include-settings"
                    checked={config.includeSettings}
                    label="Include settings.json"
                    description="Include the global app configuration along with your exported projections."
                    onCheckedChange={handleConfigChange("includeSettings")}
                />
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
                <Button onClick={() => void handleExport()}>Export</Button>
            </DialogFooter>
        </DialogContent>
    );
}
