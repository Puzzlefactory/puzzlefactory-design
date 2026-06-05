import type {
  PfAlertStatus,
  PfAlertVariant,
  PfBadgeStatus,
  PfBadgeVariant,
  PfButtonVariant,
  PfCardVariant,
  PuzzleFactoryComponentTagName,
} from "../src/index.js";
import {
  PUZZLEFACTORY_COMPONENT_TAG_NAMES,
  PfAlertElement,
  PfBadgeElement,
  PfButtonElement,
  PfCardElement,
  definePuzzleFactoryComponents,
} from "../src/index.js";

const tagName: PuzzleFactoryComponentTagName = "pf-badge";
const buttonVariant: PfButtonVariant = "primary";
const alertStatus: PfAlertStatus = "success";
const alertVariant: PfAlertVariant = "soft";
const badgeStatus: PfBadgeStatus = "warning";
const badgeVariant: PfBadgeVariant = "solid";
const cardVariant: PfCardVariant = "raised";
const tagNames: readonly PuzzleFactoryComponentTagName[] = PUZZLEFACTORY_COMPONENT_TAG_NAMES;
const define: (registry?: CustomElementRegistry) => void = definePuzzleFactoryComponents;
const buttonConstructor: typeof PfButtonElement = PfButtonElement;
const alertConstructor: typeof PfAlertElement = PfAlertElement;
const badgeConstructor: typeof PfBadgeElement = PfBadgeElement;
const cardConstructor: typeof PfCardElement = PfCardElement;
const buttonElement = new PfButtonElement();
const alertElement = new PfAlertElement();
const badgeElement = new PfBadgeElement();
const cardElement = new PfCardElement();
const buttonDisabled: boolean = buttonElement.disabled;
const currentButtonVariant: PfButtonVariant = buttonElement.variant;
const currentAlertStatus: PfAlertStatus = alertElement.status;
const currentAlertVariant: PfAlertVariant = alertElement.variant;
const currentBadgeStatus: PfBadgeStatus = badgeElement.status;
const currentBadgeVariant: PfBadgeVariant = badgeElement.variant;
const currentCardVariant: PfCardVariant = cardElement.variant;

buttonElement.disabled = true;
buttonElement.variant = "secondary";
buttonElement.focus();
buttonElement.click();
alertElement.status = "danger";
alertElement.variant = "solid";
badgeElement.status = "info";
badgeElement.variant = "soft";
cardElement.variant = "default";

void tagName;
void buttonVariant;
void alertStatus;
void alertVariant;
void badgeStatus;
void badgeVariant;
void cardVariant;
void tagNames;
void define;
void buttonConstructor;
void alertConstructor;
void badgeConstructor;
void cardConstructor;
void buttonDisabled;
void currentButtonVariant;
void currentAlertStatus;
void currentAlertVariant;
void currentBadgeStatus;
void currentBadgeVariant;
void currentCardVariant;
