// src/users/dto/upsert-pro-profile.dto.ts
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertProProfileDto {
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  minJobPrice?: number;

  @IsOptional()
  @IsNumber()
  maxDistanceKm?: number;

  @IsOptional()
  serviceAreaGeojson?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioMedia?: string[];
}
