import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from '../agent.controller';
import { AgentService } from '../agent.service';
import { TicketService } from '../../ticket/ticket.service';
import { ticketStub } from '../../ticket/test/stubs/ticket.stub';
import { CreateMessageViaAgentDTO } from '../dtos/createMessage.dto';
import { agentStub } from './stubs/agent.stub';
import { AgentDocument } from '../schemas/agent.schema';
import { SigninDTO } from '../dtos/signin.dto';
import { CreateAgentDTO } from '../dtos/createAgent.dto';
import { UpdateAgentDTO } from '../dtos/updateAgent.dto';

jest.mock('../agent.service');
jest.mock('../../ticket/ticket.service');

describe('Agent Controller', () => {
  let controller: AgentController;
  let agentService: AgentService;
  let ticketService: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      providers: [AgentService, TicketService],
    }).compile();

    controller = module.get<AgentController>(AgentController);
    agentService = module.get<AgentService>(AgentService);
    ticketService = module.get<TicketService>(TicketService);

    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When getAllTickets is called', () => {
    let tickets;

    beforeEach(async () => {
      tickets = await controller.getAllTickets();
    });

    test('then it should call getAllTickets service', () => {
      expect(ticketService.getAllTickets).toBeCalledWith();
    });

    test('then it should return a ticket instances list', () => {
      expect(tickets).toEqual([ticketStub()]);
    });
  });

  describe('When getTicketDetails is called', () => {
    let ticket;

    beforeEach(async () => {
      ticket = await controller.getTicketDetails(String(ticketStub()._id));
    });

    test('then it should call getTicketDetails service', () => {
      expect(ticketService.getTicketDetails).toBeCalledWith(
        String(ticketStub()._id),
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('When createMessage is called', () => {
    let ticket;
    let createMessageViaAgentDTOStub: CreateMessageViaAgentDTO;

    beforeEach(async () => {
      createMessageViaAgentDTOStub = {
        content: ticketStub().messages[0].content,
      };

      ticket = await controller.createMessage(
        String(ticketStub()._id),
        createMessageViaAgentDTOStub,
        agentStub('admin') as AgentDocument,
      );
    });

    test('then it should call createMessageViaAgent service', () => {
      expect(ticketService.createMessageViaAgent).toBeCalledWith(
        String(ticketStub()._id),
        agentStub('admin')._id,
        createMessageViaAgentDTOStub,
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('When changeTicketStatus is called', () => {
    let ticket;

    beforeEach(async () => {
      ticket = await controller.changeTicketStatus(
        String(ticketStub()._id),
        ticketStub().status,
      );
    });

    test('then it should call changeTicketStatus service', () => {
      expect(ticketService.changeTicketStatus).toBeCalledWith(
        String(ticketStub()._id),
        ticketStub().status,
      );
    });

    test('then it should return a ticket instance', () => {
      expect(ticket).toEqual(ticketStub());
    });
  });

  describe('When signin is called', () => {
    let agent;
    let SigninDTOStub: SigninDTO;
    let response;

    beforeEach(async () => {
      SigninDTOStub = {
        email_address: agentStub('operator').email_address,
        password: '12345678',
      };

      response = {
        cookie: jest.fn(),
      };

      agent = await controller.signin(SigninDTOStub, response);
    });

    test('then it should call signin service', () => {
      expect(agentService.signin).toBeCalledWith(SigninDTOStub);
    });

    test('then it should call cookie method of response', () => {
      expect(response.cookie).toBeCalledWith(
        'access_token',
        'mock-jwt-signed-content',
      );
    });

    test('then it should return an agent instance', () => {
      expect(agent).toEqual(agentStub('operator'));
    });
  });

  describe('When getAllAgents is called', () => {
    let agents;

    beforeEach(async () => {
      agents = await controller.getAllAgents();
    });

    test('then it should call getAgents service', () => {
      expect(agentService.getAgents).toBeCalled();
    });

    test('then it should return all agent instances', () => {
      expect(agents).toEqual([agentStub('admin'), agentStub('operator')]);
    });
  });

  describe('When createAgent is called', () => {
    let agent;
    let createAgentDTOStub: CreateAgentDTO;

    beforeEach(async () => {
      createAgentDTOStub = {
        email_address: agentStub('operator').email_address,
        password: '123456789',
        name: agentStub('operator').name,
        role: agentStub('operator').role,
      };

      agent = await controller.createAgent(createAgentDTOStub);
    });

    test('then it should call createAgent service', () => {
      expect(agentService.createAgent).toBeCalledWith(createAgentDTOStub);
    });

    test('then it should return all agent instances', () => {
      expect(agent).toEqual(agentStub('operator'));
    });
  });

  describe('When updateAgent is called', () => {
    let agent;
    let updateAgentDTOStub: UpdateAgentDTO;

    beforeEach(async () => {
      updateAgentDTOStub = {
        email_address: agentStub('operator').email_address,
        password: '123456789',
        name: agentStub('operator').name,
        role: agentStub('operator').role,
      };

      agent = await controller.updateAgent(
        agentStub('operator')._id,
        updateAgentDTOStub,
      );
    });

    test('then it should call updateAgent service', () => {
      expect(agentService.updateAgent).toBeCalledWith(
        agentStub('operator')._id,
        updateAgentDTOStub,
      );
    });

    test('then it should return all agent instances', () => {
      expect(agent).toEqual(agentStub('operator'));
    });
  });

  describe('When removeAgent is called', () => {
    let agent;

    beforeEach(async () => {
      agent = await controller.removeAgent(agentStub('operator')._id);
    });

    test('then it should call deleteAgent service', () => {
      expect(agentService.deleteAgent).toBeCalledWith(
        agentStub('operator')._id,
      );
    });

    test('then it should return all agent instances', () => {
      expect(agent).toEqual(agentStub('operator'));
    });
  });
});
