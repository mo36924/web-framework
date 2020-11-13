const basePrefix = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const basePrefixLength = basePrefix.length;
const baseName = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
const baseNameLength = baseName.length;

export const createClassName = (i: number) => {
  let result = basePrefix[i % basePrefixLength];
  i = Math.floor(i / basePrefixLength);

  while (i > 0) {
    result += baseName[i % baseNameLength];
    i = Math.floor(i / baseNameLength);
  }

  return result;
};
