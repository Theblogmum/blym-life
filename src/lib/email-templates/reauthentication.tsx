import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>your blym verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>BLYM</Heading>
        <Heading style={h1}>confirm it's you 🔐</Heading>
        <Text style={text}>pop this code in to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          this code expires soon. didn't request it? ignore this email and
          you're all good.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '32px',
  fontWeight: 700 as const,
  letterSpacing: '0.18em',
  color: '#E07A5F',
  backgroundColor: '#FFF7F2',
  padding: '18px 24px',
  borderRadius: '14px',
  textAlign: 'center' as const,
  margin: '0 0 30px',
}
const footer = {
  fontSize: '12px',
  color: '#8A7E76',
  margin: '32px 0 0',
  fontFamily: 'Arial, sans-serif',
  fontStyle: 'italic' as const,
}
