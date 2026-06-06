import { createElement, createRef } from "react";
import type { ReactElement } from "react";
import type {
  PfAlertElement,
  PfAlertProps,
  PfBadgeElement,
  PfBadgeProps,
  PfButtonElement,
  PfButtonProps,
  PfCardElement,
  PfCardProps,
} from "../src/index.js";
import {
  PfAlert,
  PfBadge,
  PfButton,
  PfCard,
  definePuzzleFactoryReactComponents,
} from "../src/index.js";

const buttonRef = createRef<PfButtonElement>();
const alertRef = createRef<PfAlertElement>();
const badgeRef = createRef<PfBadgeElement>();
const cardRef = createRef<PfCardElement>();

const buttonProps: PfButtonProps = {
  children: "Save",
  className: "example-button",
  disabled: true,
  onClick(event) {
    const variant = event.currentTarget.variant;
    void variant;
  },
  ref: buttonRef,
  style: { margin: 0 },
  variant: "secondary",
};

const alertProps: PfAlertProps = {
  children: "Saved successfully.",
  ref: alertRef,
  status: "success",
  title: "Saved",
  variant: "soft",
};

const badgeProps: PfBadgeProps = {
  children: "Pending",
  ref: badgeRef,
  status: "warning",
  variant: "solid",
};

const cardProps: PfCardProps = {
  children: "Card body",
  eyebrow: "Surface",
  footer: "Semantic variables only",
  ref: cardRef,
  title: "Card title",
  variant: "raised",
};

const buttonElement: ReactElement = createElement(PfButton, buttonProps);
const alertElement: ReactElement = createElement(PfAlert, alertProps);
const badgeElement: ReactElement = createElement(PfBadge, badgeProps);
const cardElement: ReactElement = createElement(PfCard, cardProps);
const define: (registry?: CustomElementRegistry) => void = definePuzzleFactoryReactComponents;

void buttonElement;
void alertElement;
void badgeElement;
void cardElement;
void define;
