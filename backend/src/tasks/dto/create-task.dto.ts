import {
  IsString, IsOptional, IsEnum, IsUUID,
  IsDateString, MaxLength, IsNotEmpty
} from 'class-validator'

export type TaskStatus   = 'à_faire' | 'en_cours' | 'terminée' | 'annulée'
export type TaskPriority = 'basse' | 'moyenne' | 'haute' | 'urgente'

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(['à_faire', 'en_cours', 'terminée', 'annulée'])
  status?: TaskStatus

  @IsOptional()
  @IsEnum(['basse', 'moyenne', 'haute', 'urgente'])
  priority?: TaskPriority

  @IsOptional()
  @IsDateString()
  due_date?: string             // ISO string → converti en Date

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
  @IsUUID()
  assigned_to?: string          // Par défaut : l'utilisateur connecté
}