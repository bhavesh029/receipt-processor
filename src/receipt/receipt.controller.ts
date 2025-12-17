import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Body } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ValidateReceiptDto } from './dto/validate-receipt.dto';
import { ProcessReceiptDto } from './dto/process-receipt.dto';

@Controller('upload') // Requirement says /upload
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a receipt PDF' }) // Adds a title
  @ApiConsumes('multipart/form-data') // Tells Swagger this is a file upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // This adds the "Choose File" button
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Make sure this folder exists!
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    // Call service to save metadata and check duplicates
    return this.receiptService.handleUpload(file);
  }

  @Post('validate')
  async validateFile(@Body() body: ValidateReceiptDto) {
    return this.receiptService.validateReceipt(body.id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Extract data using AI' })
  async processFile(@Body() body: ProcessReceiptDto) {
    return this.receiptService.processReceipt(body.id);
  }
}