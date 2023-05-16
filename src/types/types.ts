enum ChatType {
  Single = 'Single',
  Multi = 'Multi',
}

interface RecentChatType {
  type: ChatType;
  id: number | string;
  name: string;
}

export { ChatType, RecentChatType };
