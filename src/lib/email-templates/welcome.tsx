import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Blym'
const APP_URL = 'https://blym.life/welcome'

interface WelcomeProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>welcome to {SITE_NAME} bestie — your creator era starts now 💛</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `hi ${name} 💛` : 'hi bestie 💛'}
        </Heading>
        <Text style={text}>
          You're in. {SITE_NAME} is your soft-but-serious little corner of the internet
          where we build your creator era one tiny quest at a time. no pressure, no burnout — just daily wins.
        </Text>
        <Text style={text}>
          Here's what to do in the next 2 minutes:
        </Text>
        <Text style={text}>
          1. pick your avatar + creator type<br />
          2. choose your era (soft / hot / mum / ceo)<br />
          3. grab your first quest (+25 XP welcome bonus 🎁)
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={APP_URL}>
            start my journey →
          </Button>
        </Section>
        <Text style={small}>
          tomorrow we'll check in with your day-2 quest. show up for 7 days in a row and
          you unlock your first achievement 🔥
        </Text>
        <Text style={footer}>— the {SITE_NAME} team 💛</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: "welcome to Blym bestie 💛 your creator era starts now",
  displayName: 'Welcome email',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 18px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 16px' }
const small = { fontSize: '13px', color: '#71717a', lineHeight: '1.5', margin: '20px 0 0' }
const footer = { fontSize: '13px', color: '#71717a', margin: '28px 0 0' }
const button = {
  backgroundColor: '#E07A5F',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '999px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
}