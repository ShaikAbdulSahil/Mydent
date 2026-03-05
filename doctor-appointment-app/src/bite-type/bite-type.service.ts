import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BiteType } from './bite-type.schema';
import { BiteTypeDto, UpdateBiteTypeDto } from './bite-type.dto';

@Injectable()
export class BiteTypeService {
  private readonly logger = new Logger(BiteTypeService.name);

  constructor(
    @InjectModel(BiteType.name)
    private readonly biteTypeModel: Model<BiteType>,
  ) { }

  async create(createContactUsDto: BiteTypeDto) {
    return this.biteTypeModel.create(createContactUsDto);
  }

  async findAll() {
    return this.biteTypeModel.find().exec();
  }

  async update(id: string, updateDto: UpdateBiteTypeDto) {
    const updated = await this.biteTypeModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      this.logger.warn(`Bite type not found for update: ${id}`);
      throw new NotFoundException('Bite type not found');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.biteTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      this.logger.warn(`Bite type not found for deletion: ${id}`);
      throw new NotFoundException('Bite type not found');
    }
  }
}
