import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ProductsModule,
    DatabaseModule,
    CategoryModule,
    RedisModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}
