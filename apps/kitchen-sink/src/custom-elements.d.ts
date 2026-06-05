import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CustomElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "pf-alert": CustomElementProps & {
        status?: "danger" | "warning" | "success" | "info";
        variant?: "soft" | "solid";
      };
      "pf-button": CustomElementProps & {
        disabled?: boolean;
        variant?: "primary" | "secondary";
      };
    }
  }
}
