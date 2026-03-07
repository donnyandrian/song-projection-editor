import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useShortcut } from "@/hooks/use-shortcuts";
import type { Accelerator } from "@/types";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { memo } from "react";

interface BaseIconButtonProps {
    label: string;
    icon: IconSvgElement;
    iconStrokeWidth?: number;
    iconClassName?: string;
    text?: string;
    textClassName?: string;
    accelerator?: Accelerator;
}

interface IconButtonProps extends BaseIconButtonProps {
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
    size?: React.ComponentProps<typeof Button>["size"];
    onClick?: () => void;
}
export const IconButton = memo(function IconButton({
    type,
    size,
    label,
    icon,
    iconStrokeWidth,
    iconClassName,
    text,
    textClassName,
    onClick,
    accelerator,
}: IconButtonProps) {
    useShortcut(accelerator, onClick);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type={type}
                    variant={"outline"}
                    size={size ?? (text ? "default" : "icon")}
                    className="px-2! py-0"
                    aria-label={label}
                    onClick={onClick}
                >
                    <HugeiconsIcon icon={icon} strokeWidth={iconStrokeWidth ?? 2} className={iconClassName} />
                    {text && <span className={textClassName}>{text}</span>}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    {label}
                    {accelerator && (
                        <KbdGroup>
                            {accelerator.shift && <Kbd>Shift</Kbd>}
                            {accelerator.meta && <Kbd>Meta</Kbd>}
                            {accelerator.alt && <Kbd>Alt</Kbd>}
                            {accelerator.ctrl && <Kbd>Ctrl</Kbd>}
                            <Kbd>{accelerator.key}</Kbd>
                        </KbdGroup>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
});

interface IconDropdownButtonProps extends Omit<
    IconButtonProps,
    "accelerator" | "text" | "textClassName" | "onClick"
> {
    children?: React.ReactNode;
}
export const IconDropdownButton = memo(function IconDropdownButton({
    type,
    size,
    label,
    icon,
    iconStrokeWidth,
    iconClassName,
    children,
}: IconDropdownButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div>
                    <IconButton
                        type={type}
                        size={size}
                        label={label}
                        icon={icon}
                        iconStrokeWidth={iconStrokeWidth ?? 2}
                        iconClassName={iconClassName}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

export const IconDropdownMenuItem = memo(function IconDropdownMenuItem({
    label,
    icon,
    iconStrokeWidth,
    text,
    textClassName,
    onClick,
    onSelect,
    accelerator,
}: IconButtonProps & { onSelect?: () => void }) {
    return (
        <DropdownMenuItem aria-label={label} onClick={onClick} onSelect={onSelect}>
            <HugeiconsIcon
                icon={icon}
                strokeWidth={iconStrokeWidth ?? 2}
                className="text-foreground"
            />
            <span className={textClassName}>{text}</span>

            {accelerator && (
                <DropdownMenuShortcut>
                    <KbdGroup>
                        {accelerator.shift && <Kbd>Shift</Kbd>}
                        {accelerator.meta && <Kbd>Meta</Kbd>}
                        {accelerator.alt && <Kbd>Alt</Kbd>}
                        {accelerator.ctrl && <Kbd>Ctrl</Kbd>}
                        <Kbd>{accelerator.key}</Kbd>
                    </KbdGroup>
                </DropdownMenuShortcut>
            )}
        </DropdownMenuItem>
    );
});
