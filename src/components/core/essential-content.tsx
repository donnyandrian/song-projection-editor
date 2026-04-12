import { cn } from "@/lib/utils";
import { memo } from "react";

interface EssentialContentProps {
    children: React.ReactNode;
    className?: string;
}
function EssentialContentR({ children, className }: EssentialContentProps) {
    return (
        <div className={cn("flex size-full flex-col items-center justify-center px-27", className)}>
            {children}
        </div>
    );
}

export const EssentialContent = memo(EssentialContentR);
EssentialContent.displayName = "EssentialContent";
