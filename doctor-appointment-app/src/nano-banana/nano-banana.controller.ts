import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NanoBananaService } from './nano-banana.service';
import { EnhanceSmileDto } from './nano-banana.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('nano-banana')
export class NanoBananaController {
    constructor(private readonly nanoBananaService: NanoBananaService) { }

    @Post('enhance-smile')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return cb(
                        new BadRequestException('Only image files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async enhanceSmile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: EnhanceSmileDto,
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        if (!body.userId) {
            throw new BadRequestException('User ID is required');
        }

        return this.nanoBananaService.enhanceSmile(file.buffer, body.userId);
    }

    @Get('history/:userId')
    async getHistory(@Param('userId') userId: string) {
        return this.nanoBananaService.getEnhancementHistory(userId);
    }

    @Get('enhancement/:id')
    async getEnhancement(@Param('id') id: string) {
        return this.nanoBananaService.getEnhancementById(id);
    }
}
