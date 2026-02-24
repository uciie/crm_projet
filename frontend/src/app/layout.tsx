import { AuthGuard }      from '@/components/auth/AuthGuard'
import { RoleNavigation } from '@/components/auth/AuthGuard'
import { Header }         from '@/components/layout/Header'
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthGuard>
          <div className="flex h-screen overflow-hidden bg-gray-50">
            <RoleNavigation />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}