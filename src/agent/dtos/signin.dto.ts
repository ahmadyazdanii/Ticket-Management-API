import { OmitType } from '@nestjs/mapped-types';
import { CreateAgentDTO } from './createAgent.dto';

export class SigninDTO extends OmitType(CreateAgentDTO, ['name', 'role']) {}
