import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NanoBanana extends Document {
    @Prop({ required: true })
    userId!: string;

    @Prop({ required: true })
    originalImageUrl!: string;

    @Prop({ required: true })
    enhancedImageUrl!: string;

    @Prop({ default: 'completed' })
    status!: string;

    @Prop()
    processingTime?: number;
}

export const NanoBananaSchema = SchemaFactory.createForClass(NanoBanana);
