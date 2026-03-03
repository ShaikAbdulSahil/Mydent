import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class EnhanceSmileDto {
    @IsNotEmpty()
    @IsString()
    userId!: string;
}

export class EnhanceSmileResponseDto {
    originalImageUrl!: string;
    enhancedImageUrl!: string;
    processingTime!: number;
    status!: string;
}
