import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAgentDTO {
  @MaxLength(128)
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email_address: string;

  @MaxLength(64)
  @MinLength(8)
  @IsString()
  password: string;

  @IsIn(['admin', 'agent'])
  role: string;
}
