import * as React from "react";
import ManagerContext from "./ManagerContext";

export const useMenuManager = () => {
  const managerCtx = React.useContext(ManagerContext);
  if (!managerCtx || !managerCtx.managerRef) {
    throw new Error(
      "ManagerContext not found, must be used inside of a `<Wrapper/>` component",
    );
  }
  return managerCtx.managerRef;
};
