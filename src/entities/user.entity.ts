import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user', { schema: 'chat_db' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'userId' })
  userId: number;

  @Column('varchar', { name: 'username', nullable: true, length: 255 })
  username: string | null;

  @Column('varchar', { name: 'password', nullable: true, length: 255 })
  password: string | null;

  @Column('varchar', { name: 'avatar', nullable: true, length: 255 })
  avatar: string | null;

  @Column('varchar', { name: 'nickname', nullable: true, length: 255 })
  nickname: string | null;
}
