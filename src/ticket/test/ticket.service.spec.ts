import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { TicketService } from '../ticket.service';
import { getModelToken } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';
import { Model } from 'mongoose';
import { ticketStub } from './stubs/ticket.stub';
import { CreateMessageViaUserDTO } from '../dtos/createMessage.dto';
import { CreateMessageViaAgentDTO } from 'src/agent/dtos/createMessage.dto';
import { CreateTicketDTO } from '../dtos/createTicket.dto';
import { TicketStatus } from '../ticket.interface';

describe('TicketService', () => {
  let service: TicketService;
  let repository: Model<TicketDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getModelToken(Ticket.name),
          useValue: createMock(Model<TicketDocument>),
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    repository = module.get<Model<TicketDocument>>(getModelToken(Ticket.name));
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getAllTickets is called', () => {
    let tickets;

    beforeEach(async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([ticketStub()]);
      tickets = await service.getAllTickets();
    });

    test('then it should call find method', () => {
      expect(repository.find).toBeCalledWith({}, [
        'title',
        'status',
        'department',
        'rate',
        'user_id',
        'createdAt',
        'updatedAt',
      ]);
    });

    test('then it should return a tickets list', () => {
      expect(tickets).toEqual([ticketStub()]);
    });
  });

  describe('when getUserTickets is called', () => {
    let tickets;
    let user_id: string;

    beforeEach(async () => {
      user_id = ticketStub().user_id;

      jest.spyOn(repository, 'find').mockResolvedValueOnce([ticketStub()]);
      tickets = await service.getUserTickets(user_id);
    });

    test('then it should call find method', () => {
      expect(repository.find).toBeCalledWith({ user_id }, [
        'title',
        'status',
        'department',
        'rate',
        'createdAt',
        'updatedAt',
      ]);
    });

    test("then it should return user's tickets", () => {
      expect(tickets).toEqual([ticketStub()]);
    });
  });

  describe('when getTicketDetails is called', () => {
    let ticket;
    let ticket_id: string;

    beforeEach(async () => {
      ticket_id = String(ticketStub()._id);

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(ticketStub());
      ticket = await service.getTicketDetails(ticket_id);
    });

    test('then it should call findOne method', () => {
      expect(repository.findOne).toBeCalledWith({ _id: ticket_id });
    });

    test('then it should return a ticket details', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('when createMessageViaUser is called', () => {
    let ticket;
    let ticket_id: string;
    let newMessage: CreateMessageViaUserDTO;

    beforeEach(async () => {
      ticket_id = String(ticketStub()._id);
      newMessage = {
        content: ticketStub().messages[0].content,
        user_id: ticketStub().messages[0].owner_id,
      };

      jest
        .spyOn(repository, 'findOneAndUpdate')
        .mockResolvedValueOnce(ticketStub());
      ticket = await service.createMessageViaUser(ticket_id, newMessage);
    });

    test('then it should call findOneAndUpdate method', () => {
      expect(repository.findOneAndUpdate).toBeCalledWith(
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
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('when createMessageViaAgent is called', () => {
    let ticket;
    let ticket_id: string;
    let agent_id: string;
    let newMessage: CreateMessageViaAgentDTO;

    beforeEach(async () => {
      ticket_id = String(ticketStub()._id);
      agent_id = ticketStub().messages[0].owner_id;
      newMessage = {
        content: ticketStub().messages[0].content,
      };

      jest
        .spyOn(repository, 'findOneAndUpdate')
        .mockResolvedValueOnce(ticketStub());
      ticket = await service.createMessageViaAgent(
        ticket_id,
        agent_id,
        newMessage,
      );
    });

    test('then it should call findOneAndUpdate method', () => {
      expect(repository.findOneAndUpdate).toBeCalledWith(
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
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('when createTicket is called', () => {
    let ticket;
    let ticketDTO: CreateTicketDTO;

    beforeEach(async () => {
      ticketDTO = {
        title: ticketStub().title,
        department: ticketStub().department,
        message: ticketStub().messages[0].content,
        user_id: ticketStub().messages[0].owner_id,
      };

      jest
        .spyOn(repository, 'create')
        .mockResolvedValueOnce([ticketStub() as unknown as TicketDocument]);
      ticket = await service.createTicket(ticketDTO);
    });

    test('then it should call create method', () => {
      expect(repository.create).toBeCalledWith({
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
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual([ticketStub()]);
    });
  });

  describe('when rateTicket is called', () => {
    let ticket;
    let ticket_id: string;
    let rate: number;

    beforeEach(async () => {
      ticket_id = String(ticketStub()._id);
      rate = ticketStub().rate;

      jest
        .spyOn(repository, 'findOneAndUpdate')
        .mockResolvedValueOnce(ticketStub());
      ticket = await service.rateTicket(ticket_id, rate);
    });

    test('then it should call findOneAndUpdate method', () => {
      expect(repository.findOneAndUpdate).toBeCalledWith(
        { _id: ticket_id },
        { rate },
        { new: true, projection: ['_id', 'rate'] },
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('when changeTicketStatus is called', () => {
    let ticket;
    let ticket_id: string;
    let status: TicketStatus;

    beforeEach(async () => {
      ticket_id = String(ticketStub()._id);
      status = ticketStub().status;

      jest
        .spyOn(repository, 'findOneAndUpdate')
        .mockResolvedValueOnce(ticketStub());
      ticket = await service.changeTicketStatus(ticket_id, status);
    });

    test('then it should call findOneAndUpdate method', () => {
      expect(repository.findOneAndUpdate).toBeCalledWith(
        { _id: ticket_id },
        { status },
        { new: true, projection: ['_id', 'status'] },
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });
});
