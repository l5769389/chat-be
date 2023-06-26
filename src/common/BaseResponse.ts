export class BaseResponse<T> {
  code: number;
  msg: string;
  data: T;

  constructor(code: number, msg: string, data: T) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
}
