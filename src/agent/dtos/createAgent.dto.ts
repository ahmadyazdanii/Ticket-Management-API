import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AgentRole } from '../agent.interface';

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

  @IsIn(['admin', 'operator'])
  role: AgentRole;
}
