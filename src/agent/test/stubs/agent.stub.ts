import { Types } from 'mongoose';
import { AgentDocument } from '../../schemas/agent.schema';
import { AgentRole } from '../../agent.interface';

export const agentStub = (
  role: AgentRole,
): Partial<AgentDocument> & { createdAt: string; updatedAt: string } => {
  return {
    _id: new Types.ObjectId('64a0561340ef69576feb2688'),
    name: `${role}`,
    email_address: `${role}@gmail.com`,
    role: `${role}`,
    password: '$2b$15$21pjF0btXOS1KCQDEMvc9eYwbIWK.CpwQeaRUN0v6kVzDTWLJFFx6',
    createdAt: '2023-03-29T15:50:54.175+00:00',
    updatedAt: '2023-03-29T15:50:54.175+00:00',
    __v: 0,
  };
};
