import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const oneGb = 1024 * 1024;
    // if (value.size > oneGb) {
    //   throw new BadRequestException('文件过大');
    // }
    return value;
  }
}
