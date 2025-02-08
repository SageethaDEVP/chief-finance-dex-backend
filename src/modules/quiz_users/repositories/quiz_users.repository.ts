import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BaseRepository } from 'src/infrastructure/database';
import { QuizUsersEntity } from 'src/entities/quiz_users.entity';

@Injectable()
export class QuizUsersRepository extends BaseRepository(QuizUsersEntity) {
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource);
  }
}
