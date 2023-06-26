import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  @IsOptional()
  nickname: string;
  @IsString()
  @IsOptional()
  avatar: string;
}
