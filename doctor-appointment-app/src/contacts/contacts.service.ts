import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactUs, ContactUsDocument } from './contacts.schema';
import { CreateContactUsDto } from './contacts.dto';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);

  constructor(
    @InjectModel(ContactUs.name)
    private readonly contactUsModel: Model<ContactUsDocument>,
  ) { }

  async create(createContactUsDto: CreateContactUsDto) {
    return this.contactUsModel.create(createContactUsDto);
  }

  async findAll() {
    return this.contactUsModel.find().exec();
  }

  async findOne(id: string) {
    const entry = await this.contactUsModel.findById(id).exec();
    if (!entry) {
      this.logger.warn(`Contact entry not found: ${id}`);
      throw new NotFoundException('Contact entry not found');
    }
    return entry;
  }

  async delete(id: string): Promise<void> {
    const result = await this.contactUsModel.findByIdAndDelete(id).exec();
    if (!result) {
      this.logger.warn(`Contact entry not found for deletion: ${id}`);
      throw new NotFoundException('Contact entry not found');
    }
  }

  async removeVideo(videoUrl: string): Promise<ContactUs> {
    const updated = await this.contactUsModel.findOneAndUpdate(
      { videos: videoUrl }, // find a document containing the video
      { $pull: { videos: videoUrl } }, // remove the video from array
      { new: true },
    );

    if (!updated) {
      this.logger.warn(`Video not found: ${videoUrl}`);
      throw new NotFoundException('Video not found in any document');
    }

    return updated;
  }
}
