import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>you've been invited to blym ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>BLYM</Heading>
        <Heading style={h1}>you're invited bestie 💛</Heading>
        <Text style={text}>
          someone thinks you'd love{' '}
          <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>
          {' '}— the creator app that turns your wins into XP, streaks, and
          level-ups. tap below to claim your spot.
        </Text>
        <Button style={button} href={confirmationUrl}>
          accept my invite →
        </Button>
        <Text style={footer}>
          wasn't expecting this? you can safely ignore it — no account is
          created until you click.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = {
  fontSize: '13px',
  fontWeight: 900 as const,
  letterSpacing: '0.32em',
  color: '#E07A5F',
  margin: '0 0 24px',
  fontFamily: 'Arial, sans-serif',
}
const h1 = {
  fontSize: '28px',
  fontWeight: 700 as const,
  color: '#2A2520',
  lineHeight: '1.15',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#5C524C',
  lineHeight: '1.65',
  margin: '0 0 18px',
  fontFamily: 'Arial, sans-serif',
}
const link = { color: '#E07A5F', textDecoration: 'underline', fontWeight: 600 as const }
const button = {
  backgroundColor: '#E07A5F',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700 as const,
  borderRadius: '999px',
  padding: '14px 26px',
  textDecoration: 'none',
  fontFamily: 'Arial, sans-serif',
  display: 'inline-block',
  marginTop: '8px',
}
const footer = {
  fontSize: '12px',
  color: '#8A7E76',
  margin: '32px 0 0',
  fontFamily: 'Arial, sans-serif',
  fontStyle: 'italic' as const,
}
