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

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>confirm your new email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>BLYM</Heading>
        <Heading style={h1}>confirm your new email 💌</Heading>
        <Text style={text}>
          you asked to move your {siteName} account from{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>. tap below to confirm and you're done.
        </Text>
        <Button style={button} href={confirmationUrl}>
          confirm new email →
        </Button>
        <Text style={footer}>
          didn't request this? please secure your account immediately — we
          take this seriously 💛
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
