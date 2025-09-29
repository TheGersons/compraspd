import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';


@Module({
    imports: [PrismaModule],
    providers: [CatalogsService],
    controllers: [CatalogsController],
})
export class CatalogsModule { }