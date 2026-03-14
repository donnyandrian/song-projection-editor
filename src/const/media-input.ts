import type { AreaName } from "@/components/master/media-input";

const IMAGE_ACCEPT = "image/*";
const VIDEO_ACCEPT = "video/mp4, video/webm";

const BACKGROUND_ACCEPT = VIDEO_ACCEPT;
const BACKGROUND_AREANAME = "background" satisfies AreaName;

const CONTENT_AREANAME = "content" satisfies AreaName;

const COVER_AREANAME = "cover" satisfies AreaName;

export {
    IMAGE_ACCEPT,
    VIDEO_ACCEPT,
    BACKGROUND_ACCEPT,
    BACKGROUND_AREANAME,
    CONTENT_AREANAME,
    COVER_AREANAME,
};
