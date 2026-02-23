import { PartialType } from '@nestjs/mapped-types'
import { CreateTaskDto } from './create-task.dto'
import { IsOptional, IsDateString } from 'class-validator'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsDateString()
  completed_at?: string         // Renseigné quand status → 'terminée'
}