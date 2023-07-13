import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { Model, Types } from 'mongoose';
import { CreateTicketDTO } from './dtos/createTicket.dto';
import { CreateMessageViaUserDTO } from './dtos/createMessage.dto';
import { TicketStatus } from './ticket.interface';
import { CreateMessageViaAgentDTO } from 'src/agent/dtos/createMessage.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  getAllTickets() {
    return this.ticketModel.find({}, [
      '_id',
      'title',
      'status',
      'department',
      'rate',
      'user_id',
      'createdAt',
      'updatedAt',
    ]);
  }

  getUserTickets(user_id: string) {
    return this.ticketModel.find({ user_id }, [
      '_id',
      'title',
      'status',
      'department',
      'rate',
      'createdAt',
      'updatedAt',
    ]);
  }

  getTicketDetails(ticket_id: string) {
    return this.ticketModel.findOne({ _id: ticket_id });
  }

  createMessageViaUser(ticket_id: string, newMessage: CreateMessageViaUserDTO) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticket_id },
      {
        $push: {
          messages: {
            content: newMessage.content,
            owner_type: 'user',
            owner_id: newMessage.user_id,
          },
        },
      },
      {
        new: true,
        projection: { _id: 1, messages: { $slice: ['$messages', -1] } },
      },
    );
  }

  createMessageViaAgent(
    ticket_id: string,
    agent_id: string,
    newMessage: CreateMessageViaAgentDTO,
  ) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticket_id },
      {
        $push: {
          messages: {
            content: newMessage.content,
            owner_type: 'agent',
            owner_id: agent_id,
          },
        },
      },
      {
        new: true,
        projection: { _id: 1, messages: { $slice: ['$messages', -1] } },
      },
    );
  }

  createTicket(ticketDTO: CreateTicketDTO) {
    return this.ticketModel.create({
      title: ticketDTO.title,
      department: ticketDTO.department,
      messages: [
        {
          content: ticketDTO.message,
          owner_type: 'user',
          owner_id: ticketDTO.user_id,
        },
      ],
      user_id: ticketDTO.user_id,
    });
  }

  rateTicket(ticket_id: string, rate: number) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticket_id },
      { rate },
      { new: true, projection: ['_id', 'rate'] },
    );
  }

  changeTicketStatus(ticket_id: string, status: TicketStatus) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticket_id },
      { status },
      { new: true, projection: ['_id', 'status'] },
    );
  }
}
