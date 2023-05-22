enum ChatType {
  Single = 'Single',
  Multi = 'Multi',
}

enum SocketEvent {
  OFFER_INVITE = 'offer_invite',
  ANSWER_INVITE = 'answer_invite',
  VIDEO_ROOM_MSG = 'video_room_message',
}

interface RecentChatType {
  type: ChatType;
  id: number | string;
  name: string;
  joinIds?: Array<number>;
}

enum MsgFileType {
  Text = 'text',
  IMG = 'img',
}

interface MsgType {
  type: MsgFileType.Text | MsgFileType.IMG;
  content: string | Buffer;
  timestamp: string;
}

export { ChatType, RecentChatType, MsgFileType, MsgType, SocketEvent };
