declare namespace JSX {
    interface IntrinsicElements {
        "dotlottie-player": DotLottiePlayerAttributes;
    }
}

/**
 * Attributes accepted by the <dotlottie-player> custom element.
 * See https://github.com/dotlottie/player-component for the full API.
 */
interface DotLottiePlayerAttributes {
    src?: string;
    autoplay?: boolean;
    loop?: boolean;
    speed?: number | string;
    background?: string;
    controls?: boolean;
    direction?: 1 | -1;
    mode?: "normal" | "bounce";
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    "aria-label"?: string;
    "aria-hidden"?: boolean | "true" | "false";
    role?: string;
}
