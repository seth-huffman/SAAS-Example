import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class LinkedInController {
    private readonly config;
    constructor(config: ConfigService);
    auth(res: Response): void | Response<any, Record<string, any>>;
    callback(code: string, error: string, res: Response): Promise<Response<any, Record<string, any>>>;
    private postAndClose;
    private html;
}
