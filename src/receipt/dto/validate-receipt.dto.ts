import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateReceiptDto {
  @ApiProperty({ example: 'ecb0a680-16a6-48d1-bff6-ab57b2745752' })
  @IsString()
  @IsNotEmpty()
  id: string;
}