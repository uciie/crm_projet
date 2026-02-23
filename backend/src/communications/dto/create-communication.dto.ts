import {
  IsEnum, IsOptional, IsString, IsUUID,
  IsInt, Min, IsDateString, IsNotEmpty, MaxLength
} from 'class-validator'

export type CommType      = 'email' | 'appel' | 'réunion' | 'note' | 'sms'
export type CommDirection = 'entrant' | 'sortant'

export class CreateCommunicationDto {
  @IsEnum(['email', 'appel', 'réunion', 'note', 'sms'])
  type: CommType

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string

  @IsOptional()
  @IsString()
  body?: string

  @IsOptional()
  @IsEnum(['entrant', 'sortant'])
  direction?: CommDirection

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_min?: number         // Pour les appels/réunions

  @IsOptional()
  @IsDateString()
  scheduled_at?: string         // Date planifiée (réunion future)

  @IsOptional()
  @IsDateString()
  occurred_at?: string          // Date réelle (par défaut NOW())

  @IsOptional()
  @IsUUID()
  contact_id?: string

  @IsOptional()
  @IsUUID()
  lead_id?: string

  @IsOptional()
  @IsUUID()
  company_id?: string

  @IsOptional()
  @IsString()
  brevo_message_id?: string
}