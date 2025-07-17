import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // If there is no authenticated user attached to the request, immediately
    // terminate the guard check. This prevents runtime errors (e.g. accessing
    // properties of `undefined`) and ensures Nest properly returns 403 / 401
    // depending on the authentication setup instead of a 500 response.
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
