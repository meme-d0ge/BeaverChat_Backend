import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class FilesService {
  private logger = new Logger(FilesService.name);

  async checkImageAvatar(image: Buffer<ArrayBuffer>) {
    this.logger.log(`Checking image avatar`);
    const meta = await sharp(image).metadata();
    if (
      meta &&
      !(
        meta.format === 'png' ||
        meta.format === 'jpeg' ||
        meta.format === 'jpg'
      )
    ) {
      return false;
    }
    const size = meta.size;
    if (size && size > 3 * 1024 * 1024) return false;
    return meta;
  }
  async checkImagePost(image: Buffer<ArrayBuffer>) {
    this.logger.log(`Checking image for post`);
    const meta = await sharp(image).metadata();
    if (
      meta &&
      !(
        meta.format === 'png' ||
        meta.format === 'jpeg' ||
        meta.format === 'jpg'
      )
    ) {
      return false;
    }
    const size = meta.size;
    if (size && size > 10 * 1024 * 1024) return false;
    return meta;
  }
}
