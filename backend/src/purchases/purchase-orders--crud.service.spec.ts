import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersCrudService } from './purchase-orders--crud.service';

describe('PurchaseOrdersCrudService', () => {
  let service: PurchaseOrdersCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseOrdersCrudService],
    }).compile();

    service = module.get<PurchaseOrdersCrudService>(PurchaseOrdersCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
