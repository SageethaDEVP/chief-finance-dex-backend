import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DefaultFields } from './default-fields';

type QuizUserClaim = {
  gameId?: string;
  signature: string;
  coinsScored: number;
};

@Entity('quiz_users')
@Check('"game_credits" >= 0')
export class QuizUsersEntity extends DefaultFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'wallet_address', nullable: false })
  walletAddress: string;

  @Column('integer', {
    name: 'total_games_played',
    nullable: false,
    default: 0,
  })
  totalGamesPlayed: number;

  @Column('integer', {
    name: 'total_points_scored',
    nullable: false,
    default: 0,
  })
  totalPointsScored: number;

  @Column('bigint', {
    name: 'game_credits',
    nullable: false,
    default: 100,
  })
  gameCredits: number;

  @Column('json', {
    name: 'claims',
    nullable: true,
  })
  claims: QuizUserClaim[];
}
