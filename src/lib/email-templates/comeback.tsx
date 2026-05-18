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
const APP_URL = 'https://blym.life/quests'

interface ComebackProps {
  name?: string
  daysAway?: number
}

const ComebackEmail = ({ name, daysAway = 3 }: ComebackProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>we saved your spot 💛 come back when you can</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, we miss you 🥺` : 'hey bestie, we miss you 🥺'}
        </Heading>
        <Text style={text}>
          it's been {daysAway} days. life happens — no guilt, no pressure. your streak is
          paused, your quests are waiting, and your XP is exactly where you left it.
        </Text>
        <Text style={text}>
          pop back in for 2 mins and grab today's tiny quest. that's it. one little win to
          remind yourself you're still building something real.
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={APP_URL}>
            pick up where i left off
          </Button>
        </Section>
        <Text style={small}>
          come back today and we'll restore your streak as a one-time soft reset 💛
        </Text>
        <Text style={footer}>— the {SITE_NAME} team 💛</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ComebackEmail,
  subject: (data: Record<string, any>) =>
    `${data?.name ? data.name + ', w' : 'w'}e saved your spot 💛`,
  displayName: 'Comeback / re-engagement',
  previewData: { name: 'Jane', daysAway: 3 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 18px', lineHeight: '1.3' }
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