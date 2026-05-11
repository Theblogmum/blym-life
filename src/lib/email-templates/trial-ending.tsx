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

const SITE_NAME = 'Blym by The Blog Mum'
const APP_URL = 'https://blym.life/app'

interface TrialEndingProps {
  name?: string
  hoursLeft?: number
}

const TrialEndingEmail = ({ name, hoursLeft = 24 }: TrialEndingProps) => {
  const isFinalHour = hoursLeft <= 1
  const headline = isFinalHour
    ? `${name ? name + ', y' : 'Y'}our free trial ends in 1 hour`
    : `${name ? name + ', y' : 'Y'}our 48-hour trial ends in 24 hours`
  const intro = isFinalHour
    ? "Just a quick heads up — your free trial wraps up in about an hour. After that, your account moves onto the Free plan automatically (no charge, no surprises)."
    : "You've got one more day to play with every premium feature inside your trial. After 24 hours your account drops to the Free plan automatically — keep your free ideas, captions, planner and saves forever."

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{headline}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{headline}</Heading>
          <Text style={text}>{intro}</Text>
          <Text style={text}>
            Loved it? Lock in your plan and keep every tool unlocked — Creator, Pro
            or Ultimate — without missing a beat.
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button style={button} href={APP_URL}>
              {isFinalHour ? 'Pick a plan now' : 'See plans'}
            </Button>
          </Section>
          <Text style={small}>
            Not ready? No worries — you'll keep your free monthly allowance forever.
          </Text>
          <Text style={footer}>— The {SITE_NAME} team 💛</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TrialEndingEmail,
  subject: (data: Record<string, any>) =>
    (data?.hoursLeft ?? 24) <= 1
      ? 'Your free trial ends in 1 hour ⏰'
      : 'Your free 48-hour trial ends tomorrow',
  displayName: 'Trial ending reminder',
  previewData: { name: 'Jane', hoursLeft: 24 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1a1a1a',
  margin: '0 0 18px',
  lineHeight: '1.3',
}
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 16px' }
const small = { fontSize: '13px', color: '#71717a', lineHeight: '1.5', margin: '20px 0 0' }
const footer = { fontSize: '13px', color: '#71717a', margin: '28px 0 0' }
const button = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '999px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}