import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NanoBanana, NanoBananaSchema } from './nano-banana.schema';
import { NanoBananaController } from './nano-banana.controller';
import { NanoBananaService } from './nano-banana.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: NanoBanana.name, schema: NanoBananaSchema },
        ]),
    ],
    controllers: [NanoBananaController],
    providers: [NanoBananaService],
    exports: [NanoBananaService],
})
export class NanoBananaModule { }
