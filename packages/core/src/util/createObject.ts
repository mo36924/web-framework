import { createObjectNull } from "./createObjectNull";

export const createObject = <T extends {}>(obj?: T): T => {
  return Object.assign(createObjectNull(), obj);
};
