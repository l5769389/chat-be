import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import configuration from '../config/configuration';
import { diskStorage } from 'multer';

const {
  file: { fileSizeLimit },
} = configuration();
const Multer = MulterModule.registerAsync({
  useFactory: () => {
    return {
      limits: {
        fileSize: fileSizeLimit,
      },
    };
  },
});

@Module({
  imports: [Multer],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
