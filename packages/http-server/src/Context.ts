import type { Request } from "./Request";
import type { Response } from "./Response";

export class Context {
  constructor(public request: Request, public response: Response) {}
}
