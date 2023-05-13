import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs';

@Injectable()
export class FileService {
  filePath2Blob(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      readFile(path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  saveImgToServe(buffer: Buffer, imgName: string) {
    return new Promise((resolve, reject) => {
      const path = `D:/chat/chat-be/src/static/${imgName}.png`;
      writeFile(path, buffer, null, (err) => {
        if (err) {
          reject('');
        } else {
          resolve(path);
        }
      });
    });
  }
}
