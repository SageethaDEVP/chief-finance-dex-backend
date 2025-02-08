import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Enable CORS for all routes
    // res.header('Access-Control-Allow-Origin', process.env.ORIGIN_URL ?? '*');
    // res.header(
    //   'Access-Control-Allow-Headers',
    //   'Origin, X-Requested-With, Content-Type, Accept',
    // );
    // res.header(
    //   'Access-Control-Allow-Methods',
    //   'GET, POST, PUT, DELETE, OPTIONS',
    // );
    next();
  }
}
