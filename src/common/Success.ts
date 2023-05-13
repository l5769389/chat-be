import { BaseResponse } from './BaseResponse';

export class Success extends BaseResponse<any> {
  constructor(data = null, msg = 'success') {
    super(1, msg, data);
  }
}
