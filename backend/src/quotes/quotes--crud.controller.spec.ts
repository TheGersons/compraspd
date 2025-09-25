import { Test, TestingModule } from '@nestjs/testing';
import { QuotesCrudController } from './quotes--crud.controller';
import { QuotesCrudService } from './quotes--crud.service';

describe('QuotesCrudController', () => {
  let controller: QuotesCrudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotesCrudController],
      providers: [QuotesCrudService],
    }).compile();

    controller = module.get<QuotesCrudController>(QuotesCrudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
