import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BaseRepository } from 'src/infrastructure/database';
import { QuizSessionsEntity } from 'src/entities';

@Injectable()
export class QuizSessionsRepository extends BaseRepository(QuizSessionsEntity) {
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource);
  }
}
