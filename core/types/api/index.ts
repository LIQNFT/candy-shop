export enum RequestMethod {
  Post,
  Get,
  Put,
  Patch,
  Delete,
}

export interface ApiCallerInterface {
  request: (url: string, method: RequestMethod, data: { [key: string]: any }) => Promise<any>
}
