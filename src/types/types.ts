enum ChatType {
  Single = 'Single',
  Multi = 'Multi',
}

enum SocketEvent {
  // 聊天相关的事件
  CHAT_MSG_SINGLE = 'singleMsg',
  CHAT_MSG_MULTI = 'multiMsg',
  CHAT_JOIN_ROOM = 'joinRoom',
  // 用户连接状态
  CONNECTED = 'connected',
  // 音视频相关的事件
  OFFER_INVITE = 'offer_invite',
  ANSWER_INVITE = 'answer_invite',
  CREATE_INVITE_ROOM = 'create_invite_room',
  VIDEO_ROOM_MSG = 'video_room_message',
  VIDEO_ROOM_CHANGE_MSG = 'video_room_change_msg', //关闭，切换语音、视频等

  REMOTE_CONTROL = 'remote_control',
}

enum VIDEO_ROOM_CHANGE_MSG_SUB {
  CANCEL = 'cancel',
  SWITCH_VIDEO = 'switch_video',
  SWITCH_AUDIO = 'switch_audio',
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

export {
  ChatType,
  RecentChatType,
  MsgFileType,
  MsgType,
  SocketEvent,
  VIDEO_ROOM_CHANGE_MSG_SUB,
};
