import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from '../ticket.controller';
import { TicketService } from '../ticket.service';
import { ticketStub } from './stubs/ticket.stub';

jest.mock('../ticket.service');

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [TicketService],
    }).compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);

    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When getUserTickets is called', () => {
    let tickets;

    beforeEach(async () => {
      tickets = await controller.getUserTickets(ticketStub().user_id);
    });

    test('then it should call getUserTickets service', () => {
      expect(service.getUserTickets).toBeCalledWith(ticketStub().user_id);
    });

    test('then it should return a ticket instances list', () => {
      expect(tickets).toEqual([ticketStub()]);
    });
  });

  describe('When createTicket is called', () => {
    let ticket;
    let createTicketDTOStub;

    beforeEach(async () => {
      createTicketDTOStub = {
        title: ticketStub().title,
        department: ticketStub().department,
        message: ticketStub().messages[0].content,
        user_id: ticketStub().user_id,
      };

      ticket = await controller.createTicket(createTicketDTOStub);
    });

    test('then it should call createTicket service', () => {
      expect(service.createTicket).toBeCalledWith(createTicketDTOStub);
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('When getTicketDetails is called', () => {
    let ticket;

    beforeEach(async () => {
      ticket = await controller.getTicketDetails(String(ticketStub()._id));
    });

    test('then it should call getTicketDetails service', () => {
      expect(service.getTicketDetails).toBeCalledWith(String(ticketStub()._id));
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('When createMessage is called', () => {
    let ticket;
    let createMessageViaUserDTOStub;

    beforeEach(async () => {
      createMessageViaUserDTOStub = {
        content: ticketStub().messages[0].content,
        user_id: ticketStub().messages[0].owner_id,
      };

      ticket = await controller.createMessage(
        String(ticketStub()._id),
        createMessageViaUserDTOStub,
      );
    });

    test('then it should call createMessageViaUser service', () => {
      expect(service.createMessageViaUser).toBeCalledWith(
        String(ticketStub()._id),
        createMessageViaUserDTOStub,
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('When rateTicket is called', () => {
    let ticket;

    beforeEach(async () => {
      ticket = await controller.rateTicket(
        String(ticketStub()._id),
        ticketStub().rate,
      );
    });

    test('then it should call rateTicket service', () => {
      expect(service.rateTicket).toBeCalledWith(
        String(ticketStub()._id),
        ticketStub().rate,
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });
});
