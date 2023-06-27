import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class AnswerInviteDto {
  @IsNumber()
  userId: number;
  @IsString()
  inviteId: string;
  @IsBoolean()
  answer: boolean;
}
