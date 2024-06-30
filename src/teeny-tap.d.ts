declare module "teeny-tap" {
  declare function createTapListener(
    el: HTMLElement,
    callback: (e: Event) => void,
    useCapture?: boolean,
  ): {
    remove: () => void;
  };

  export = createTapListener;
}
