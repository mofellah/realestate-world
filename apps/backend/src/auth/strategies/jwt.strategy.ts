/**
 * JWT Strategy
 * Passport strategy for JWT validation
 */

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { backendConfig } from "@boilerplate/config";
import type { JwtPayload } from "@boilerplate/types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: backendConfig.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
      correlationId: payload.correlationId,
    };
  }
}
