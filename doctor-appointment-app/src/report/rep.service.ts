import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from 'src/report/rep.schema';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,
  ) { }

  async createReport(data: { imageUrl: string; userId: string }) {
    const report = new this.reportModel({
      imageUrl: data.imageUrl,
      user: data.userId,
    });
    return report.save();
  }

  async findReportsByUser(userId: string) {
    return this.reportModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async deleteReport(id: string) {
    const result = await this.reportModel.findByIdAndDelete(id);
    if (!result) {
      this.logger.warn(`Report not found for deletion: ${id}`);
    }
    return result;
  }

  async updateReport(id: string, imageUrl: string) {
    const updated = await this.reportModel.findByIdAndUpdate(id, { imageUrl }, { new: true });
    if (!updated) {
      this.logger.warn(`Report not found for update: ${id}`);
    }
    return updated;
  }
}
