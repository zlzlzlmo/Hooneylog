import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotionModule } from './notion/notion.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NotionModule,
    ConfigModule.forRoot({
      isGlobal: true, // 환경 변수를 전역으로 사용
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
