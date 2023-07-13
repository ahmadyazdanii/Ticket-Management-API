import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AgentRole } from '../agent.interface';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<AgentRole[]>(
      'roles',
      context.getHandler(),
    );

    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const role = request.user.role;

      if (!roles.includes(role)) {
        return false;
      }
    }

    return true;
  }
}
