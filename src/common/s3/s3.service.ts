import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as buffer from 'node:buffer';
import { FileDto } from './dto/file.dto';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('AWS_REGION'),
      endpoint: configService.get('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: String(configService.get('AWS_ACCESS_KEY_ID')),
        secretAccessKey: String(configService.get('AWS_SECRET_ACCESS_KEY')),
      },
    });
  }
  async uploadAvatar(
    buffer_file: buffer.Buffer,
    key: string,
    typeContent: string,
  ) {
    const file: FileDto = {
      key: key,
      bucket: String(this.configService.get<string>('AWS_BUCKET_AVATARS')),
    };
    return await this.uploadFile(file, buffer_file, `image/${typeContent}`);
  }
  async downloadAvatar(key: string) {
    const file: FileDto = {
      key: key,
      bucket: String(this.configService.get<string>('AWS_BUCKET_AVATARS')),
    };
    return await this.downloadFile(file);
  }
  async removeAvatar(key: string) {
    const file: FileDto = {
      key: key,
      bucket: String(this.configService.get<string>('AWS_BUCKET_AVATARS')),
    };
    return await this.removeFile(file);
  }
  getLinkAvatar(key: string) {
    return `https://storage.yandexcloud.net/${this.configService.get<string>('AWS_BUCKET_AVATARS')}/${key}`;
  }

  async uploadImage(
    buffer_file: buffer.Buffer,
    key: string,
    typeContent: string,
  ) {
    const file: FileDto = {
      key: key,
      bucket: String(this.configService.get<string>('AWS_BUCKET_IMAGE')),
    };
    return await this.uploadFile(file, buffer_file, `image/${typeContent}`);
  }
  async downloadImage(key: string) {
    const file: FileDto = {
      key: key,
      bucket: String(this.configService.get<string>('AWS_BUCKET_IMAGE')),
    };
    return await this.downloadFile(file);
  }
  async removeImage(key: string) {
    const file: FileDto = {
      key: key,
      bucket: String(this.configService.get<string>('AWS_BUCKET_IMAGE')),
    };
    return await this.removeFile(file);
  }
  getLinkImage(key: string) {
    return `https://storage.yandexcloud.net/${this.configService.get<string>('AWS_BUCKET_IMAGE')}/${key}`;
  }

  async uploadFile(
    file: FileDto,
    buffer_file: buffer.Buffer,
    typeContent: string,
  ) {
    const command = new PutObjectCommand({
      Body: buffer_file,
      Bucket: file.bucket,
      Key: file.key,
      ContentType: typeContent,
    });
    return await this.s3Client.send(command);
  }
  async downloadFile(file: FileDto) {
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });
    return await this.s3Client.send(command);
  }
  async removeFile(file: FileDto) {
    const command = new DeleteObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });
    return await this.s3Client.send(command);
  }
}
