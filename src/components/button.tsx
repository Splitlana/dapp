import { classed } from "@tw-classed/react";

const Button = classed(
  "button",
  "rounded-sm",
  "px-10 py-3",
  "font-semibold text-white",
  "no-underline transition",
  {
    variants: {
      color: {
        primary: "bg-purple hover:bg-purple",
        secondary: "bg-white hover:bg-white/0",
      },
      disabled: {
        true: "!bg-purple/30 pointer-events-none",
        false: "",
      },
    },
    compoundVariants: [
      {
        color: "secondary",
        class: "",
      },
      {
        color: "secondary",
        class: "text-black",
      },
    ],
    defaultVariants: {
      color: "primary",
      disabled: false,
    },
  }
);

export default Button;
