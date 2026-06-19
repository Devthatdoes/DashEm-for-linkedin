import { human } from "./human";
import { linkedin } from "./linkedin";
import { lexical } from "./lexical";
import { structural } from "./structural";
import { typography } from "./typography";
import type { SignalFn } from "../types";

/** Every signal module the scorer runs. Add a new family here to wire it in. */
export const SIGNALS: SignalFn[] = [typography, lexical, structural, linkedin, human];
