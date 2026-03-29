import { cn } from "@/lib/utils";
import { memo } from "react";

function ComplexContainerR({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("flex size-full flex-col items-center justify-center", className)}>
            {children}
        </div>
    );
}

export const ComplexContainer = memo(ComplexContainerR);
ComplexContainer.displayName = "ComplexContainer";
