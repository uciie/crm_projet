'use client'

import { useState }      from 'react'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { AuthLayout }    from '@/components/auth/AuthLayout'
import {
  AuthInput,
  AuthButton,
  AuthAlert,
}                        from '@/components/auth/AuthUI'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
}                        from '@/lib/auth.schemas'
import { authService }   from '@/lib/auth.service'

// ── Page ─────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [sentEmail, setSentEmail]     = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null)
    const { error } = await authService.resetPasswordRequest(data.email)
    if (error) {
      setServerError(error)
      return
    }
    setSentEmail(data.email)
  }

  // ── Success state ────────────────────────────────────────

  if (sentEmail) {
    return (
      <AuthLayout
        title="Email envoye"
        backHref="/login"
        backLabel="Retour a la connexion"
      >
        <div className="space-y-5">
          <AuthAlert
            type="success"
            message={`Un lien de reinitialisation a ete envoye a ${sentEmail}.`}
          />

          <div className="border border-slate-800 p-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Verifiez votre boite de reception et vos spams. Le lien est valable{' '}
              <span className="text-slate-200 font-semibold">60 minutes</span>.
            </p>
          </div>

          <p className="text-center text-xs text-slate-700">
            Email non recu ?{' '}
            <button
              type="button"
              onClick={() => { setSentEmail(null); setServerError(null) }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Renvoyer
            </button>
          </p>
        </div>
      </AuthLayout>
    )
  }

  // ── Form ─────────────────────────────────────────────────

  return (
    <AuthLayout
      title="Mot de passe oublie"
      subtitle="Entrez votre email pour recevoir un lien de reinitialisation."
      backHref="/login"
      backLabel="Retour a la connexion"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {serverError && <AuthAlert type="error" message={serverError} />}

        <AuthInput
          label="Adresse email"
          type="email"
          placeholder="nom@entreprise.com"
          autoComplete="email"
          autoFocus
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="pt-1">
          <AuthButton type="submit" loading={isSubmitting}>
            Envoyer le lien
          </AuthButton>
        </div>

      </form>
    </AuthLayout>
  )
}