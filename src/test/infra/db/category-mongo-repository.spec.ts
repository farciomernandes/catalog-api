import { Collection } from 'mongodb';
import { CategoryMongoRepository } from '@/infra/db/mongodb/category/category-mongo-repository';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MongoHelper } from '@/infra/db/mongodb/helpers/mongo-helper';
import { makeFakeCategory } from '@/test/mock/db-mock-helper-category';

type SutTypes = {
  sut: CategoryMongoRepository;
};
const makeSut = (): SutTypes => {
  const sut = new CategoryMongoRepository();

  return {
    sut,
  };
};

describe('Category Mongo Repository', () => {
  let categoryCollection: Collection;

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    categoryCollection = await MongoHelper.getCollection('categories');
    await categoryCollection.deleteMany({});
  });

  test('Should create an category on success', async () => {
    const { sut } = makeSut();
    await sut.create(makeFakeCategory());
    const count = await categoryCollection.countDocuments();
    expect(count).toBe(1);
  });

  test('Should return InternalServerError throws if create throw InternalServerError', async () => {
    const { sut } = makeSut();

    jest.mock('@/infra/db/mongodb/helpers/mongo-helper');

    jest
      .spyOn(MongoHelper, 'getCollection')
      .mockReturnValueOnce(Promise.reject(new InternalServerErrorException()));
    const promise = sut.create(makeFakeCategory());
    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  test('Should list categories on success', async () => {
    const { sut } = makeSut();

    const fakeCategory1 = makeFakeCategory();
    const fakeCategory2 = makeFakeCategory();
    await categoryCollection.insertMany([fakeCategory1, fakeCategory2]);

    const response = await sut.getAll();

    const expectedOutput = [
      MongoHelper.map(fakeCategory1),
      MongoHelper.map(fakeCategory2),
    ];

    expect(response).toEqual(expectedOutput);
  });

  test('Should return InternalServerError throws if getAll throw InternalServerError', async () => {
    const { sut } = makeSut();

    jest.mock('@/infra/db/mongodb/helpers/mongo-helper');

    jest
      .spyOn(MongoHelper, 'getCollection')
      .mockReturnValueOnce(Promise.reject(new InternalServerErrorException()));

    const promise = sut.getAll();
    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  test('Should update category on success', async () => {
    const { sut } = makeSut();

    const fakeCategory = makeFakeCategory();
    const category = await categoryCollection.insertOne(fakeCategory);

    const updatedCategory = {
      title: 'other_title',
      description: 'other_description',
    };

    const response = await sut.update(
      String(category.insertedId),
      updatedCategory,
    );

    expect(response.title).toEqual(updatedCategory.title);
    expect(response.description).toEqual(updatedCategory.description);
    expect(response.id).toEqual(category.insertedId);
  });

  test('Should return BadRequestExepction throws if update throw BadRequestExepction', async () => {
    const { sut } = makeSut();
    jest
      .spyOn(sut, 'update')
      .mockReturnValueOnce(
        Promise.reject(
          new BadRequestException(
            `Category with ${makeFakeCategory().id} id not found.`,
          ),
        ),
      );
    const promise = sut.update(makeFakeCategory().id, makeFakeCategory());
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  test('Should return InternalServerError throws if update throws', async () => {
    const { sut } = makeSut();
    jest.mock('@/infra/db/mongodb/helpers/mongo-helper');

    jest
      .spyOn(MongoHelper, 'getCollection')
      .mockReturnValueOnce(Promise.reject(new InternalServerErrorException()));

    const promise = sut.update(makeFakeCategory().id, makeFakeCategory());
    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  test('Should delete category on success', async () => {
    const { sut } = makeSut();
    const category = await categoryCollection.insertOne(makeFakeCategory());
    const response = await sut.delete(String(category.insertedId));

    expect(response.title).toEqual(makeFakeCategory().title);
    expect(response.description).toEqual(makeFakeCategory().description);
    expect(response.id).toEqual(category.insertedId);
  });

  test('Should return BadRequestException throws in delete if send invalid_id', async () => {
    const { sut } = makeSut();

    const response = sut.delete('invalid_id');
    await expect(response).rejects.toThrow(BadRequestException);
  });

  test('Should return InternalServerError throws if findByTitle throw InternalServerError', async () => {
    const { sut } = makeSut();

    jest.mock('@/infra/db/mongodb/helpers/mongo-helper');

    jest
      .spyOn(MongoHelper, 'getCollection')
      .mockReturnValueOnce(Promise.reject(new InternalServerErrorException()));

    const response = sut.findByTitle(makeFakeCategory().title);
    await expect(response).rejects.toThrow(InternalServerErrorException);
  });

  test('Should return true if findByTitle searched category on success', async () => {
    const { sut } = makeSut();

    await categoryCollection.insertOne(makeFakeCategory());
    const response = await sut.findByTitle(makeFakeCategory().title);
    expect(response).toEqual(true);
  });

  test('Should return false if findByTitle not searched category on success', async () => {
    const { sut } = makeSut();

    const response = await sut.findByTitle(makeFakeCategory().title);
    expect(response).toEqual(false);
  });

  test('Should return true if findById searched category on success', async () => {
    const { sut } = makeSut();

    const category = await categoryCollection.insertOne(makeFakeCategory());
    const response = await sut.findById(category.insertedId.toHexString());
    expect(response.title).toEqual(makeFakeCategory().title);
    expect(response.description).toEqual(makeFakeCategory().description);
    expect(response.ownerId).toEqual(makeFakeCategory().ownerId);
  });

  test('Should return InternalServerError throws if findByTitle throw InternalServerError', async () => {
    const { sut } = makeSut();

    jest.mock('@/infra/db/mongodb/helpers/mongo-helper');

    jest
      .spyOn(MongoHelper, 'getCollection')
      .mockReturnValueOnce(Promise.reject(new InternalServerErrorException()));

    const response = sut.findById(makeFakeCategory().title);
    await expect(response).rejects.toThrow(InternalServerErrorException);
  });
});
