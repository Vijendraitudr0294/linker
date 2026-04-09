# Resend Email API Reference (Project Use)

This file stores the Resend examples in one place for our app.

Important:
- Do not hardcode API keys in source code.
- Use environment variable: `RESEND_API_KEY`.

## Install

```bash
npm install resend
```

## Setup

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

## Send Email

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'hello world',
  html: '<p>it works!</p>',
});
```

## Send Batch Emails

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.batch.send([
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['foo@gmail.com'],
    subject: 'hello world',
    html: '<h1>it works!</h1>',
  },
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['bar@outlook.com'],
    subject: 'world hello',
    html: '<p>it works!</p>',
  },
]);
```

## Retrieve Email

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');
```

## Update Email

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const oneMinuteFromNow = new Date(Date.now() + 1000 * 60).toISOString();

await resend.emails.update({
  id: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  scheduledAt: oneMinuteFromNow,
});
```

## Cancel Email

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.cancel('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');
```

## List Emails

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.list();
```

## List Attachments

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.attachments.list({
  emailId: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
});
```

## Retrieve Attachment

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.attachments.get({
  id: '4a90a90a-90a9-0a90-a90a-90a90a90a90a',
  emailId: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
});
```

## .env Example

```env
RESEND_API_KEY=re_xxxxxxxxx
```
