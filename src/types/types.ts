enum ChatType {
  Single = 'Single',
  Multi = 'Multi',
}

interface RecentChatType {
  type: ChatType;
  id: number | string;
}

export { ChatType, RecentChatType };
