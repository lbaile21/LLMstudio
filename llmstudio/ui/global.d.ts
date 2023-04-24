declare namespace JSX {
    interface IntrinsicElements {
        "dotlottie-player": DotLottiePlayerAttributes;
    }
}

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
}
