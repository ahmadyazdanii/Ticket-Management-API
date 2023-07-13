import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { Model } from 'mongoose';
import { CreateAgentDTO } from './dtos/createAgent.dto';
import { UpdateAgentDTO } from './dtos/updateAgent.dto';
import { SigninDTO } from './dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument & Agent>,
    private jwtService: JwtService,
  ) {}

  getAgent(agent_id: string) {
    return this.agentModel.findOne({ _id: agent_id }, [
      'name',
      'email_address',
      'role',
    ]);
  }

  getAgents() {
    return this.agentModel.find({}, ['name', 'email_address', 'role']);
  }

  createAgent(newAgent: CreateAgentDTO) {
    return this.agentModel.create(newAgent);
  }

  updateAgent(agent_id: string, updatableAgent: UpdateAgentDTO) {
    return this.agentModel.findOneAndUpdate({ _id: agent_id }, updatableAgent, {
      new: true,
    });
  }

  deleteAgent(agent_id: string) {
    return this.agentModel.deleteOne({ _id: agent_id });
  }

  async signin(agentData: SigninDTO): Promise<[AgentDocument, string]> {
    const agent = await this.agentModel.findOne(
      {
        email_address: agentData.email_address,
      },
      ['name', 'email_address', 'role', 'password'],
    );

    if (!agent || !(await agent.validatePassword(agentData.password))) {
      throw new UnprocessableEntityException(
        'The email or password is incorrect',
      );
    }

    return [
      {
        _id: agent._id,
        name: agent.name,
        email_address: agent.email_address,
        role: agent.role,
      } as AgentDocument,
      await this.jwtService.signAsync({ username: agent._id }),
    ];
  }
}
