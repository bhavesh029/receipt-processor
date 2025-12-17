import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReceiptService } from './receipt.service';
import { ValidateReceiptDto } from './dto/validate-receipt.dto';
import { ProcessReceiptDto } from './dto/process-receipt.dto';

@ApiTags('Receipts')
@Controller() 
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  // 1. Upload Endpoint
  @Post('upload')
  @ApiOperation({ summary: 'Upload a receipt PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
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
    if (!file) throw new BadRequestException('File is required');
    return this.receiptService.handleUpload(file);
  }

  // 2. Validate Endpoint
  @Post('validate') // Assignment requires /validate
  @ApiOperation({ summary: 'Validate PDF integrity' })
  async validateFile(@Body() body: ValidateReceiptDto) {
    return this.receiptService.validateReceipt(body.id);
  }

  // 3. Process Endpoint
  @Post('process') // Assignment requires /process
  @ApiOperation({ summary: 'Extract data using AI' })
  async processFile(@Body() body: ProcessReceiptDto) {
    return this.receiptService.processReceipt(body.id);
  }

  // 4. List Receipts
  @Get('receipts') // Assignment requires /receipts (PLURAL)
  @ApiOperation({ summary: 'List all processed receipts' })
  async findAll() {
    return this.receiptService.findAll();
  }

  // 5. Get Single Receipt
  @Get('receipts/:id')
  @ApiOperation({ summary: 'Get a specific receipt by ID' })
  async findOne(@Param('id') id: string) {
    return this.receiptService.findOne(id);
  }
}