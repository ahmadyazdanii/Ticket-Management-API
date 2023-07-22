import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { AgentRole } from '../agent.interface';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({
  timestamps: true,
})
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email_address: string;

  @Prop({ required: true, enum: ['admin', 'operator'] })
  role: AgentRole;

  @Prop({ required: true, select: false })
  password: string;

  validatePassword: (candidatePassword: string) => Promise<boolean>;
}

const AgentSchema = SchemaFactory.createForClass(Agent);

AgentSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') || this.isNew) {
      this.password = await hash(this.password, 15);

      next();
    }
  } catch (err) {
    next(err);
  }
});

AgentSchema.methods.validatePassword = async function (
  this: AgentDocument,
  candidatePassword: string,
): Promise<boolean> {
  return compare(candidatePassword, this.password);
};

export { AgentSchema };
