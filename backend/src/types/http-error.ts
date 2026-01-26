export interface HttpError extends Error {
  httpStatusCode?: number;
}
