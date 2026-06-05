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

void tagName;
void buttonVariant;
void alertStatus;
void alertVariant;
void tagNames;
void define;
void buttonConstructor;
void alertConstructor;
