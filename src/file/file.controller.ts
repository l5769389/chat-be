import {
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../decorator/public/public.decorator';
import { FileSizeValidationPipe } from '../pipe/file-size-validation/file-size-validation.pipe';
import { Validator } from 'class-validator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileSizeValidationPipe())
  upload(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
