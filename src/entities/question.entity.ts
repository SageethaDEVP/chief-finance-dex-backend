import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'query', nullable: false, unique: true })
  query: string;

  @Column('text', { name: 'choices', nullable: false, array: true })
  choices: string[];

  @Column('smallint', { name: 'answer', nullable: false })
  answer: number;

  @Column('text', { name: 'genre', nullable: false })
  genre: string;

  @Column('smallint', { name: 'level', nullable: false })
  level: number;

  @Column('text', { name: 'explanation', nullable: false })
  explanation: string;
}
