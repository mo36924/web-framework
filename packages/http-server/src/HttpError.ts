import { OutgoingHttpHeaders, STATUS_CODES } from "http";

export type ErrorCodes = {
  400: "Bad Request";
  401: "Unauthorized";
  402: "Payment Required";
  403: "Forbidden";
  404: "Not Found";
  405: "Method Not Allowed";
  406: "Not Acceptable";
  407: "Proxy Authentication Required";
  408: "Request Timeout";
  409: "Conflict";
  410: "Gone";
  411: "Length Required";
  412: "Precondition Failed";
  413: "Payload Too Large";
  414: "URI Too Long";
  415: "Unsupported Media Type";
  416: "Range Not Satisfiable";
  417: "Expectation Failed";
  418: "I'm a Teapot";
  421: "Misdirected Request";
  422: "Unprocessable Entity";
  423: "Locked";
  424: "Failed Dependency";
  425: "Unordered Collection";
  426: "Upgrade Required";
  428: "Precondition Required";
  429: "Too Many Requests";
  431: "Request Header Fields Too Large";
  451: "Unavailable For Legal Reasons";
  500: "Internal Server Error";
  501: "Not Implemented";
  502: "Bad Gateway";
  503: "Service Unavailable";
  504: "Gateway Timeout";
  505: "HTTP Version Not Supported";
  506: "Variant Also Negotiates";
  507: "Insufficient Storage";
  508: "Loop Detected";
  509: "Bandwidth Limit Exceeded";
  510: "Not Extended";
  511: "Network Authentication Required";
};

export class HttpError extends Error {
  statusMessage: string;
  body: Buffer;

  constructor(
    public statusCode: keyof ErrorCodes = 500,
    public headers: OutgoingHttpHeaders = {},
    body?: string | Buffer | Record<string, any>,
  ) {
    super();
    this.name = "HttpError";
    this.statusMessage = STATUS_CODES[statusCode] ?? `Status Code Not Supported`;
    this.message = `${statusCode} ${this.statusMessage}`;

    if (body === undefined) {
      this.body = Buffer.from(`${this.message}`);
    } else if (typeof body === "string") {
      this.body = Buffer.from(body);
    } else if (Buffer.isBuffer(body)) {
      this.body = body;
    } else {
      this.body = Buffer.from(JSON.stringify(body));
      this.headers["content-type"] = "application/json; charset=utf-8";
    }
  }
}

export const httpError = (
  statusCode?: keyof ErrorCodes,
  headers?: OutgoingHttpHeaders,
  body?: string | Buffer | Record<string, any>,
) => {
  return new HttpError(statusCode, headers, body);
};
