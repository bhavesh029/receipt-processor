import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessReceiptDto {
  @IsString()
  @IsNotEmpty()
  id: string; // The ID of the file to process
}