import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { Model } from 'mongoose';
import { CreateAgentDTO } from './dtos/createAgent.dto';
import { UpdateAgentDTO } from './dtos/updateAgent.dto';
import { SigninDTO } from './dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { omit, pick } from 'lodash';

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

  async createAgent(newAgent: CreateAgentDTO) {
    const document = await this.agentModel.create(newAgent);

    return pick(document.toObject(), ['_id', 'name', 'email_address', 'role']);
  }

  updateAgent(agent_id: string, updatableAgent: UpdateAgentDTO) {
    return this.agentModel.findOneAndUpdate({ _id: agent_id }, updatableAgent, {
      new: true,
    });
  }

  deleteAgent(agent_id: string) {
    return this.agentModel.deleteOne({ _id: agent_id });
  }

  async signin(
    agentData: SigninDTO,
  ): Promise<[Omit<AgentDocument, 'password'>, string]> {
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
      omit(agent.toObject(), ['password']),
      await this.jwtService.signAsync({ username: agent._id }),
    ];
  }
}
