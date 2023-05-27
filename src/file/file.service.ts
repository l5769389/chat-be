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
      const parentPath = path.join(__dirname, 'static');
      const filePath = path.join(__dirname, 'static', `${fileName}.${suffix}`);
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
    } catch (e) {
      await fs.promises.mkdir(parentPath, {
        recursive: true,
      });
    }
  }
}
