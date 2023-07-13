import { Ticket } from '../../schemas/ticket.schema';
import { Types } from 'mongoose';

export const ticketStub = (): Partial<Ticket> & {
  _id: Types.ObjectId;
  __v: number;
  createdAt: string;
  updatedAt: string;
} => {
  return {
    _id: new Types.ObjectId('56cb91bdc3464f14678934ca'),
    __v: 0,
    title: 'new ticket',
    department: 'sales',
    rate: 3,
    status: 'not_answered',
    user_id: '1',
    messages: [
      {
        content: 'first message',
        owner_id: '1',
        owner_type: 'agent',
      },
    ],
    createdAt: '2023-03-29T15:50:54.175+00:00',
    updatedAt: '2023-03-29T15:50:54.175+00:00',
  };
};
