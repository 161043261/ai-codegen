import { Module } from '@nestjs/common';
import { StaticResourceController } from './static-resource.controller';

@Module({
  controllers: [StaticResourceController],
})
export class StaticResourceModule {}
