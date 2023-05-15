import { PartialType } from '@nestjs/mapped-types';
import { CreateRecentChatDto } from './create-recent-chat.dto';

export class UpdateRecentChatDto extends PartialType(CreateRecentChatDto) {}
