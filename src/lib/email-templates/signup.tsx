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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>welcome to blym bestie — confirm your email ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>BLYM</Heading>
        <Heading style={h1}>welcome bestie ✨</Heading>
        <Text style={text}>
          you just took the first step of your creator journey on{' '}
          <Link href={siteUrl} style={link}>blym</Link>. one quick click to
          confirm your email ({recipient}) and you're in.
        </Text>
        <Text style={text}>
          inside: daily quests, XP, streaks, level-ups — built for real life,
          not 22-year-olds with 12 free hours a day. 💛
        </Text>
        <Button style={button} href={confirmationUrl}>
          confirm my email →
        </Button>
        <Text style={footer}>
          didn't sign up? no stress — just ignore this email and we'll never
          message you again.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
