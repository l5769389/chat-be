enum ChatType {
  Single = 'Single',
  Multi = 'Multi',
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

export { ChatType, RecentChatType, MsgFileType, MsgType };
