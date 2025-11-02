export const verifyOtpDto = `
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';


export class VerifyOtpDto {
@ApiProperty({ required: false })
@IsOptional()
email?: string;


@ApiProperty({ required: false })
@IsOptional()
phone?: string;


@ApiProperty()
@IsString()
code: string;
}
`;