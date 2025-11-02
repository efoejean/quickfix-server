import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsString()
  addressLine!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsDateString()
  scheduledStartAt!: string;

  @IsInt()
  timeWindowMins!: number;

  @IsInt()
  budgetFixedCents!: number;
}
