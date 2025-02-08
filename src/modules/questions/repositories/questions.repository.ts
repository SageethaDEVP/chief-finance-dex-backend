import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BaseRepository } from 'src/infrastructure/database';
import { QuestionEntity } from 'src/entities';

@Injectable()
export class QuestionsRepository extends BaseRepository(QuestionEntity) {
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource);
  }
}
