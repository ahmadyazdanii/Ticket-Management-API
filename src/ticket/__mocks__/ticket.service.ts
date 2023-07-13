import { ticketStub } from '../test/stubs/ticket.stub';

export const TicketService = jest.fn().mockReturnValue({
  getAllTickets: jest.fn().mockReturnValue([ticketStub()]),
  getUserTickets: jest.fn().mockReturnValue([ticketStub()]),
  getTicketDetails: jest.fn().mockReturnValue(ticketStub()),
  createMessageViaUser: jest.fn().mockReturnValue(ticketStub()),
  createMessageViaAgent: jest.fn().mockReturnValue(ticketStub()),
  createTicket: jest.fn().mockReturnValue(ticketStub()),
  rateTicket: jest.fn().mockReturnValue(ticketStub()),
  changeTicketStatus: jest.fn().mockReturnValue(ticketStub()),
});
