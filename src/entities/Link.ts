import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Relation,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Link {
  @PrimaryColumn()
  linkId: string;

  @Column()
  originalUrl: string;

  @CreateDateColumn()
  lastAccessedOn: Date;

  @Column()
  numHits: number;

  @ManyToOne(() => User, (user) => user.links)
  @JoinColumn()
  user: Relation<User>;
}
