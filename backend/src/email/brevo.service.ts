import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common'
import { db } from '../database/db.config'
import { emailCampaigns, communications, contacts } from '../database/schema'
import { eq, and } from 'drizzle-orm'

interface SendEmailOptions {
  to: { email: string; name: string }[]
  subject: string
  htmlContent: string
  senderName?: string
  senderEmail?: string
  replyTo?: string
  tags?: string[]
}

interface TransactionalEmailOptions {
  to: { email: string; name: string }
  templateId: number        // ID du template Brevo
  params: Record<string, any>
  contactId?: string
  leadId?: string
  createdBy: string
}

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name)
  private readonly apiKey = process.env.BREVO_API_KEY!
  private readonly baseUrl = 'https://api.brevo.com/v3'

  private async brevoRequest(endpoint: string, method: string, body?: any) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json()
      this.logger.error(`Brevo API error: ${JSON.stringify(error)}`)
      throw new InternalServerErrorException(`Erreur Brevo: ${error.message}`)
    }

    return res.json()
  }

  // Envoyer un email transactionnel (ex: bienvenue, notification)
  async sendTransactional(options: TransactionalEmailOptions) {
    const { to, templateId, params, contactId, leadId, createdBy } = options

    const result = await this.brevoRequest('/smtp/email', 'POST', {
      to: [to],
      templateId,
      params,
    })

    // Enregistrement dans l'historique des communications
    if (contactId || leadId) {
      await db.insert(communications).values({
        type:              'email',
        subject:           params.subject ?? `Template #${templateId}`,
        body:              JSON.stringify(params),
        direction:         'sortant',
        contact_id:        contactId,
        lead_id:           leadId,
        brevo_message_id:  result.messageId,
        created_by:        createdBy,
      })
    }

    return result
  }

  // Envoyer un email custom (HTML libre)
  async sendEmail(options: SendEmailOptions) {
    return this.brevoRequest('/smtp/email', 'POST', {
      sender: {
        name:  options.senderName  ?? 'CRM',
        email: options.senderEmail ?? process.env.BREVO_SENDER_EMAIL,
      },
      to:          options.to,
      subject:     options.subject,
      htmlContent: options.htmlContent,
      replyTo:     options.replyTo ? { email: options.replyTo } : undefined,
      tags:        options.tags,
    })
  }

  // Créer une campagne dans Brevo
  async createCampaign(data: {
    name: string
    subject: string
    htmlContent: string
    scheduledAt?: Date
    listIds: number[]       // IDs de listes Brevo
    createdBy: string
  }) {
    const brevoPayload: any = {
      name:        data.name,
      subject:     data.subject,
      sender:      { name: 'CRM', email: process.env.BREVO_SENDER_EMAIL },
      type:        'classic',
      htmlContent: data.htmlContent,
      recipients:  { listIds: data.listIds },
    }

    if (data.scheduledAt) {
      brevoPayload.scheduledAt = data.scheduledAt.toISOString()
    }

    const result = await this.brevoRequest('/emailCampaigns', 'POST', brevoPayload)

    // Sauvegarde en base
    const [campaign] = await db.insert(emailCampaigns).values({
      name:               data.name,
      subject:            data.subject,
      brevo_campaign_id:  result.id,
      status:             data.scheduledAt ? 'planifiée' : 'brouillon',
      scheduled_at:       data.scheduledAt,
      created_by:         data.createdBy,
    }).returning()

    return campaign
  }

  // Synchroniser les stats d'une campagne depuis Brevo
  async syncCampaignStats(campaignId: string) {
    const [campaign] = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, campaignId))
      .limit(1)

    if (!campaign?.brevo_campaign_id) return null

    const stats = await this.brevoRequest(
      `/emailCampaigns/${campaign.brevo_campaign_id}`,
      'GET'
    )

    const statistics = stats.statistics?.campaignStats?.[0]

    const [updated] = await db
      .update(emailCampaigns)
      .set({
        sent_count: statistics?.delivered ?? 0,
        open_rate:  statistics?.uniqueOpens
          ? (statistics.uniqueOpens / statistics.delivered * 100).toFixed(2)
          : null,
        click_rate: statistics?.uniqueClicks
          ? (statistics.uniqueClicks / statistics.delivered * 100).toFixed(2)
          : null,
        status:     stats.status === 'sent' ? 'envoyée' : campaign.status,
        sent_at:    stats.sentDate ? new Date(stats.sentDate) : null,
        updated_at: new Date(),
      })
      .where(eq(emailCampaigns.id, campaignId))
      .returning()

    return updated
  }

  // Automation : Email de bienvenue quand un lead est créé
  async sendLeadWelcomeEmail(params: {
    contactEmail: string
    contactName: string
    leadTitle: string
    commercialName: string
    contactId: string
    leadId: string
    createdBy: string
  }) {
    // Template Brevo #1 = email de bienvenue (à créer dans l'interface Brevo)
    return this.sendTransactional({
      to: { email: params.contactEmail, name: params.contactName },
      templateId: 1,
      params: {
        CONTACT_NAME:    params.contactName,
        LEAD_TITLE:      params.leadTitle,
        COMMERCIAL_NAME: params.commercialName,
      },
      contactId:  params.contactId,
      leadId:     params.leadId,
      createdBy:  params.createdBy,
    })
  }

  // Automation : Relance automatique si lead inactif > 7 jours
  async sendFollowUpEmail(params: {
    contactEmail: string
    contactName: string
    leadTitle: string
    daysInactive: number
    contactId: string
    leadId: string
    createdBy: string
  }) {
    return this.sendTransactional({
      to: { email: params.contactEmail, name: params.contactName },
      templateId: 2,  // Template relance dans Brevo
      params: {
        CONTACT_NAME:  params.contactName,
        LEAD_TITLE:    params.leadTitle,
        DAYS_INACTIVE: params.daysInactive,
      },
      contactId: params.contactId,
      leadId:    params.leadId,
      createdBy: params.createdBy,
    })
  }

  // Ajouter un contact à une liste Brevo (pour les campagnes)
  async addContactToList(email: string, firstName: string, lastName: string, listId: number) {
    try {
      // Création ou mise à jour du contact dans Brevo
      await this.brevoRequest('/contacts', 'POST', {
        email,
        attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
        listIds: [listId],
        updateEnabled: true,
      })
    } catch (err) {
      this.logger.warn(`Impossible d'ajouter ${email} à la liste Brevo ${listId}`)
    }
  }
}
