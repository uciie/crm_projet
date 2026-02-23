import { Module } from '@nestjs/common'
import { CommunicationsController } from './communications.controller'
import { CommunicationsService }    from './communications.service'

@Module({
  controllers: [CommunicationsController],
  providers:   [CommunicationsService],
  exports:     [CommunicationsService],   // Utilisé par LeadsModule, ContactsModule
})
export class CommunicationsModule {}