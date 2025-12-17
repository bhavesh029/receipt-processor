import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateReceiptDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}