import { IncomingMessage } from "http";
import { parse as parseQuery, ParsedUrlQuery } from "querystring";
import { parse as parseUrl, UrlWithStringQuery } from "url";

export class Request extends IncomingMessage {
  get protocol() {
    return this.headers["x-forwarded-proto"] === "https" ? "https:" : "http:";
  }
  get hostname() {
    return this.headers.host ?? "localhost";
  }
  get port() {
    return "";
  }
  get host() {
    return this.port === "" ? this.hostname : `${this.hostname}:${this.port}`;
  }
  get path() {
    return this.url ?? "/";
  }
  get href() {
    return `${this.protocol}//${this.host}${this.path}`;
  }
  private __url?: UrlWithStringQuery;
  private get _url() {
    return (this.__url ??= parseUrl(this.path));
  }
  get pathname() {
    return this._url.pathname ?? "/";
  }
  get query() {
    return this._url.query ?? "";
  }
  get search() {
    return this._url.search ?? "";
  }
  private _params?: ParsedUrlQuery;
  get params() {
    return (this._params ??= parseQuery(this.query));
  }
  private _searchParams?: URLSearchParams;
  get searchParams() {
    return (this._searchParams ||= new URLSearchParams(this.query));
  }
}
