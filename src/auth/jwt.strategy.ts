// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // 👇 read from ConfigService (which uses .env under the hood)
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    // Optionally: quick debug
    console.log('AUTH0_DOMAIN =', domain);
    console.log('AUTH0_AUDIENCE =', audience);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
