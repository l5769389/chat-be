import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('relation', { schema: 'chat_db' })
export class RelationEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId', nullable: true, comment: '用户id' })
  userId: number | null;

  @Column('int', {
    name: 'friendsId',
    nullable: true,
    comment: '用户id的朋友列表',
  })
  friendsId: number | null;
}
