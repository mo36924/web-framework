import { customScalarTypeNames } from "./util";

export const customScalars = `
${customScalarTypeNames.map((name) => `scalar ${name}`).join("\n")}
`;
