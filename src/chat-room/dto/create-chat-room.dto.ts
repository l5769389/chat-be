import { IsNumber, IsString } from 'class-validator';

interface UserInfo {
  userId: string;
  avatar: string;
  nickname: string;
}

export class CreateChatRoomDto {
  @IsNumber()
  createUserId: number;
  joinUsersInfo: Array<UserInfo>;
  joinUserId: string;
  chatRoomName: string;
  roomId: string;
}
