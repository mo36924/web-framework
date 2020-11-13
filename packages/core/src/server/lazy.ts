import { ComponentType, createElement } from "preact";

export const lazy = <T>(
  loader: () => Promise<{ default: ComponentType<T> }>,
): ComponentType<T> & { load: () => Promise<any> } => {
  let promise: any;
  let component: any;
  let error: any;

  const load = () => {
    if (!promise) {
      promise = loader();

      promise.then(
        (exports: any) => {
          component = exports.default;
        },
        (err: any) => {
          error = err;
        },
      );
    }

    return promise;
  };

  const Lazy = (props: any) => {
    load();

    if (error) {
      throw error;
    }

    if (!component) {
      throw promise;
    }

    return createElement(component, props);
  };

  Lazy.load = load;
  return Lazy;
};
