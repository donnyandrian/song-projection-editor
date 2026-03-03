import { useState, useRef, useMemo } from "react";
import { IconButton } from "@/components/core/buttons";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { useAssetStore } from "@/stores/asset.store";
import { getFileNameFromId } from "@/lib/import";

export type ApplyScope = "single" | "area" | "all";
export type AreaName = "content" | "background";

interface MediaInputProps {
    value: string;
    onChange: (val: string) => void;
    onUploadApply: (assetId: string, scope: ApplyScope) => void;
    areaName: AreaName;
    accept?: string;
    placeholder?: string;
}

export function MediaInput({
    value,
    onChange,
    onUploadApply,
    areaName,
    accept,
    placeholder,
}: MediaInputProps) {
    const assets = useAssetStore((s) => s.assets);
    const addAsset = useAssetStore((s) => s.addAsset);
    const fileRef = useRef<HTMLInputElement>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingAssetId, setPendingAssetId] = useState<string | null>(null);
    const [selectedScope, setSelectedScope] = useState<ApplyScope>("single");

    // Format stored assets as suggestions for the Combobox
    const options = useMemo(() => {
        return Object.values(assets)
            .filter((a) => {
                if (!accept) return true;
                const acceptList = accept.split(",").map((s) => s.trim().toLowerCase());
                return acceptList.some((acc) => {
                    if (acc.startsWith(".")) return a.file.name.toLowerCase().endsWith(acc);
                    if (acc.endsWith("/*")) return a.file.type.startsWith(acc.split("/")[0] + "/");
                    return a.file.type === acc;
                });
            })
            .map((a) => {
                const v = a.id;
                return { value: v, label: getFileNameFromId(v) };
            });
    }, [accept, assets]);

    const comboboxValue = useMemo(() => {
        if (!value || !(value in assets)) return null;

        const v = assets[value].id;
        return { value: v, label: getFileNameFromId(v) };
    }, [assets, value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Automatically replace if the filename is exactly the same
        const existingAsset = Object.values(assets).find((a) => a.file.name === file.name);

        if (existingAsset) {
            addAsset(file, existingAsset.id);
            onChange(existingAsset.id);
            e.target.value = "";
            return;
        }

        const id = addAsset(file);
        setPendingAssetId(id);
        setIsDialogOpen(true);

        // Reset the input so the same file can be uploaded again if needed
        e.target.value = "";
    };

    const handleApply = () => {
        if (pendingAssetId) {
            onUploadApply(pendingAssetId, selectedScope);
        }
        setIsDialogOpen(false);
        setPendingAssetId(null);
        setSelectedScope("single");
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-2">
                    <Combobox
                        items={options}
                        value={comboboxValue}
                        onValueChange={(e) => onChange(e?.value ?? "")}
                        autoHighlight
                    >
                        <ComboboxInput placeholder={placeholder} className="flex-1" showClear />
                        <ComboboxContent className="w-60">
                            <ComboboxEmpty>No match found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item) => (
                                    <ComboboxItem key={item.value} value={item}>
                                        {item.label}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    <IconButton
                        type="button"
                        icon={Upload01Icon}
                        iconStrokeWidth={2}
                        label="Upload File"
                        onClick={() => fileRef.current?.click()}
                    />
                    <input
                        type="file"
                        ref={fileRef}
                        accept={accept}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
                {accept && (
                    <span className="text-muted-foreground text-xs font-normal">
                        Supported formats: {accept}
                    </span>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]">
                    <DialogHeader>
                        <DialogTitle>Apply Uploaded File</DialogTitle>
                        <DialogDescription>
                            Where do you want to apply this newly uploaded {areaName} file?
                        </DialogDescription>
                    </DialogHeader>
                    <RadioGroup
                        value={selectedScope}
                        onValueChange={(v) => setSelectedScope(v as ApplyScope)}
                    >
                        <div className="flex items-start space-x-3 py-2">
                            <RadioGroupItem value="single" id="scope-single" />
                            <Label
                                htmlFor="scope-single"
                                className="flex cursor-pointer flex-col items-start gap-1"
                            >
                                <span>Only change this thing (Default)</span>
                                <span className="text-muted-foreground text-xs font-normal">
                                    Updates only the currently selected item's {areaName}.
                                </span>
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3 py-2">
                            <RadioGroupItem value="area" id="scope-area" />
                            <Label
                                htmlFor="scope-area"
                                className="flex cursor-pointer flex-col items-start gap-1"
                            >
                                <span>All but only in this area</span>
                                <span className="text-muted-foreground text-xs font-normal">
                                    Updates the {areaName} field for all items across your entire
                                    project to use this file.
                                </span>
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3 py-2">
                            <RadioGroupItem value="all" id="scope-all" />
                            <Label
                                htmlFor="scope-all"
                                className="flex cursor-pointer flex-col items-start gap-1"
                            >
                                <span>All (Everywhere)</span>
                                <span className="text-muted-foreground text-xs font-normal">
                                    Updates BOTH content and backgrounds everywhere to use this
                                    file.
                                </span>
                            </Label>
                        </div>
                    </RadioGroup>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Apply Selection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
