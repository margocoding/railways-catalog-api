import { Expose, Type } from 'class-transformer';
import { UserRdo } from './user.rdo';

export class AuthTokenRdo {
  @Expose()
  token!: string;

  @Expose()
  @Type(() => UserRdo)
  user!: UserRdo;
}