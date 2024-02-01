import { ProductMongoRepository } from '../../../infra/db/mongodb/product/product-mongo-repository';
import {
  makeProductMongoRepository,
  makeFakeProduct,
} from '../product/db-mock-helper-product';
import { DbListProduct } from './db-list-product';

interface SutTypes {
  sut: DbListProduct;
  listProductRepositoryStub: ProductMongoRepository;
}

const makeSut = (): SutTypes => {
  const listProductRepositoryStub = makeProductMongoRepository();
  const sut = new DbListProduct(listProductRepositoryStub);

  return {
    sut,
    listProductRepositoryStub,
  };
};

describe('DbListProduct usecase', () => {
  test('Should call ProductMongoRepository', async () => {
    const { sut, listProductRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(listProductRepositoryStub, 'getAll');
    await sut.getAll();
    expect(addSpy).toBeCalledWith();
  });

  test('Should throws if ProductMongoRepository throws', async () => {
    const { sut, listProductRepositoryStub } = makeSut();
    jest
      .spyOn(listProductRepositoryStub, 'getAll')
      .mockReturnValueOnce(
        new Promise((resolver, reject) => reject(new Error())),
      );
    const promise = sut.getAll();
    expect(promise).rejects.toThrow();
  });

  test('Should return Product array on success', async () => {
    const { sut } = makeSut();

    const response = await sut.getAll();
    expect(response).toEqual([makeFakeProduct()]);
  });
});