import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageViaAgentDTO {
  @MaxLength(512)
  @IsNotEmpty()
  @IsString()
  content: string;
}
