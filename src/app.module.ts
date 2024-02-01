import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './infra/ioc/category-module';
import { CategoryController } from './presentation/controllers/category/category-controller';
import { ProductModule } from './infra/ioc/product-module';
import { ProductController } from './presentation/controllers/product/product-controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: '.env',
    }),
    CategoryModule,
    ProductModule,
  ],
  controllers: [CategoryController, ProductController],
  providers: [],
})
export class AppModule {}