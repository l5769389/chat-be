import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
@Processor('msg')
export class OfflineMsgProcesssor {
  @Process('offline_msg')
  handleOffline(job: Job) {
    console.log('start');
    console.log(job.data);
  }
}
