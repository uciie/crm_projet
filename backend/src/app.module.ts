import { ConfigModule }      from '@nestjs/config'
import { AuthModule }        from './auth/auth.module'
import { ContactsModule }    from './contacts/contacts.module'
//import { LeadsModule }       from './leads/leads.module'
import { PipelineModule }    from './pipeline/pipeline.module'
import { TasksModule }       from './tasks/tasks.module'
import { CommunicationsModule } from './communications/communications.module'
//import { EmailModule }       from './email/email.module'
//import { DashboardModule }   from './dashboard/dashboard.module'
//
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,           //← enregistre JwtAuthGuard et RolesGuard globalement
    ContactsModule,
    //CompaniesModule,
    //LeadsModule,
    PipelineModule,
    TasksModule,
    CommunicationsModule,
    //EmailModule,
    //DashboardModule,
  ],
})
export class AppModule {}