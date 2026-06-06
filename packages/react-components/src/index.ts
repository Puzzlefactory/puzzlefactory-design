import {
  definePuzzleFactoryComponents,
  type PfAlertElement,
  type PfAlertStatus,
  type PfAlertVariant,
  type PfBadgeElement,
  type PfBadgeStatus,
  type PfBadgeVariant,
  type PfButtonElement,
  type PfButtonVariant,
  type PfCardElement,
  type PfCardVariant,
} from "@puzzlefactory/components";
import { createElement, forwardRef } from "react";
import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";

definePuzzleFactoryComponents();

export type {
  PfAlertElement,
  PfAlertStatus,
  PfAlertVariant,
  PfBadgeElement,
  PfBadgeStatus,
  PfBadgeVariant,
  PfButtonElement,
  PfButtonVariant,
  PfCardElement,
  PfCardVariant,
};

export { definePuzzleFactoryComponents as definePuzzleFactoryReactComponents };

type CustomElementProps<
  Element extends HTMLElement,
  OmittedKeys extends keyof HTMLAttributes<Element> = never,
> = Omit<HTMLAttributes<Element>, "children" | "className" | "style" | OmittedKeys> & {
  children?: ReactNode;
  className?: string;
  ref?: ForwardedRef<Element>;
  style?: CSSProperties;
};

export type PfButtonProps = CustomElementProps<PfButtonElement> & {
  disabled?: boolean;
  variant?: PfButtonVariant;
};

export type PfAlertProps = CustomElementProps<PfAlertElement, "title"> & {
  status?: PfAlertStatus;
  title?: ReactNode;
  variant?: PfAlertVariant;
};

export type PfBadgeProps = CustomElementProps<PfBadgeElement> & {
  status?: PfBadgeStatus;
  variant?: PfBadgeVariant;
};

export type PfCardProps = CustomElementProps<PfCardElement, "title"> & {
  eyebrow?: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
  variant?: PfCardVariant;
};

export const PfButton = forwardRef<PfButtonElement, PfButtonProps>(function PfButton(
  { children, disabled, variant = "primary", ...props },
  ref,
): ReactElement {
  const elementProps: PfButtonProps = { ...props, ref };

  if (disabled) {
    elementProps.disabled = true;
  }

  if (variant === "secondary") {
    elementProps.variant = variant;
  }

  return createElement("pf-button", elementProps, children);
});

PfButton.displayName = "PfButton";

export const PfAlert = forwardRef<PfAlertElement, PfAlertProps>(function PfAlert(
  { children, status = "info", title, variant = "soft", ...props },
  ref,
): ReactElement {
  const elementProps: PfAlertProps = { ...props, ref };
  const slottedTitle = createNamedSlot("title", title);

  if (status !== "info") {
    elementProps.status = status;
  }

  if (variant === "solid") {
    elementProps.variant = variant;
  }

  return createElement("pf-alert", elementProps, slottedTitle, children);
});

PfAlert.displayName = "PfAlert";

export const PfBadge = forwardRef<PfBadgeElement, PfBadgeProps>(function PfBadge(
  { children, status = "info", variant = "soft", ...props },
  ref,
): ReactElement {
  const elementProps: PfBadgeProps = { ...props, ref };

  if (status !== "info") {
    elementProps.status = status;
  }

  if (variant === "solid") {
    elementProps.variant = variant;
  }

  return createElement("pf-badge", elementProps, children);
});

PfBadge.displayName = "PfBadge";

export const PfCard = forwardRef<PfCardElement, PfCardProps>(function PfCard(
  { children, eyebrow, footer, title, variant = "default", ...props },
  ref,
): ReactElement {
  const elementProps: PfCardProps = { ...props, ref };

  if (variant === "raised") {
    elementProps.variant = variant;
  }

  return createElement(
    "pf-card",
    elementProps,
    createNamedSlot("eyebrow", eyebrow),
    createNamedSlot("title", title),
    children,
    createNamedSlot("footer", footer),
  );
});

PfCard.displayName = "PfCard";

function createNamedSlot(name: string, children: ReactNode): ReactElement | null {
  if (children === undefined || children === null || children === false) {
    return null;
  }

  return createElement("span", { slot: name }, children);
}
