import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { TicketService } from '../ticket/ticket.service';
import { AgentService } from './agent.service';
import { CreateMessageViaAgentDTO } from './dtos/createMessage.dto';
import { SigninDTO } from './dtos/signin.dto';
import { Response } from 'express';
import { OnlyAdmin } from './decorators/onlyAdmin.decorator';
import { CurrentUser } from './decorators/currentUser.decorator';
import { AgentDocument } from './schemas/agent.schema';
import { CreateAgentDTO } from './dtos/createAgent.dto';
import { UpdateAgentDTO } from './dtos/updateAgent.dto';
import { ChangeTicketStatusDTO } from './dtos/changeTicketStatus.dto';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly ticketService: TicketService,
  ) {}

  @Get('/tickets')
  getAllTickets() {
    return this.ticketService.getAllTickets();
  }

  @Get('/tickets/:ticket_id')
  getTicketDetails(@Param('ticket_id') ticket_id: string) {
    return this.ticketService.getTicketDetails(ticket_id);
  }

  @Put('/tickets/:ticket_id')
  createMessage(
    @Param('ticket_id') ticket_id: string,
    @Body() newMessage: CreateMessageViaAgentDTO,
    @CurrentUser() agent: AgentDocument,
  ) {
    return this.ticketService.createMessageViaAgent(
      ticket_id,
      String(agent._id),
      newMessage,
    );
  }

  @Patch('/tickets/:ticket_id')
  changeTicketStatus(
    @Param('ticket_id') ticket_id: string,
    @Body() body: ChangeTicketStatusDTO,
  ) {
    return this.ticketService.changeTicketStatus(ticket_id, body.status);
  }

  @Post('/auth/signin')
  async signin(
    @Body() agentData: SigninDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const [agent, token] = await this.agentService.signin(agentData);

    response.cookie('access_token', token);

    return agent;
  }

  @Get('members')
  @OnlyAdmin()
  getAllAgents() {
    return this.agentService.getAgents();
  }

  @Put('members')
  @OnlyAdmin()
  createAgent(@Body() newAgent: CreateAgentDTO) {
    return this.agentService.createAgent(newAgent);
  }

  @Patch('members/:member_id')
  @OnlyAdmin()
  updateAgent(
    @Param('member_id') agent_id: string,
    @Body() updatableAgent: UpdateAgentDTO,
  ) {
    return this.agentService.updateAgent(agent_id, updatableAgent);
  }

  @Delete('members/:member_id')
  @OnlyAdmin()
  removeAgent(@Param('member_id') agent_id: string) {
    return this.agentService.deleteAgent(agent_id);
  }
}
