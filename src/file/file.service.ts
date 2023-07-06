import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  filePath2Blob(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  saveFileToServe(buffer: Buffer, fileName: string, suffix = '') {
    return new Promise(async (resolve, reject) => {
      const parentPath = path.join(__dirname, '..', 'static');
      const filePath = path.join(parentPath, `${fileName}.${suffix}`);
      await this.checkPathExist(parentPath);
      writeFile(filePath, buffer, null, (err) => {
        if (err) {
          console.log(`写文件错误`, err);
          reject('');
        } else {
          resolve(filePath);
        }
      });
    });
  }

  async checkPathExist(parentPath) {
    try {
      await fs.promises.stat(parentPath);
      console.log(`${parentPath},存储文件路径存在`);
    } catch (e) {
      console.log(`存储文件路径不存在，创建:${parentPath}`);
      await fs.promises.mkdir(parentPath, {
        recursive: true,
      });
    }
  }

  async saveUploadFile(userId: string, file: Express.Multer.File) {
    const fileNameArr: Array<string> = file.originalname.split('.');
    const suffix = fileNameArr[fileNameArr.length - 1];
    const filename = fileNameArr.slice(0, fileNameArr.length - 1).join('');
    const timestamp = new Date().getTime();
    const newFileNameNoSuffix = `${userId}-${timestamp}~${filename}`;
    const newFileNameWithSuffix = `${userId}-${timestamp}~${file.originalname}`;
    await this.saveFileToServe(file.buffer, newFileNameNoSuffix, suffix);
    return newFileNameWithSuffix;
  }
}
