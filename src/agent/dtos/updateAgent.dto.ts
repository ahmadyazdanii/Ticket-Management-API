import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentDTO } from './createAgent.dto';

export class UpdateAgentDTO extends PartialType(CreateAgentDTO) {}
