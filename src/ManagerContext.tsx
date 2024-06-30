import * as React from "react";
import type { Manager } from "./types";

type ManagerContext = {
  managerRef: React.RefObject<Manager>;
};

const AriaMenuButtonManagerContext = React.createContext<null | ManagerContext>(
  null,
);

export default AriaMenuButtonManagerContext;
