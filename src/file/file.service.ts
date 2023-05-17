import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  filePath2Blob(imgPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      readFile(imgPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  saveImgToServe(buffer: Buffer, imgName: string) {
    return new Promise(async (resolve, reject) => {
      const parentPath = path.join(__dirname, 'static');
      const imgPath = path.join(__dirname, 'static', `${imgName}.png`);
      await this.checkPathExist(parentPath);
      writeFile(imgPath, buffer, null, (err) => {
        if (err) {
          console.log(`写文件错误`, err);
          reject('');
        } else {
          resolve(imgPath);
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
