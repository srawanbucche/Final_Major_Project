import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { APP_NAME, LANDING_DISCLAIMER, MEDICAL_DISCLAIMER } from '@/lib/constants'

export function LegalPage({ kind }: { kind: 'terms' | 'privacy' }) {
  const title = kind === 'terms' ? 'Terms of Use' : 'Privacy Policy'
  return (
    <div className="bg-mesh min-h-svh px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" asChild>
          <Link to="/">Back</Link>
        </Button>
        <Card className="mt-4 space-y-4 p-8 text-sm leading-relaxed text-muted-foreground">
          <h1 className="text-3xl font-bold text-navy">{title}</h1>
          <p>{LANDING_DISCLAIMER}</p>
          {kind === 'privacy' ? (
            <>
              <p>
                {APP_NAME} is a research screening application. You control which sources are connected.
                We never ask for Instagram, WhatsApp, Telegram, or Snapchat passwords. Official OAuth
                or user-provided exports are the only supported paths.
              </p>
              <p>
                Platform tokens belong on a secure backend. The browser keeps a session token only.
                You may revoke consent, disconnect platforms, and delete imported data at any time.
              </p>
            </>
          ) : (
            <>
              <p>
                By creating an account you agree to use this tool for personal research and
                early-risk screening. Results, when models are connected, are AI-generated screening
                indicators and require further assessment by a qualified professional.
              </p>
              <p>Do not use the product as a crisis service or medical diagnostic system.</p>
            </>
          )}
          <p>{MEDICAL_DISCLAIMER}</p>
        </Card>
      </div>
    </div>
  )
}
