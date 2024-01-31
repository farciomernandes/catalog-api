import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CategoryModel {
  @ApiProperty({
    type: String,
    example: 'gm56omomasppk64p',
  })
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    example: 'title',
  })
  @IsNotEmpty()
  @Expose()
  title: string;

  @ApiProperty({
    type: String,
    example: 'Descrição da categoria',
  })
  @IsNotEmpty()
  @Expose()
  description: string;

  @ApiProperty({
    type: Number,
    example: 10,
  })
  @IsNotEmpty()
  @Expose()
  price: number;

  @ApiProperty({
    type: String,
    example: 'asG-1gmlç2em0-mdasjd',
  })
  @IsNotEmpty()
  @Expose()
  ownerId: string;

  static toDto(payload: CategoryModel): CategoryModel {
    return plainToInstance(CategoryModel, payload, {
      excludeExtraneousValues: true,
    });
  }
}
