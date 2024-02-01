// SnsProxyModule
import { ProxySendMessage } from '../../data/protocols/sns/send-message';
import { SnsProxy } from './sns-proxy';
import { Module } from '@nestjs/common';

@Module({
  imports: [SnsProxy],
  providers: [
    {
      provide: ProxySendMessage,
      useClass: SnsProxy,
    },
  ],
  exports: [SnsProxy],
})
export class SnsProxyModule {}
