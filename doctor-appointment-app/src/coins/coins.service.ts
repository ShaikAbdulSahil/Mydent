import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coins, CoinsDocument } from './coins.schema';
import { CreateCoinsDto, UpdateCoinsDto } from './coins.dto';

@Injectable()
export class CoinsService {
  private readonly logger = new Logger(CoinsService.name);

  constructor(
    @InjectModel(Coins.name) private coinsModel: Model<CoinsDocument>,
  ) { }

  async create(createCoinsDto: CreateCoinsDto): Promise<Coins> {
    return this.coinsModel.create(createCoinsDto);
  }

  async findAll(): Promise<Coins[]> {
    return this.coinsModel.find().exec();
  }

  async findOne(userId: string) {
    try {
      const coin = await this.coinsModel.findOne({ userId });
      if (!coin) {
        this.logger.warn(`Coins not found for user: ${userId}`);
        throw new NotFoundException('Coins not found');
      }
      return coin;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error finding coins for user ${userId}: ${error.message}`, error.stack);
      throw err;
    }
  }

  async update(id: string, updateCoinsDto: UpdateCoinsDto): Promise<Coins> {
    const updated = await this.coinsModel.findByIdAndUpdate(
      id,
      updateCoinsDto,
      {
        new: true,
      },
    );
    if (!updated) {
      this.logger.warn(`Coins not found for update: ${id}`);
      throw new NotFoundException('Coins not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.coinsModel.findByIdAndDelete(id);
    if (!result) {
      this.logger.warn(`Coins not found for deletion: ${id}`);
      throw new NotFoundException('Coins not found');
    }
  }
}
