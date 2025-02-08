import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DefaultFields } from './default-fields';

@Entity('quiz_sessions')
@Check('"cfnc_won" >= 0')
@Check('"stake_amount" >= 0')
export class QuizSessionsEntity extends DefaultFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'question_set', nullable: false })
  questionSet: string;

  @Column('text', { name: 'wallet_address', nullable: false })
  walletAddress: string;

  @Column('boolean', { name: 'is_submitted', default: false })
  isSubmitted: boolean;

  @Column('text', { name: 'selected_answers', nullable: true })
  selectedAnswers: string;

  @Column('numeric', { name: 'cfnc_won', nullable: false, default: 0 })
  CFNC_won: number;

  @Column('boolean', { name: 'is_claimed', nullable: false, default: false })
  isClaimed: boolean;

  @Column('numeric', { name: 'stake_amount', nullable: false, default: 0 })
  stakeAmount: number;

  @Column('smallint', { name: 'vesting_id', nullable: true })
  vestingId: number;

  @Column('smallint', { name: 'total_vests', nullable: true })
  totalVests: number;

  @Column('smallint', { name: 'vests_claimed', nullable: true })
  vestsClaimed: number;

  @Column('bigint', { name: 'prev_vest_time', nullable: true })
  prevVestTime: number;
}
