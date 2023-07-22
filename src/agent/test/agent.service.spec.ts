import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { AgentService } from '../agent.service';
import { Agent, AgentDocument } from '../schemas/agent.schema';
import { agentStub } from './stubs/agent.stub';
import { CreateAgentDTO } from '../dtos/createAgent.dto';
import { UpdateAgentDTO } from '../dtos/updateAgent.dto';
import { SigninDTO } from '../dtos/signin.dto';
import { pick } from 'lodash';

describe('Agent Service', () => {
  let service: AgentService;
  let repository: Model<AgentDocument & Agent>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: getModelToken(Agent.name),
          useValue: createMock(Model<AgentDocument & Agent>),
        },
        JwtService,
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
    repository = module.get<Model<AgentDocument & Agent>>(
      getModelToken(Agent.name),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getAgent is called', () => {
    let agent;
    let agent_id: string;

    beforeEach(async () => {
      agent_id = String(agentStub('operator')._id);

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(agentStub('operator'));

      agent = await service.getAgent(agent_id);
    });

    test('then it should call findOne method', () => {
      expect(repository.findOne).toBeCalledWith({ _id: agent_id }, [
        'name',
        'email_address',
        'role',
      ]);
    });

    test('then it should return a agent instance', () => {
      expect(agent).toEqual(agentStub('operator'));
    });
  });

  describe('when getAgents is called', () => {
    let agent;

    beforeEach(async () => {
      jest
        .spyOn(repository, 'find')
        .mockResolvedValueOnce([agentStub('operator')]);

      agent = await service.getAgents();
    });

    test('then it should call find method', () => {
      expect(repository.find).toBeCalledWith({}, [
        'name',
        'email_address',
        'role',
      ]);
    });

    test('then it should return a agent list', () => {
      expect(agent).toEqual([agentStub('operator')]);
    });
  });

  describe('when createAgent is called', () => {
    let agent;
    let createAgentDto: CreateAgentDTO;

    beforeEach(async () => {
      createAgentDto = {
        email_address: agentStub('operator').email_address,
        name: agentStub('operator').name,
        password: '12345678',
        role: agentStub('operator').role,
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(repository, 'create').mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(agentStub('operator')),
      } as unknown as AgentDocument);

      agent = await service.createAgent(createAgentDto);
    });

    test('then it should call create method', () => {
      expect(repository.create).toBeCalledWith(createAgentDto);
    });

    test('then it should return a agent list', () => {
      expect(agent).toEqual(
        pick(agentStub('operator'), ['_id', 'name', 'email_address', 'role']),
      );
    });
  });

  describe('when updateAgent is called', () => {
    let agent;
    let agent_id: string;
    let updateAgentDto: UpdateAgentDTO;

    beforeEach(async () => {
      agent_id = String(agentStub('operator')._id);

      updateAgentDto = {
        email_address: agentStub('operator').email_address,
        name: agentStub('operator').name,
        password: '12345678',
        role: agentStub('operator').role,
      };

      jest
        .spyOn(repository, 'findOneAndUpdate')
        .mockResolvedValueOnce(agentStub('operator'));

      agent = await service.updateAgent(agent_id, updateAgentDto);
    });

    test('then it should call findOneAndUpdate method', () => {
      expect(repository.findOneAndUpdate).toBeCalledWith(
        { _id: agent_id },
        updateAgentDto,
        {
          new: true,
        },
      );
    });

    test('then it should return a agent instance', () => {
      expect(agent).toEqual(agentStub('operator'));
    });
  });

  describe('when deleteAgent is called', () => {
    let agent;
    let agent_id: string;

    beforeEach(async () => {
      agent_id = String(agentStub('operator')._id);

      jest
        .spyOn(repository, 'deleteOne')
        .mockResolvedValueOnce({ deletedCount: 1, acknowledged: true });

      agent = await service.deleteAgent(agent_id);
    });

    test('then it should call deleteOne method', () => {
      expect(repository.deleteOne).toBeCalledWith({ _id: agent_id });
    });

    test('then it should return a acknowledgment object', () => {
      expect(agent).toEqual({ deletedCount: 1, acknowledged: true });
    });
  });

  describe('when signin is called', () => {
    let returnValues: [Omit<AgentDocument, 'password'>, string];
    let signinDto: SigninDTO;
    let isValidatePassword: boolean;

    beforeEach(async () => {
      signinDto = {
        email_address: agentStub('operator').email_address,
        password: '12345678',
      };

      isValidatePassword = true;
      const mockValidationPassword = jest
        .fn()
        .mockResolvedValueOnce(isValidatePassword);

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce({
        ...agentStub('operator'),
        validatePassword: mockValidationPassword,
        toObject: jest.fn().mockReturnValue({
          ...agentStub('operator'),
          validatePassword: mockValidationPassword,
        }),
      });

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('mock-jwt-signed-content');

      returnValues = await service.signin(signinDto);
    });

    test('then it should call findOne method', () => {
      expect(repository.findOne).toBeCalledWith(
        {
          email_address: signinDto.email_address,
        },
        ['name', 'email_address', 'role', 'password'],
      );
    });

    test('then it should call validatePassword method', () => {
      expect(returnValues[0].validatePassword).toBeCalledWith(
        signinDto.password,
      );
    });

    test('then it should throw error when agent not found or password not validated', async () => {
      isValidatePassword = false;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(undefined);

      try {
        await service.signin(signinDto);
      } catch (e) {
        expect(e.message).toEqual('The email or password is incorrect');
      }
    });

    test('then it should call signAsync method', () => {
      expect(jwtService.signAsync).toBeCalledWith({
        username: returnValues[0]._id,
      });
    });

    test('then it should return a list of agent and signed jwt', () => {
      expect(returnValues).toHaveLength(2);
      expect(returnValues[1]).toEqual('mock-jwt-signed-content');
    });
  });
});
