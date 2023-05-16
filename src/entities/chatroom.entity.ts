import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_room', { schema: 'chat_db' })
export class ChatroomEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;
  @Column('varchar', { name: 'room_id' })
  roomId: string;

  @Column('varchar', { name: 'chat_room_name' })
  chatRoomName: string;

  @Column('int', { name: 'create_user_id' })
  createUserId: number;

  @Column('varchar', { name: 'join_user_id' })
  joinUserId: string;
}
