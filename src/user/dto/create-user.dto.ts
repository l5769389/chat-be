import { IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;
  @IsString()
  @Length(6, 16)
  password: string;
  @IsString()
  @IsOptional()
  nickname: string;
  @IsString()
  @IsOptional()
  avatar: string;
}
