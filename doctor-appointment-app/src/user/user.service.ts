import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  // Find user by ID (excluding password)
  async findById(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error fetching user ${id}: ${error.message}`, error.stack);
      throw err;
    }
  }

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        this.logger.warn(`User not found for update: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to update user ${id}: ${err.message}`, err.stack);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      this.logger.warn(`User not found for deletion: ${id}`);
      throw new NotFoundException('User not found');
    }
  }

  async getDoctorAssignment(id: string): Promise<any> {
    this.logger.log(`Fetching doctor assignment for user: ${id}`);
    try {
      const user = await this.userModel
        .findById(id)
        .select('assignedDoctor')
        .populate({
          path: 'assignedDoctor.doctorId',
          select: 'name specialty email specialization place',
          model: 'Doctor',
        })
        .exec();

      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (!user.assignedDoctor) {
        this.logger.warn(`No doctor assigned for user: ${id}`);
        throw new NotFoundException(
          `No doctor assigned for user with ID ${id}`,
        );
      }

      this.logger.log(`Doctor assignment found for user: ${id}`);
      return {
        doctor: user.assignedDoctor.doctorId,
        step: user.assignedDoctor.step,
        assignedAt: user.assignedDoctor.assignedAt,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to get doctor assignment for user ${id}: ${err.message}`, err.stack);
      throw error;
    }
  }
}
