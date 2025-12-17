import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';


@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async handleUpload(file: Express.Multer.File) {
    // 1. Calculate File Hash (SHA-256)
    const fileBuffer = fs.readFileSync(file.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hexHash = hashSum.digest('hex');

    // 2. Check for Duplicates in DB
    const existingFile = await this.prisma.receiptFile.findUnique({
      where: { file_hash: hexHash },
    });

    if (existingFile) {
      // Clean up the newly uploaded duplicate file to save space
      fs.unlinkSync(file.path);
      
      return {
        message: 'Duplicate file detected. Returning existing record.',
        data: existingFile,
      };
    }

    // 3. Save new record
    const newFile = await this.prisma.receiptFile.create({
      data: {
        file_name: file.originalname,
        file_path: file.path,
        file_hash: hexHash,
        is_valid: true, // We did basic mime-check in controller
      },
    });

    return {
      message: 'File uploaded successfully',
      data: newFile,
    };
  }

  async validateReceipt(fileId: string) {
    // 1. Find the file record
    const receiptFile = await this.prisma.receiptFile.findUnique({
      where: { id: fileId },
    });

    if (!receiptFile) {
      throw new BadRequestException('File not found');
    }

    try {
      // 2. Read the first 4 bytes of the file to check "Magic Bytes"
      // PDF files always start with "%PDF"
      const buffer = Buffer.alloc(4);
      const fd = fs.openSync(receiptFile.file_path, 'r');
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);

      const isValidPdf = buffer.toString('utf8') === '%PDF';

      // 3. Update the database status
      return await this.prisma.receiptFile.update({
        where: { id: fileId },
        data: {
          is_valid: isValidPdf,
          invalid_reason: isValidPdf ? null : 'Invalid file signature. Not a PDF.',
        },
      });

    } catch (error) {
      // Handle missing files or read errors
      return await this.prisma.receiptFile.update({
        where: { id: fileId },
        data: {
          is_valid: false,
          invalid_reason: 'File corrupted or missing from disk.',
        },
      });
    }
  }

  async processReceipt(fileId: string) {
    // 1. Get the file record
    const receiptFile = await this.prisma.receiptFile.findUnique({
      where: { id: fileId },
    });

    if (!receiptFile) {
      throw new BadRequestException('File not found');
    }

    // 2. Initialize Gemini
    if (!process.env.GEMINI_API_KEY) {
      throw new BadRequestException('Gemini API key is not configured');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // 3. Prepare image for AI
    const fileBuffer = fs.readFileSync(receiptFile.file_path);
    const prompt = `
      Analyze this receipt image. Extract these fields in pure JSON format:
      - merchant_name (string, e.g., "Walmart", "Uber")
      - date (string, ISO 8601 format YYYY-MM-DDTHH:mm:ss.000Z. If unknown, use null)
      - total_amount (number. If unknown, use null)
      
      Return ONLY valid JSON. No markdown formatting.
    `;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        },
      ]);

      const response = await result.response;
      let text = response.text();

      // Clean up potential markdown code blocks (```json ... ```)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const extractedData = JSON.parse(text);

      // 4. Save to Database
      const receipt = await this.prisma.receipt.create({
        data: {
          merchant_name: extractedData.merchant_name,
          total_amount: extractedData.total_amount,
          purchased_at: extractedData.date ? new Date(extractedData.date) : null,
          file_path: receiptFile.file_path,
          receipt_file_id: receiptFile.id,
        },
      });

      // 5. Mark file as processed
      await this.prisma.receiptFile.update({
        where: { id: fileId },
        data: { is_processed: true },
      });

      return receipt;

    } catch (error) {
      console.error('AI Error:', error);
      throw new BadRequestException('Failed to process receipt with AI');
    }
  }
}
