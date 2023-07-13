import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageViaUserDTO {
  @MaxLength(512)
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}
