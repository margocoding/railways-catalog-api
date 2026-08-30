import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangeUsernameDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Логин может содержать только буквы, цифры и подчеркивания',
  })
  newUsername!: string;
}