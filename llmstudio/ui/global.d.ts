declare namespace JSX {
    interface IntrinsicElements {
        "dotlottie-player": DotLottiePlayerAttributes;
    }
}

type DotLottieRenderer = "svg" | "canvas" | "html";
type DotLottiePlayMode = "normal" | "bounce";
type DotLottieDirection = 1 | -1;

/**
 * Attributes accepted by the <dotlottie-player> custom element.
 * See https://github.com/dotlottie/player-component for the full API.
 */
interface DotLottiePlayerAttributes {
    src?: string;
    autoplay?: boolean;
    loop?: boolean | number;
    speed?: number | string;
    background?: string;
    controls?: boolean;
    direction?: DotLottieDirection;
    mode?: DotLottiePlayMode;
    renderer?: DotLottieRenderer;
    intermission?: number;
    count?: number;
    hover?: boolean;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    "aria-label"?: string;
    "aria-hidden"?: boolean | "true" | "false";
    role?: string;
}
