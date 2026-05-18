import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>your blym login link — tap to come back ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>BLYM</Heading>
        <Heading style={h1}>welcome back bestie ✨</Heading>
        <Text style={text}>
          tap the button below to log into {siteName}. your streak, your quests,
          and your level are all waiting for you. (link expires soon — quick tap!)
        </Text>
        <Button style={button} href={confirmationUrl}>
          log me in →
        </Button>
        <Text style={footer}>
          didn't request this? ignore this email — nothing changes.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
