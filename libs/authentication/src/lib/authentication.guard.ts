import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { AuthenticationService } from './authentication.service'

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        const [type, token] = request.headers.authorization?.split(' ', 2) ?? []
        if (type !== 'Bearer' || !token) throw new UnauthorizedException()

        try {
            const session =
                await this.authenticationService.getUserSessionFromToken(token)
            request.session = session
        } catch {
            throw new UnauthorizedException()
        }

        return true
    }
}
