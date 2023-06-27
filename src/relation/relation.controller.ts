import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RelationService } from './relation.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { Public } from '../decorator/public/public.decorator';
import { AnswerInviteDto } from "./dto/answer-invite.dto";

@Controller('relation')
export class RelationController {
  constructor(private readonly relationService: RelationService) {}

  @Public()
  @Post()
  async invite(@Body() createRelationDto: CreateRelationDto) {
    return await this.relationService.invite(createRelationDto);
  }

  @Public()
  @Post('/submit/inviteAnswer')
  async receiveInviteAnswer(@Body() answerInviteDto: AnswerInviteDto){
      return await this.relationService.create(answerInviteDto);
  }

  @Get()
  findAll() {
    return this.relationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRelationDto: UpdateRelationDto,
  ) {
    return this.relationService.update(+id, updateRelationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relationService.remove(+id);
  }
}
