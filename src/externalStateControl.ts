import type { Manager, OpenOptions, CloseOptions } from "./types";
const registeredManagers: Record<string, Manager> = {};

const errorCommon =
  "a menu outside a mounted Wrapper with an id, or a menu that does not exist";

export function registerManager(menuId: string, manager: Manager) {
  registeredManagers[menuId] = manager;
}

export function unregisterManager(menuId: string) {
  delete registeredManagers[menuId];
}

export function openMenu(menuId: string, openOptions: OpenOptions) {
  const manager = registeredManagers[menuId];
  if (!manager) throw new Error("Cannot open " + errorCommon);

  manager.openMenu(openOptions);
}

export function closeMenu(menuId: string, closeOptions: CloseOptions) {
  const manager = registeredManagers[menuId];
  if (!manager) throw new Error("Cannot close " + errorCommon);
  manager.closeMenu(closeOptions);
}
