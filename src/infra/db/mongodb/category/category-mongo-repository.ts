import { CategoryModel } from '@/core/domain/models/category';
import { AddCategoryModel } from '@/presentation/dtos/category/add-category.dto';
import { MongoHelper } from '../helpers/mongo-helper';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CategoryRepository } from '@/core/domain/repositories/category-repository';

@Injectable()
export class CategoryMongoRepository implements CategoryRepository {
  async create(payload: AddCategoryModel): Promise<CategoryModel> {
    try {
      const categoryCollection = await MongoHelper.getCollection('categories');
      const result = await (await categoryCollection).insertOne(payload);
      const category = await categoryCollection.findOne({
        _id: result.insertedId,
      });
      return MongoHelper.map(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAll(): Promise<CategoryModel[]> {
    try {
      const categoryCollection = await MongoHelper.getCollection('categories');
      const categoriesCursor = await categoryCollection.find();
      const categoriesArray = await categoriesCursor.toArray();

      return categoriesArray.map((category) => MongoHelper.map(category));
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByTitle(title: string): Promise<boolean> {
    try {
      const categoryCollection = await MongoHelper.getCollection('categories');
      const category = await categoryCollection.findOne({
        title,
      });
      if (!category) {
        return false;
      }
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: string): Promise<CategoryModel> {
    try {
      const categoryCollection = await MongoHelper.getCollection('categories');
      const category = await categoryCollection.findOne({
        _id: new ObjectId(id),
      });

      return MongoHelper.map(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    id: string,
    payload: Omit<AddCategoryModel, 'ownerId'>,
  ): Promise<CategoryModel> {
    try {
      const categoryCollection = await MongoHelper.getCollection('categories');
      const categoryUpdated = await categoryCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...payload,
          },
        },
      );
      if (categoryUpdated.matchedCount == 0) {
        throw new BadRequestException(`Category with ${id} id not found.`);
      }
      return MongoHelper.map(
        await categoryCollection.findOne({
          _id: new ObjectId(id),
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: string): Promise<CategoryModel> {
    try {
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new BadRequestException('Invalid category ID format.');
      }

      const categoryCollection = await MongoHelper.getCollection('categories');
      const category = MongoHelper.map(
        await categoryCollection.findOne({
          _id: new ObjectId(id),
        }),
      );
      await categoryCollection.deleteOne({
        _id: new ObjectId(id),
      });

      return category;
    } catch (error) {
      if (
        (error.message =
          "Cannot destructure property '_id' of 'collection' as it is null.")
      ) {
        throw new BadRequestException(`Category with id ${id} not found.`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
