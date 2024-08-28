import { AxiosRequestConfig } from "axios";
export class AxiosToCurl {
  private config: AxiosRequestConfig;

  constructor(config: AxiosRequestConfig) {
    this.config = config;
  }

  getHeaders() {
    let headers = this.config.headers,
      curlHeaders = "";

    if (!headers || !this.config.headers) return "";

    // get the headers concerning the appropriate method (defined in the global axios instance)
    // eslint-disable-next-line no-prototype-builtins
    if (headers.hasOwnProperty("common")) {
      headers = this.config.headers[this.config.method || ""] || "";
    }

    // add any custom headers (defined upon calling methods like .get(), .post(), etc.)
    for (const property in this.config.headers) {
      if (
        !["common", "delete", "get", "head", "patch", "post", "put"].includes(
          property
        )
      ) {
        if (headers) {
          headers[property] = this.config.headers[property];
        }
      }
    }

    for (const property in headers) {
      if ({}.hasOwnProperty.call(headers, property)) {
        const header = `${property}:${headers[property]}`;
        curlHeaders = `${curlHeaders} -H '${header}'`;
      }
    }

    return curlHeaders.trim();
  }

  getBody() {
    if (
      typeof this.config.data !== "undefined" &&
      this.config.data !== "" &&
      this.config.data !== null &&
      this.config?.method?.toUpperCase() !== "GET"
    ) {
      const data =
        typeof this.config.data === "object" ||
        Object.prototype.toString.call(this.config.data) === "[object Array]"
          ? JSON.stringify(this.config.data)
          : this.config.data;
      return `--data '${data}'`.trim();
    } else {
      return "";
    }
  }

  getUrl() {
    if (this.config.baseURL) {
      const baseUrl = this.config.baseURL;
      const url = this.config.url;
      const finalUrl = baseUrl + "/" + url;
      return finalUrl
        .replace(/\/{2,}/g, "/")
        .replace("http:/", "http://")
        .replace("https:/", "https://");
    }
    return this.config.url || "";
  }

  getQueryString() {
    let params = "";
    let i = 0;

    for (const param in this.config.params) {
      if ({}.hasOwnProperty.call(this.config.params, param)) {
        params +=
          i !== 0
            ? `&${param}=${this.config.params[param]}`
            : `?${param}=${this.config.params[param]}`;
        i++;
      }
    }

    return params;
  }

  getBuiltURL() {
    let url = this.getUrl();

    const queryString = this.getQueryString();

    if (queryString !== "") {
      url += this.getQueryString();
    }

    return url.trim();
  }

  generateCommand() {
    return `curl --location "${this.getBuiltURL()}" ${this.getHeaders()} ${this.getBody()}`
      .trim()
      .replace(/\s{2,}/g, " ");
  }
}
