import { AxiosRequestConfig } from "axios";


export const axiosToCurl = (config: AxiosRequestConfig) => {
  return `curl --location "${getBuiltURL(config)}" ${getHeaders(
    config
  )} ${getBody(config)}`
    .trim()
    .replace(/\s{2,}/g, " ");
};

function getHeaders(config: AxiosRequestConfig) {
  let headers = config.headers,
    curlHeaders = "";

  if (!headers || !config.headers) return "";

  // get the headers concerning the appropriate method (defined in the global axios instance)
  // eslint-disable-next-line no-prototype-builtins
  if (headers.hasOwnProperty("common")) {
    headers = config.headers[config.method || ""] || "";
  }

  // add any custom headers (defined upon calling methods like .get(), .post(), etc.)
  for (const property in config.headers) {
    if (
      !["common", "delete", "get", "head", "patch", "post", "put"].includes(
        property
      )
    ) {
      if (headers) {
        headers[property] = config.headers[property];
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
function getBody(config: AxiosRequestConfig) {
  if (
    typeof config.data !== "undefined" &&
    config.data !== "" &&
    config.data !== null &&
    config?.method?.toUpperCase() !== "GET"
  ) {
    const data =
      typeof config.data === "object" ||
      Object.prototype.toString.call(config.data) === "[object Array]"
        ? JSON.stringify(config.data)
        : config.data;
    return `--data '${data}'`.trim();
  } else {
    return "";
  }
}

function getUrl(config: AxiosRequestConfig) {
  if (config.baseURL) {
    const baseUrl = config.baseURL;
    const url = config.url;
    const finalUrl = baseUrl + "/" + url;
    return finalUrl
      .replace(/\/{2,}/g, "/")
      .replace("http:/", "http://")
      .replace("https:/", "https://");
  }
  return config.url || "";
}

function getBuiltURL(config: AxiosRequestConfig) {
  let url = getUrl(config);

  const queryString = getQueryString(config);

  if (queryString !== "") {
    url += getQueryString(config);
  }

  return url.trim();
}

function getQueryString(config: AxiosRequestConfig) {
  let params = "";
  let i = 0;

  for (const param in config.params) {
    if ({}.hasOwnProperty.call(config.params, param)) {
      params +=
        i !== 0
          ? `&${param}=${config.params[param]}`
          : `?${param}=${config.params[param]}`;
      i++;
    }
  }

  return params;
}

/*
export class CurlHelper {

  constructor(config) {
    this.request = config;
  }

  getHeaders() {
    let headers = this.request.headers,
      curlHeaders = "";

    // get the headers concerning the appropriate method (defined in the global axios instance)
    if (headers.hasOwnProperty("common")) {
      headers = this.request.headers[this.request.method];
    }

    // add any custom headers (defined upon calling methods like .get(), .post(), etc.)
    for(let property in this.request.headers) {
      if (
        !["common", "delete", "get", "head", "patch", "post", "put"].includes(
          property
        )
      ) {
        headers[property] = this.request.headers[property];
      }
    }

    for(let property in headers) {
      if({}.hasOwnProperty.call(headers, property)) {
        let header = `${property}:${headers[property]}`;
        curlHeaders = `${curlHeaders} -H '${header}'`;
      }
    }

    return curlHeaders.trim();
  }

  getMethod() {
    return `-X ${this.request.method.toUpperCase()}`;
  }

  getBody() {
    if (
      typeof this.request.data !== "undefined" &&
      this.request.data !== "" &&
      this.request.data !== null &&
      this.request.method.toUpperCase() !== "GET"
    ) {
      let data =
        typeof this.request.data === "object" ||
        Object.prototype.toString.call(this.request.data) === "[object Array]"
          ? JSON.stringify(this.request.data)
          : this.request.data;
      return `--data '${data}'`.trim();
    } else {
      return "";
    }
  }

  getUrl() {
    if (this.request.baseURL) {
      let baseUrl = this.request.baseURL
      let url = this.request.url
      let finalUrl = baseUrl + "/" + url
      return finalUrl
        .replace(/\/{2,}/g, '/')
        .replace("http:/", "http://")
        .replace("https:/", "https://")
    }
    return this.request.url;
  }

  getQueryString() {
    if (this.request.paramsSerializer) {
      const params = this.request.paramsSerializer(this.request.params)
      if (!params || params.length === 0) return ''
      if (params.startsWith('?')) return params
      return `?${params}`
    }
    let params = ""
    let i = 0

    for(let param in this.request.params) {
      if({}.hasOwnProperty.call(this.request.params, param)) {
        params +=
        i !== 0
          ? `&${param}=${this.request.params[param]}`
          : `?${param}=${this.request.params[param]}`;
        i++;
      }
    }

    return params;
  }

  getBuiltURL() {
    let url = this.getUrl();

    if (this.getQueryString() !== "") {
      url += this.getQueryString();
    }

    return url.trim();
  }

  generateCommand() {
    return `curl ${this.getMethod()} "${this.getBuiltURL()}" ${this.getHeaders()} ${this.getBody()}`
      .trim()
      .replace(/\s{2,}/g, " ");
  }
}
*/
