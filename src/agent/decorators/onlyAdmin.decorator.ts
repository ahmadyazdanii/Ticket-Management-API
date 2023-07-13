import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthorizationGuard } from '../guards/authorization.guard';

export function OnlyAdmin() {
  return applyDecorators(
    SetMetadata('roles', ['admin']),
    UseGuards(AuthorizationGuard),
  );
}
