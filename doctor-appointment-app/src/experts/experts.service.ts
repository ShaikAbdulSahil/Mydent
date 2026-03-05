import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expert } from './experts.schema';
import { deleteFromCloudinary } from 'src/utils/cloudinary';

@Injectable()
export class ExpertService {
  private readonly logger = new Logger(ExpertService.name);

  constructor(@InjectModel(Expert.name) private expertModel: Model<Expert>) { }

  async createExpert(data: { title: string; imageUrl: string }) {
    const expert = new this.expertModel(data);
    return expert.save();
  }

  async getAllExperts() {
    return this.expertModel.find().sort({ createdAt: -1 });
  }

  async deleteExpert(id: string): Promise<{ deleted: boolean }> {
    const result = await this.expertModel.findByIdAndDelete(id);
    if (!result) {
      this.logger.warn(`Expert not found: ${id}`);
      throw new NotFoundException(`Expert with ID ${id} not found`);
    }
    await deleteFromCloudinary(result.imageUrl);
    return { deleted: true };
  }

  async updateExpert(id: string, data: { title?: string; imageUrl?: string }) {
    const expert = await this.expertModel.findById(id);
    if (!expert) {
      this.logger.warn(`Expert not found for update: ${id}`);
      throw new NotFoundException(`Expert with ID ${id} not found`);
    }

    if (data.imageUrl && expert.imageUrl !== data.imageUrl) {
      await deleteFromCloudinary(expert.imageUrl); // remove old image
      expert.imageUrl = data.imageUrl;
    }

    if (data.title) expert.title = data.title;

    return expert.save();
  }
}
