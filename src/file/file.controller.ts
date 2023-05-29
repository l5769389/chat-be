import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Public } from '../decorator/public/public.decorator';
import { FileSizeValidationPipe } from '../pipe/file-size-validation/file-size-validation.pipe';
import { Success } from '../common/Success';
import * as path from 'path';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileSizeValidationPipe())
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const userId = req.user.userId;
    const path = await this.fileService.saveUploadFile(userId, file);
    return new Success(path);
  }

  @Public()
  @Get()
  async getFile(@Query('filePath') filePath: string, @Res() res: Response) {
    const file = path.join(__dirname, '..', '/static/', filePath);
    const originfilename = filePath.split('~')[1];
    res.download(file, originfilename);
  }
}
