import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  uploadBuffer(buffer: Buffer, folder: string = 'stb_documents'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'raw', // PDFs must use 'raw' to be served as-is
          format: 'pdf',
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            return reject(error);
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  // Upload a base64 string directly (if needed)
  async uploadBase64(base64Str: string, folder: string = 'stb_documents'): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(base64Str, {
        folder,
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch (error) {
      this.logger.error(`Failed to upload base64 to Cloudinary: ${error.message}`);
      throw error;
    }
  }
}
