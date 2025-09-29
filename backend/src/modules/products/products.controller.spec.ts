import { Test, TestingModule } from '@nestjs/testing';
import { ProductsCrudController } from './products.controller';
import { ProductsCrudService } from './products.service';

describe('ProductsCrudController', () => {
  let controller: ProductsCrudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsCrudController],
      providers: [ProductsCrudService],
    }).compile();

    controller = module.get<ProductsCrudController>(ProductsCrudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
