export class BaseResponse<T> {
  constructor(code: number, msg: string, data: T) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }

  code: number;
  msg: string;
  data: T;
}
