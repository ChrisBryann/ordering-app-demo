import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_SERVICE } from './service';
import { Observable, catchError, tap } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // get access to the execution context to see if this is an http or rabbitmq request
    const authentication = this.getAuthentication(context);

    return this.authClient
      .send('validate_user', {
        Authentication: authentication,
      })
      .pipe(
        // can ask for additional functionality with pipe
        tap((res) => {
          // allows to specify side effects on our calls
          this.addUser(res, context);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
  }

  private getAuthentication(context: ExecutionContext) {
    let authentication: string;
    if (context.getType() === 'rpc') {
      // if communication through rabbitmq
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest()
        .cookies?.Authentication;
    }

    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for Authentication',
      );
    }
    return authentication;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() == 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
