import {
    Injectable,
    InternalServerErrorException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NanoBanana } from './nano-banana.schema';

/**
 * Dental Treatment Visualization Service
 *
 * PURPOSE: Show patients what their smile will look like AFTER orthodontic treatment.
 * Uses Cloudinary Generative AI (e_gen_replace) to correct teeth alignment,
 * close gaps, and whiten teeth while preserving the patient's natural face.
 *
 * The image is processed server-side via the Cloudinary SDK (not URL-based)
 * so the AI fully renders the result before returning it.
 */
@Injectable()
export class NanoBananaService {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    private readonly cloudinary = require('cloudinary').v2;

    constructor(
        @InjectModel(NanoBanana.name)
        private nanoBananaModel: Model<NanoBanana>,
    ) {
        this.cloudinary.config({
            cloud_name: 'drs9qu7ch',
            api_key: '881513522789742',
            api_secret: 'qYF6sf5BbFmwtkB69hQt6qoN3mY',
        });
    }

    async enhanceSmile(imageBuffer: Buffer, userId: string) {
        const startTime = Date.now();

        // 1. Upload original image
        let originalImageUrl: string;
        let publicId: string;

        try {
            const originalResult = await this.uploadBuffer(
                imageBuffer,
                `smile-original-${Date.now()}`,
            );
            originalImageUrl = originalResult.secure_url;
            publicId = originalResult.public_id;
        } catch (error) {
            console.error('Failed to upload original image:', error);
            throw new InternalServerErrorException(
                'Failed to upload image. Please try again.',
            );
        }

        // 2. Generate enhanced image using Cloudinary Gen AI (server-side processing)
        let enhancedImageUrl: string;

        try {
            enhancedImageUrl = await this.processSmileEnhancement(publicId);
        } catch (error) {
            console.error('Smile enhancement failed:', error);
            throw new ServiceUnavailableException(
                'Smile enhancement service is unavailable at the moment. Please try after some time.',
            );
        }

        const processingTime = Date.now() - startTime;

        // 3. Save record to database
        const record = await this.nanoBananaModel.create({
            userId,
            originalImageUrl,
            enhancedImageUrl,
            status: 'completed',
            processingTime,
        });

        return {
            originalImageUrl,
            enhancedImageUrl,
            processingTime,
            status: 'completed',
            recordId: record._id,
        };
    }

    /**
     * Process smile enhancement using Cloudinary SDK (server-side).
     *
     * Why SDK instead of URL?
     * - URL-based transformations are lazy — the image is only processed when
     *   a browser/client first requests the URL, so we can't verify the result.
     * - SDK `explicit()` triggers immediate server-side processing and returns
     *   only after the AI has finished, so we know it worked.
     *
     * Prompt design:
     * - "from_crooked teeth" targets ONLY the teeth region.
     * - "to_natural healthy straight teeth" tells the AI to produce realistic
     *   orthodontically-corrected teeth while preserving size, count, and gums.
     * - Keeping the prompt short avoids hallucinations (extra lips, missing rows).
     */
    private async processSmileEnhancement(publicId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.explicit(
                publicId,
                {
                    type: 'upload',
                    eager: [
                        {
                            // Keep prompt minimal and natural — avoid specifying
                            // upper/lower separately as that causes size/count mismatch.
                            // "teeth" as one unit lets AI preserve natural proportions.
                            effect: 'gen_replace:from_teeth;to_straight white teeth',
                        },
                        {
                            effect: 'improve',
                        },
                        {
                            quality: 'auto:best',
                            format: 'jpg',
                        },
                    ],
                    eager_async: false,  // Wait for processing to complete
                },
                (error: any, result: any) => {
                    if (error) {
                        console.error('Cloudinary explicit processing error:', error);
                        return reject(error);
                    }

                    // Get the URL of the processed (eager) image
                    if (result?.eager?.[0]?.secure_url) {
                        const enhancedUrl = result.eager[0].secure_url;
                        console.log('=== Dental Treatment Visualization ===');
                        console.log('Original:', publicId);
                        console.log('Enhanced:', enhancedUrl);
                        console.log('======================================');
                        resolve(enhancedUrl);
                    } else {
                        console.error('No eager result returned:', JSON.stringify(result, null, 2));
                        reject(new Error('Enhancement processing returned no result'));
                    }
                },
            );
        });
    }

    /**
     * Upload a buffer to Cloudinary.
     */
    private uploadBuffer(
        buffer: Buffer,
        filename: string,
    ): Promise<{ secure_url: string; public_id: string }> {
        return new Promise((resolve, reject) => {
            const stream = this.cloudinary.uploader.upload_stream(
                {
                    folder: 'smile-previews',
                    public_id: filename,
                    resource_type: 'image',
                    quality: 'auto:best',
                },
                (error: any, result: any) => {
                    if (error) return reject(error);
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                },
            );
            stream.end(buffer);
        });
    }

    async getEnhancementHistory(userId: string) {
        return this.nanoBananaModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);
    }

    async getEnhancementById(id: string) {
        return this.nanoBananaModel.findById(id);
    }
}
