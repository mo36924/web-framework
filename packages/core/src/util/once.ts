export const once = <T>(fn: () => T) => {
  let init = true;
  let result: T;

  return () => {
    if (init) {
      init = false;
      result = fn();
    }

    return result;
  };
};
