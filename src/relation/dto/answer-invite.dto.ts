import { IsBoolean, IsString } from 'class-validator';

export class AnswerInviteDto {
  @IsString()
  invite_key: string;
  @IsBoolean()
  answer: boolean;
}
