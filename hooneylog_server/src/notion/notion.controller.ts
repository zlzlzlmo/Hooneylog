import { Controller, Get, Param } from '@nestjs/common';
import { NotionService } from './notion.service';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}
  @Get('all')
  getAllPost() {
    return this.notionService.getAllPost();
  }

  @Get(':id')
  getPostById(@Param('id') id: string) {
    return this.notionService.getPostById(id);
  }

  @Get('blocks/:id')
  getBlocksById(@Param('id') id: string) {
    return this.notionService.getBlocksById(id);
  }
}
