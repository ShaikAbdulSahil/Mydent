import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { ProductsModule } from './product/product.module';
import { AdminModule } from './admin/admin.module';
import { CentersModule } from './centers/centers.module';
import { TransformationModule } from './transformation/transformation.module';
import { FavModule } from './favorite/fav.module';
import { MydentAlignersModule } from './aligners/aligners.module';
import { PaymentsModule } from './payment/payment.module';
import { ContactUsModule } from './contacts/contacts.module';
import { CarouselModule } from './carousel/carousel.module';
import { DoctorModule } from './doctor/doc.module';
import { ExpertModule } from './experts/experts.module';
import { MeetModule } from './meet/meet.module';
import { ReportModule } from './report/rep.module';
import { BiteTypeModule } from './bite-type/bite-type.module';
import { BlogsModule } from './blogs/blogs.module';
import { DoctorsTeamModule } from './doctors-team/team.module';
import { CoinsModule } from './coins/coins.module';
import { TicketModule } from './ticket/ticket.module';
import { NanoBananaModule } from './nano-banana/nano-banana.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ makes config accessible app-wide
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Points to the 'public' folder in root
      // Use simple wildcard to avoid path-to-regexp unnamed capture error
      // exclude: ['/api/.*'], // Ensures API routes don't get blocked
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UserModule,
    ProductsModule,
    CarouselModule,
    CartModule,
    DoctorModule,
    AdminModule,
    CentersModule,
    TransformationModule,
    FavModule,
    MydentAlignersModule,
    PaymentsModule,
    ContactUsModule,
    ExpertModule,
    MeetModule,
    ReportModule,
    BiteTypeModule,
    BlogsModule,
    DoctorsTeamModule,
    CoinsModule,
    TicketModule,
    NanoBananaModule,
  ],
})
export class AppModule { }
