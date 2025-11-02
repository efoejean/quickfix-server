export const registerDto = `
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';


export class RegisterDto {
@ApiProperty({ required: false })
@IsOptional()
@IsEmail()
email?: string;


@ApiProperty({ required: false })
@IsOptional()
@IsPhoneNumber('US')
phone?: string;


@ApiProperty()
@IsString()
name: string;
}
`;