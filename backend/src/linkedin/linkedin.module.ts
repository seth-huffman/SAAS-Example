import { Module } from '@nestjs/common';
import { LinkedInController } from './linkedin.controller';

@Module({ controllers: [LinkedInController] })
export class LinkedInModule {}
