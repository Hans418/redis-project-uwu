import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product} from '../../generated/prisma/client';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    const product = await this.databaseService.product.create({
      data: createProductDto,
    });

    await this.invalidateProductCaches();

    return product;
  }

  async findAll(
    categoryId?: string,
    name?: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const cacheKey = `products:${categoryId || 'all'}:page:${page}:limit:${pageSize}:search:${name || 'none'}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.redisService.incrementHit();
      console.log(`cache hit:${this.redisService.getStats().hits}`);
      return JSON.parse(cached) as Product[];
    }

    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const [products, total] = await Promise.all([
      this.databaseService.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.databaseService.product.count({ where }),
    ]);

    const result = {
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
    this.redisService.incrementMiss();
    console.log(`cache miss:${this.redisService.getStats().misses}`);
    await this.redisService.setex(cacheKey, 600, JSON.stringify(result));

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `product:${id}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.redisService.incrementHit();
      console.log(`cache hit:${this.redisService.getStats().hits}`);

      return JSON.parse(cached) as Product;
    }


    const product = await this.databaseService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await this.redisService.setex(cacheKey, 300, JSON.stringify(product));
    this.redisService.incrementMiss();
    console.log(`cache miss:${this.redisService.getStats().misses}`);

    return product;
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    const product = await this.databaseService.product.update({
      where: { id },
      data: updateProductDto,
    });

    await this.invalidateProductCaches();

    return product;
  }

  async remove(id: string) {
    const product = await this.databaseService.product.findUnique({
      where: { id },
    });

    await this.databaseService.product.delete({
      where: { id },
    });

    await this.invalidateProductCaches();

    return product;
  }

  getRedisStats() {
    return this.redisService.getStats();
  }

  private async invalidateProductCaches() {
    const keys = await this.redisService.keys('product*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
