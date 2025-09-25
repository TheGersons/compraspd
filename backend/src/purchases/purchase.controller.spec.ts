import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersCrudController } from './purchase.controller';
import { PurchaseOrdersCrudService } from './purchase.service';

describe('PurchaseOrdersCrudController', () => {
  let controller: PurchaseOrdersCrudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersCrudController],
      providers: [PurchaseOrdersCrudService],
    }).compile();

    controller = module.get<PurchaseOrdersCrudController>(PurchaseOrdersCrudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
