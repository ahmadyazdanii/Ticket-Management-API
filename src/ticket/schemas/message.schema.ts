import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TicketMessageOwnerType } from '../ticket.interface';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: { updatedAt: false, createdAt: true } })
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ['agent', 'user'], index: true })
  owner_type: TicketMessageOwnerType;

  @Prop({ required: true, index: true })
  owner_id: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
