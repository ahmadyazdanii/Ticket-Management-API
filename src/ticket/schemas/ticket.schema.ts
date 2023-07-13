import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TicketDepartment, TicketStatus } from '../ticket.interface';
import { Message, MessageSchema } from './message.schema';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    enum: ['technical', 'marketing', 'sales', 'support'],
    index: true,
  })
  department: TicketDepartment;

  @Prop({ min: 1, max: 5 })
  rate: number;

  @Prop({
    required: true,
    enum: ['not_answered', 'closed', 'pending', 'answered'],
    default: 'not_answered',
    index: true,
  })
  status: TicketStatus;

  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true, type: [MessageSchema], default: [] })
  messages: Message[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
