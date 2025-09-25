import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersCrudController } from './suppliers--crud.controller';
import { SuppliersCrudService } from './suppliers--crud.service';

describe('SuppliersCrudController', () => {
  let controller: SuppliersCrudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersCrudController],
      providers: [SuppliersCrudService],
    }).compile();

    controller = module.get<SuppliersCrudController>(SuppliersCrudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
