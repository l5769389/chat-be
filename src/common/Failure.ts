import { BaseResponse } from './BaseResponse';

export class Failure extends BaseResponse<any> {
  constructor(msg = 'failure') {
    super(0, msg, null);
  }
}
