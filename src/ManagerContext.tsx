import * as React from "react";
import type { Manager } from "./types";
const AriaMenuButtonManagerContext =
  React.createContext<null | React.RefObject<Manager>>(null);

export default AriaMenuButtonManagerContext;
