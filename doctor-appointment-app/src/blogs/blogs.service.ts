// blog.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.schema';
import { Model } from 'mongoose';
import { CreateBlogDto, EditBlogDto } from './blogs.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) { }

  async createBlog(data: CreateBlogDto) {
    return this.blogModel.create(data);
  }

  async getAllBlogs() {
    return await this.blogModel.find().sort({ createdAt: -1 });
  }

  async getBlogById(id: string) {
    return await this.blogModel.findById(id);
  }

  async editBlog(id: string, data: EditBlogDto) {
    const updated = await this.blogModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      this.logger.warn(`Blog not found for update: ${id}`);
    }
    return updated;
  }

  async deleteBlog(id: string) {
    const result = await this.blogModel.findByIdAndDelete(id);
    if (!result) {
      this.logger.warn(`Blog not found for deletion: ${id}`);
    }
    return result;
  }
}
