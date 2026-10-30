import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Database,
  FileUp,
  Lock,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unplug,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { APP_NAME, APP_TAGLINE, LANDING_DISCLAIMER } from '@/lib/constants'
import { PLATFORM_META } from '@/lib/platforms'
import { PLATFORMS } from '@/lib/constants'

const steps = [
  { title: 'Connect your platforms', text: 'Use official authorization placeholders or chat exports. Passwords are never requested.' },
  { title: 'Give explicit consent', text: 'You choose which sources are analyzed and can revoke access at any time.' },
  { title: 'Collect authorized text data', text: 'Permitted messages are normalized into a common internal format.' },
  { title: 'Analyze language patterns', text: 'A future Flask NLP/ML service will score textual distress indicators.' },
  { title: 'View insights and trends', text: 'Dashboards, reports, and timelines stay empty until models are connected.' },
]

const features = [
  { icon: Database, title: 'Multi-platform data management' },
  { icon: ShieldCheck, title: 'Consent-based data access' },
  { icon: Sparkles, title: 'Text analysis (API-ready)' },
  { icon: Activity, title: 'Emotional trend visualization' },
  { icon: MessageSquare, title: 'Risk indicator dashboard' },
  { icon: FileUp, title: 'Timeline analysis' },
  { icon: Lock, title: 'Privacy controls' },
  { icon: Trash2, title: 'Data deletion' },
  { icon: Unplug, title: 'Platform connection management' },
]

export function LandingPage() {
  const [menu, setMenu] = useState(false)
  return (
    <div className="bg-mesh text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div>
          <p className="text-lg font-extrabold tracking-tight text-navy">{APP_NAME}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">{APP_TAGLINE}</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="teal" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMenu((v) => !v)} aria-label="Menu">
          {menu ? <X /> : <Menu />}
        </Button>
      </header>
      {menu ? (
        <div className="mx-6 mb-4 flex flex-col gap-2 rounded-2xl border bg-white p-4 sm:hidden">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="teal" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Research screening</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-navy md:text-5xl">
            AI-Powered Mental Health Monitoring
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Analyze your personal text data to identify patterns associated with emotional distress
            and mental-health risk indicators.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="teal" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">How It Works</a>
            </Button>
          </div>
          <p className="mt-6 max-w-xl text-sm text-muted-foreground">{LANDING_DISCLAIMER}</p>
        </div>
        <Card className="glass-card p-6">
          <p className="text-sm font-semibold text-navy">Dashboard preview</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['Mental Health Overview', 'Awaiting AI Model'],
              ['Connected Platforms', '0 Connected'],
              ['Messages Analyzed', '0'],
              ['Risk Indicators', 'Not generated'],
              ['Emotional Trends', 'No trend yet'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-secondary/70 p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 font-semibold text-navy">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-navy">How It Works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {steps.map((step, i) => (
            <Card key={step.title} className="p-4">
              <p className="text-xs font-bold text-accent">0{i + 1}</p>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-bold text-navy">Supported Data Sources</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Where private-message APIs are unavailable, upload a chat export you already control.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((name) => {
            const meta = PLATFORM_META[name]
            const Icon = meta.icon
            return (
              <Card key={name} className="p-5">
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-3 font-semibold">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
              </Card>
            )
          })}
          <Card className="p-5">
            <FileUp className="h-6 w-6 text-accent" />
            <h3 className="mt-3 font-semibold">Text File</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Plain-text transcripts are accepted through Chat Export.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-navy">Key Features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="flex items-center gap-3 p-4">
              <f.icon className="h-5 w-5 text-accent" />
              <p className="font-medium">{f.title}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card className="p-8">
          <h2 className="text-3xl font-bold text-navy">Privacy</h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <li>User-controlled access — you pick every source.</li>
            <li>Explicit consent before import or analysis.</li>
            <li>Secure handling: tokens stay on the backend reference layer, not in local storage as raw secrets.</li>
            <li>Disconnect platforms anytime.</li>
            <li>Delete imported data from Privacy & Consent.</li>
            <li>No medical diagnosis language is used in results.</li>
          </ul>
        </Card>
      </section>
      <footer className="border-t bg-white/70 px-6 py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p>{APP_NAME} · {APP_TAGLINE}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-navy">Privacy</Link>
            <Link to="/terms" className="hover:text-navy">Terms</Link>
            <Link to="/login" className="hover:text-navy">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
