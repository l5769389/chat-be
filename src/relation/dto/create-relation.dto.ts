import { IsNumber, IsString } from 'class-validator';

export class CreateRelationDto {
  @IsNumber()
  userId: number;
  @IsNumber()
  friendsId: number;
  @IsString()
  inviteMsg?: string;
}
