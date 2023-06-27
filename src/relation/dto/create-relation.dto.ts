import { IsNumber } from 'class-validator';

export class CreateRelationDto {
  @IsNumber()
  userId: number;
  @IsNumber()
  friendsId: number;
}
