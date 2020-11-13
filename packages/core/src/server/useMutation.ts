import type { UseMutation } from "../type";

export const useMutation: UseMutation = (args: any) => {
  throw new Error("Not support ssr useMutation");
};
