import { useResolveAsset } from "@/hooks/use-resolve-asset";
import { cn } from "@/lib/utils";
import { memo, type DetailedHTMLProps } from "react";

type VideoPlayerProps = DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
>;

const VideoPlayer = memo(function VideoPlayer({ className, src, ...props }: VideoPlayerProps) {
    const resolvedSrc = useResolveAsset(src);

    return <video {...props} src={resolvedSrc} className={cn("size-full", className)} />;
});
export { VideoPlayer };
