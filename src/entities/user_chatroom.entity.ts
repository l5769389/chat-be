import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_chatroom', { schema: 'chat_db' })
export class UserChatroomEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'chat_room_id' })
  chatRoomId: string;

  @Column('int', { name: 'user_id' })
  userId: number;
}
