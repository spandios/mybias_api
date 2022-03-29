export type MyCallback = (err: Error, result: any) => any;

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
  interface Error {
    stack?: string;
    statusCode?: number;
  }
}
