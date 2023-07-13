import { agentStub } from '../test/stubs/agent.stub';

export const AgentService = jest.fn().mockReturnValue({
  getAgent: jest.fn().mockReturnValue(agentStub('admin')),
  getAgents: jest
    .fn()
    .mockReturnValue([agentStub('admin'), agentStub('operator')]),
  createAgent: jest.fn().mockReturnValue(agentStub('operator')),
  updateAgent: jest.fn().mockReturnValue(agentStub('operator')),
  deleteAgent: jest.fn().mockReturnValue(agentStub('operator')),
  signin: jest
    .fn()
    .mockResolvedValue([agentStub('operator'), 'mock-jwt-signed-content']),
});
