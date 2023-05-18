export class CreateUserChatRoomDto {
  constructor(userId: number, chatRoomId: string) {
    this.userId = userId;
    this.chatRoomId = chatRoomId;
  }
  id: number;
  userId: number;
  chatRoomId: string;
}
