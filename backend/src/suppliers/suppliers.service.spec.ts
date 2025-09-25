import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersCrudService } from './suppliers.service';

describe('SuppliersCrudService', () => {
  let service: SuppliersCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuppliersCrudService],
    }).compile();

    service = module.get<SuppliersCrudService>(SuppliersCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
