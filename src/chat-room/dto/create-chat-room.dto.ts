import { IsNumber, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsNumber()
  createId: number;
  joinIds: Array<number>;
}
