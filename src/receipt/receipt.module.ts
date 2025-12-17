import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { PrismaService } from 'src/prisma/prisma.service'; // Import this

@Module({
  controllers: [ReceiptController],
  providers: [ReceiptService, PrismaService] // Add PrismaService here
})
export class ReceiptModule {}