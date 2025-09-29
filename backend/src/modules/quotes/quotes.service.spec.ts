import { Test, TestingModule } from '@nestjs/testing';
import { QuotesCrudService } from './quotes.service';

describe('QuotesCrudService', () => {
  let service: QuotesCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotesCrudService],
    }).compile();

    service = module.get<QuotesCrudService>(QuotesCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
