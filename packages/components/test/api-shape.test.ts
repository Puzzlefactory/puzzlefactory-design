import type {
  PfAlertStatus,
  PfAlertVariant,
  PfButtonVariant,
  PuzzleFactoryComponentTagName,
} from "../src/index.js";
import {
  PUZZLEFACTORY_COMPONENT_TAG_NAMES,
  PfAlertElement,
  PfButtonElement,
  definePuzzleFactoryComponents,
} from "../src/index.js";

const tagName: PuzzleFactoryComponentTagName = "pf-button";
const buttonVariant: PfButtonVariant = "primary";
const alertStatus: PfAlertStatus = "success";
const alertVariant: PfAlertVariant = "soft";
const tagNames: readonly PuzzleFactoryComponentTagName[] = PUZZLEFACTORY_COMPONENT_TAG_NAMES;
const define: (registry?: CustomElementRegistry) => void = definePuzzleFactoryComponents;
const buttonConstructor: typeof PfButtonElement = PfButtonElement;
const alertConstructor: typeof PfAlertElement = PfAlertElement;
const buttonElement = new PfButtonElement();
const alertElement = new PfAlertElement();
const buttonDisabled: boolean = buttonElement.disabled;
const currentButtonVariant: PfButtonVariant = buttonElement.variant;
const currentAlertStatus: PfAlertStatus = alertElement.status;
const currentAlertVariant: PfAlertVariant = alertElement.variant;

buttonElement.disabled = true;
buttonElement.variant = "secondary";
buttonElement.focus();
buttonElement.click();
alertElement.status = "danger";
alertElement.variant = "solid";

void tagName;
void buttonVariant;
void alertStatus;
void alertVariant;
void tagNames;
void define;
void buttonConstructor;
void alertConstructor;
void buttonDisabled;
void currentButtonVariant;
void currentAlertStatus;
void currentAlertVariant;
