import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TicketDepartment } from '../ticket.interface';

export class CreateTicketDTO {
  @MaxLength(128)
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsIn(['technical', 'marketing', 'sales', 'support'])
  department: TicketDepartment;

  @MaxLength(512)
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}
