import { Test, TestingModule } from '@nestjs/testing';
import { ProductsCrudService } from './products.service';

describe('ProductsCrudService', () => {
  let service: ProductsCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsCrudService],
    }).compile();

    service = module.get<ProductsCrudService>(ProductsCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
