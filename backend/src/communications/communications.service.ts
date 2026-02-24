import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { db } from '../database/neon.config'
import { communications, profiles, contacts, leads } from '../database/schema'
import { eq, and, or, desc, sql } from 'drizzle-orm'
import { CreateCommunicationDto } from './dto/create-communication.dto'
import { AuthUser } from '../contacts/contacts.service'

@Injectable()
export class CommunicationsService {

  // Historique d'un contact ou d'un lead (timeline)
  async getTimeline(params: {
    contact_id?: string
    lead_id?:    string
    company_id?: string
    page?:       number
    limit?:      number
  }) {
    const { contact_id, lead_id, company_id, page = 1, limit = 30 } = params
    const offset = (page - 1) * limit

    const conditions: any[] = []
    if (contact_id) conditions.push(eq(communications.contact_id, contact_id))
    if (lead_id)    conditions.push(eq(communications.lead_id, lead_id))
    if (company_id) conditions.push(eq(communications.company_id, company_id))

    const whereClause = conditions.length > 0 ? or(...conditions) : undefined

    const rows = await db
      .select({
        id:               communications.id,
        type:             communications.type,
        subject:          communications.subject,
        body:             communications.body,
        direction:        communications.direction,
        duration_min:     communications.duration_min,
        scheduled_at:     communications.scheduled_at,
        occurred_at:      communications.occurred_at,
        brevo_message_id: communications.brevo_message_id,
        created_at:       communications.created_at,
        author: {
          id:         profiles.id,
          full_name:  profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(communications)
      .leftJoin(profiles, eq(communications.created_by, profiles.id))
      .where(whereClause)
      .orderBy(desc(communications.occurred_at))
      .limit(limit)
      .offset(offset)

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(whereClause)

    return {
      data: rows,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) }
    }
  }

  async create(dto: CreateCommunicationDto, userId: string) {
    const [comm] = await db
      .insert(communications)
      .values({
        type:             dto.type,
        subject:          dto.subject,
        body:             dto.body,
        direction:        dto.direction,
        duration_min:     dto.duration_min,
        scheduled_at:     dto.scheduled_at ? new Date(dto.scheduled_at) : undefined,
        occurred_at:      dto.occurred_at  ? new Date(dto.occurred_at)  : new Date(),
        contact_id:       dto.contact_id,
        lead_id:          dto.lead_id,
        company_id:       dto.company_id,
        brevo_message_id: dto.brevo_message_id,
        created_by:       userId,
      })
      .returning()

    return comm
  }

  async remove(id: string, userId: string) {
    // Seul le créateur ou un admin peut supprimer une communication
    const [comm] = await db
      .select()
      .from(communications)
      .where(eq(communications.id, id))
      .limit(1)
    if (comm.created_by !== userId && role !== 'admin') 
      throw new ForbiddenException('Accès refusé : vous n\'êtes pas le créateur de cette communication ou administrateur.')
    if (!comm) throw new NotFoundException('Communication introuvable')

    await db.delete(communications).where(eq(communications.id, id))
    return { message: 'Communication supprimée' }
  }

  // Statistiques globales des communications
  async getStats(userId: string, role: string) {
    const isAdmin = role === 'admin'

    const result = await db.execute(sql`
      SELECT
        COUNT(*)                                                      AS total,
        COUNT(*) FILTER (WHERE type = 'email')                        AS emails,
        COUNT(*) FILTER (WHERE type = 'appel')                        AS calls,
        COUNT(*) FILTER (WHERE type = 'réunion')                      AS meetings,
        COUNT(*) FILTER (WHERE occurred_at >= date_trunc('week', NOW())) AS this_week
      FROM communications
      ${!isAdmin ? sql`WHERE created_by = ${userId}` : sql``}
    `)
    const stats = result.rows[0];

    return {
      total:     Number((stats as any).total),
      emails:    Number((stats as any).emails),
      calls:     Number((stats as any).calls),
      meetings:  Number((stats as any).meetings),
      this_week: Number((stats as any).this_week),
    }
  }
}