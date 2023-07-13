import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDTO } from './dtos/createTicket.dto';
import { CreateMessageViaUserDTO } from './dtos/createMessage.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  getUserTickets(@Query('user_id') user_id: string) {
    return this.ticketService.getUserTickets(user_id);
  }
  @Put()
  createTicket(@Body() newTicket: CreateTicketDTO) {
    return this.ticketService.createTicket(newTicket);
  }

  @Get('/:ticket_id')
  getTicketDetails(@Param('ticket_id') ticket_id: string) {
    return this.ticketService.getTicketDetails(ticket_id);
  }

  @Put('/:ticket_id')
  createMessage(
    @Param('ticket_id') ticket_id: string,
    @Body() newMessage: CreateMessageViaUserDTO,
  ) {
    return this.ticketService.createMessageViaUser(ticket_id, newMessage);
  }

  @Post('/:ticket_id/rate')
  rateTicket(
    @Param('ticket_id') ticket_id: string,
    @Body('rate', ParseIntPipe) rate: number,
  ) {
    return this.ticketService.rateTicket(ticket_id, rate);
  }
}
