import { IsIn } from 'class-validator';
import { TicketStatus } from '../../ticket/ticket.interface';

export class ChangeTicketStatusDTO {
  @IsIn(['not_answered', 'closed', 'pending', 'answered'])
  status: TicketStatus;
}
