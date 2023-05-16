import { IsNumber, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsNumber()
  createUserId: number;
  joinUserId: string;
  chatRoomName: string;
  roomId: string;
}
