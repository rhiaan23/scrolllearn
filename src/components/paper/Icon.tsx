import type { SVGProps } from "react";

type IconName =
  | "help"
  | "sparkle"
  | "close"
  | "reset"
  | "check"
  | "cross"
  | "chevron-right";

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };

  switch (name) {
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.2 1-1.2 1.9v.3" />
          <path d="M12 17.2v.01" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="M6 6l2 2" />
          <path d="M16 16l2 2" />
          <path d="M6 18l2-2" />
          <path d="M16 8l2-2" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      );
    case "reset":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12l4 4L19 7" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9l6 6" />
          <path d="M15 9l-6 6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
  }
}
