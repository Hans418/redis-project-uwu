import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private cacheHits = 0;
  private cacheMisses = 0;
  constructor(private configService: ConfigService) {
    super({
      host: configService.get('REDIS_HOST') || 'localhost',
      port: configService.get('REDIS_PORT') || 6379,
      password: configService.get('REDIS_PASSWORD'),
    });

    this.on('connect', () => {
      console.log('Redis connected');
    });

    this.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }
  incrementHit() {
    this.cacheHits++;
  }

  incrementMiss() {
    this.cacheMisses++;
  }

  getStats() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      total,
      hitRate: total > 0 ? ((this.cacheHits / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
  async onModuleDestroy() {
    await this.quit();
  }
}
