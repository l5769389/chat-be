import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ChatRoomPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || this.toValidate(metatype)) {
      return value;
    }
    const instance = plainToInstance(metatype, value);
    const errors = await validate(instance);
    if (errors.length > 0) {
      throw new BadRequestException('参数校验错误');
    }
    return value;
  }
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return types.includes(metatype);
  }
}
