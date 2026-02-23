# crm_projet

crm_projet/
├── README.md
├── .gitignore
├── docker-compose.yml              # Bonus : environnement local unifié
│
├── frontend/                       # Application Next.js
│   ├── .env.local                  # Variables d'env (NEXT_PUBLIC_SUPABASE_URL, etc.)
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   │
│   ├── public/
│   │   └── logo.svg
│   │
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx          # Layout racine (providers, fonts)
│       │   ├── page.tsx            # Page d'accueil / redirect
│       │   │
│       │   ├── (auth)/             # Groupe de routes public (non protégé)
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   └── register/
│       │   │       └── page.tsx
│       │   │
│       │   └── (dashboard)/        # Groupe de routes protégées
│       │       ├── layout.tsx      # Layout avec sidebar + vérif auth
│       │       ├── dashboard/
│       │       │   └── page.tsx    # Statistiques & KPIs
│       │       ├── contacts/
│       │       │   ├── page.tsx    # Liste des contacts
│       │       │   └── [id]/
│       │       │       └── page.tsx # Fiche contact détaillée
│       │       ├── companies/
│       │       │   ├── page.tsx
│       │       │   └── [id]/
│       │       │       └── page.tsx
│       │       ├── leads/
│       │       │   └── page.tsx
│       │       ├── pipeline/
│       │       │   └── page.tsx    # Vue Kanban
│       │       ├── tasks/
│       │       │   └── page.tsx
│       │       ├── campaigns/
│       │       │   └── page.tsx    # Campagnes Brevo
│       │       └── settings/
│       │           └── page.tsx    # Gestion des utilisateurs (Admin)
│       │
│       ├── components/
│       │   ├── ui/                 # Composants génériques (Button, Modal, Table...)
│       │   │   ├── Button.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── DataTable.tsx
│       │   │   ├── Badge.tsx
│       │   │   └── Spinner.tsx
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   └── MobileNav.tsx
│       │   ├── contacts/
│       │   │   ├── ContactCard.tsx
│       │   │   ├── ContactForm.tsx
│       │   │   └── ContactFilters.tsx
│       │   ├── pipeline/
│       │   │   ├── KanbanBoard.tsx
│       │   │   ├── KanbanColumn.tsx
│       │   │   └── DealCard.tsx
│       │   └── dashboard/
│       │       ├── StatsCard.tsx
│       │       ├── ConversionChart.tsx
│       │       └── ActivityFeed.tsx
│       │
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts       # Client Supabase côté navigateur
│       │   │   └── server.ts       # Client Supabase côté serveur (RSC)
│       │   ├── api.ts              # Client HTTP vers le backend NestJS
│       │   └── utils.ts            # Fonctions utilitaires
│       │
│       ├── hooks/
│       │   ├── useAuth.ts          # Hook gestion authentification
│       │   ├── useContacts.ts
│       │   └── useLeads.ts
│       │
│       ├── store/                  # Zustand ou Context API
│       │   └── authStore.ts
│       │
│       └── types/
│           └── index.ts            # Types TypeScript (Contact, Lead, etc.)
│
└── backend/                        # Application NestJS
    ├── .env                        # Variables d'env (DB, JWT, BREVO_API_KEY)
    ├── tsconfig.json
    ├── package.json
    │
    └── src/
        ├── main.ts                 # Point d'entrée NestJS
        ├── app.module.ts           # Module racine
        │
        ├── config/
        │   └── supabase.config.ts  # Configuration Supabase Admin client
        │
        ├── auth/
        │   ├── auth.module.ts
        │   ├── auth.controller.ts
        │   ├── auth.service.ts
        │   ├── jwt.strategy.ts     # Stratégie Passport JWT
        │   ├── jwt-auth.guard.ts   # Guard protège les routes
        │   └── roles.guard.ts      # Guard vérifie le rôle
        │
        ├── contacts/
        │   ├── contacts.module.ts
        │   ├── contacts.controller.ts
        │   ├── contacts.service.ts
        │   └── dto/
        │       ├── create-contact.dto.ts
        │       └── update-contact.dto.ts
        │
        ├── companies/
        │   ├── companies.module.ts
        │   ├── companies.controller.ts
        │   └── companies.service.ts
        │
        ├── leads/
        │   ├── leads.module.ts
        │   ├── leads.controller.ts
        │   └── leads.service.ts
        │
        ├── pipeline/
        │   ├── pipeline.module.ts
        │   ├── pipeline.controller.ts
        │   └── pipeline.service.ts
        │
        ├── tasks/
        │   ├── tasks.module.ts
        │   ├── tasks.controller.ts
        │   └── tasks.service.ts
        │
        ├── communications/
        │   ├── communications.module.ts
        │   ├── communications.controller.ts
        │   └── communications.service.ts
        │
        ├── email/
        │   ├── email.module.ts
        │   ├── email.service.ts    # Intégration Brevo API
        │   └── brevo.client.ts
        │
        └── dashboard/
            ├── dashboard.module.ts
            ├── dashboard.controller.ts
            └── dashboard.service.ts  # Agrégation des KPIs