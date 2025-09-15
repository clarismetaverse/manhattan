import React from "react";

/**
 * CardNotchButton
 * A composite card surface with a concave notch that docks a primary action button.
 *
 * Props:
 * notch: "left" | "center" | "right" (default: "left")
 * label: string (button label)
 * onClick: () => void
 * className: string (extra classes for the outer card)
 * gradient: [from, to] tailwind color tokens (default: ["from-fuchsia-500","to-blue-600"])
 * buttonSize: "sm" | "md" | "lg" (default: "md")
 */
export const CardNotchButton = ({
  notch = "left",
  label = "Hire",
  onClick,
  className = "",
  gradient = ["from-fuchsia-500", "to-blue-600"],
  buttonSize = "md",
  children,
  fill = "fill-black",
}: React.PropsWithChildren<{
  notch?: "left" | "center" | "right";
  label?: string;
  onClick?: () => void;
  className?: string;
  gradient?: [string, string];
  buttonSize?: "sm" | "md" | "lg";
  fill?: string;
}>) => {
  // Button sizing
  const size =
    buttonSize === "sm"
      ? "px-4 py-1.5 text-sm rounded-2xl"
      : buttonSize === "lg"
      ? "px-6 py-3 text-base rounded-3xl"
      : "px-5 py-2 text-sm rounded-3xl"; // md

  // Horizontal position for the docked button
  const btnX =
    notch === "center"
      ? "left-1/2 -translate-x-1/2"
      : notch === "right"
      ? "right-4"
      : "left-4";

  // SVG path generator for the notch shape
  // Card viewBox is 1000x600 for precision; we map via preserveAspectRatio="none".
  const pathD = (() => {
    if (notch === "center") {
      return "M0 0 H1000 V600 H530 C470 600 430 560 380 540 C330 520 300 560 250 580 H0 Z";
    }
    if (notch === "right") {
      return "M0 0 H1000 V600 H860 C800 600 770 560 740 540 C710 520 680 560 620 580 H0 Z";
    }
    // left (default)
    return "M0 0 H1000 V600 H240 C180 600 150 560 120 540 C90 520 60 560 0 580 Z";
  })();

  return (
    <div className={"relative overflow-hidden rounded-2xl " + className}>
      {/* SVG background with a soft, concave notch near the button */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <path d={pathD} className={fill} />
      </svg>

      {/* Content area */}
      <div className="relative p-6 pb-20">{children}</div>

      {/* Docked primary action button */}
      <div className={`absolute bottom-4 ${btnX}`}>
        <button
          onClick={onClick}
          className={`bg-gradient-to-r ${gradient[0]} ${gradient[1]} font-semibold shadow-inner shadow-black/40 hover:brightness-110 active:brightness-95 transition ${size}`}
        >
          {label}
        </button>
        {/* subtle wave shadow under the button to accent the notch */}
        <div
          className="pointer-events-none absolute -bottom-2 left-2 right-2 h-3 rounded-full blur-[1px]"
          style={{
            background:
              "radial-gradient(60px 10px at 30% 50%, rgba(46,46,56,.8), transparent 60%), radial-gradient(60px 10px at 70% 50%, rgba(46,46,56,.8), transparent 60%)",
          }}
        />
      </div>
    </div>
  );
};

