import {
  Controller, Get, Post, Delete,
  Body, Query, Param, Request,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CommunicationsService } from './communications.service'
import { CreateCommunicationDto } from './dto/create-communication.dto'

@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  // GET /communications/timeline?contact_id=xxx&page=1
  @Get('timeline')
  getTimeline(
    @Query('contact_id') contact_id?: string,
    @Query('lead_id')    lead_id?:    string,
    @Query('company_id') company_id?: string,
    @Query('page')       page?:       number,
    @Query('limit')      limit?:      number,
  ) {
    return this.communicationsService.getTimeline({ contact_id, lead_id, company_id, page, limit })
  }

  // GET /communications/stats
  @Get('stats')
  getStats(@Request() req: any) {
    return this.communicationsService.getStats(req.user.id, req.user.role)
  }

  // POST /communications
  @Post()
  create(@Body() dto: CreateCommunicationDto, @Request() req: any) {
    return this.communicationsService.create(dto, req.user.id)
  }

  // DELETE /communications/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.communicationsService.remove(id, req.user.id, req.user.role)
  }
}