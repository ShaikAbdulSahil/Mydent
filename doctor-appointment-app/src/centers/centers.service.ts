/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Centers } from './centers.schema';
import mongoose, { Model } from 'mongoose';
import { deleteFromCloudinary } from 'src/utils/cloudinary';

@Injectable()
export class CentersService {
  private readonly logger = new Logger(CentersService.name);

  constructor(
    @InjectModel(Centers.name) private centersModel: Model<Centers>,
  ) { }

  // Add new center (city)
  async addCenter(data: { cityName: string; imageUrl: string }) {
    return this.centersModel.create(data);
  }

  // Add clinic to existing center by cityName
  async addClinicToCenter(
    cityName: string,
    clinicData: {
      clinicName: string;
      clinicImage: string;
      address: string;
      timeFrom: string;
      timeTo: string;
      centerNumber: string;
      directions?: string;
    },
  ) {
    const updateResult = await this.centersModel.updateOne(
      { cityName },
      { $push: { clinic: clinicData } },
    );

    if (updateResult.matchedCount === 0) {
      this.logger.warn(`Center not found: ${cityName}`);
      throw new Error(`Center with cityName "${cityName}" not found`);
    }

    return updateResult;
  }

  async getCenters() {
    return this.centersModel.find().lean();
  }

  async deleteCenter(id: string): Promise<boolean> {
    const center = await this.centersModel.findById(id).exec();
    if (!center) {
      this.logger.warn(`Center not found: ${id}`);
      return false;
    }

    if (center.imageUrl) {
      try {
        await deleteFromCloudinary(center.imageUrl);
      } catch (err) {
        const error = err as Error;
        this.logger.error(`Failed to delete center image: ${error.message}`);
      }
    }

    if (center.clinic && Array.isArray(center.clinic)) {
      for (const c of center.clinic) {
        if (c.clinicImage) {
          try {
            await deleteFromCloudinary(c.clinicImage);
          } catch (err) {
            const error = err as Error;
            this.logger.error(`Failed to delete clinic image: ${error.message}`);
          }
        }
      }
    }

    await this.centersModel.findByIdAndDelete(id).exec();
    return true;
  }

  async editClinic(centerId: string, clinicId: string, updateData: any) {
    const center = await this.centersModel.findById(centerId);

    const clinic = center?.clinic?.find((c) => c?._id?.toString() === clinicId);

    if (!clinic) {
      this.logger.warn(`Clinic not found: ${clinicId}`);
      throw new Error('Clinic not found');
    }

    if (updateData.clinicImage && clinic.clinicImage) {
      await deleteFromCloudinary(clinic.clinicImage);
    }

    // ✅ Use ObjectId to ensure type match in query
    const result = await this.centersModel.updateOne(
      { _id: centerId, 'clinic._id': new mongoose.Types.ObjectId(clinicId) },
      {
        $set: Object.entries(updateData).reduce(
          (acc: Record<string, any>, [key, value]) => {
            acc[`clinic.$.${key}`] = value;
            return acc;
          },
          {},
        ),
      },
    );
    return result;
  }

  async deleteClinic(centerId: string, clinicId: string): Promise<boolean> {
    const result = await this.centersModel.updateOne(
      { _id: centerId },
      { $pull: { clinic: { _id: clinicId } } },
    );
    const success = result.modifiedCount > 0;
    if (!success) {
      this.logger.warn(`Clinic not found or already deleted: ${clinicId}`);
    }
    return success;
  }

  // Add a new service to a center
  async addServiceByCity({
    cityName,
    service,
  }: {
    cityName: string;
    service: {
      title: string;
      description: string;
      image: string;
    };
  }) {
    return this.centersModel.updateOne(
      { cityName: new RegExp(`^${cityName}$`, 'i') },
      { $push: { services: service } },
    );
  }

  // Get all services of a center
  async getServices(centerId: string) {
    const center = await this.centersModel.findById(centerId).lean();
    if (!center) {
      this.logger.warn(`Center not found: ${centerId}`);
      throw new Error('Center not found');
    }
    return center.services || [];
  }

  // Update a specific service by centerId and serviceId
  async updateService(centerId: string, serviceId: number, updateData: any) {
    const center = await this.centersModel.findById(centerId).exec();
    if (!center) {
      this.logger.warn(`Center not found: ${centerId}`);
      throw new Error('Center not found');
    }

    const index = center.services?.findIndex((s: any) => s.id === serviceId);
    if (index === -1 || index === undefined) {
      this.logger.warn(`Service not found: ${serviceId}`);
      throw new Error('Service not found');
    }

    const keyMap = Object.entries(updateData).reduce(
      (acc: Record<string, any>, [key, value]) => {
        acc[`services.${index}.${key}`] = value;
        return acc;
      },
      {},
    );

    return this.centersModel.updateOne({ _id: centerId }, { $set: keyMap });
  }

  // Delete a service by centerId and serviceId
  async deleteService(centerId: string, serviceId: number) {
    const result = await this.centersModel.updateOne(
      { _id: centerId },
      { $pull: { services: { id: serviceId } } },
    );
    const success = result.modifiedCount > 0;
    if (!success) {
      this.logger.warn(`Service not found or already deleted: ${serviceId}`);
    }
    return success;
  }
}
