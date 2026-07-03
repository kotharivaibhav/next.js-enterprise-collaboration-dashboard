const EMAIL_MENTION_PATTERN =
  /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export function extractMentionEmails(content: string): string[] {
  const matches = content.matchAll(EMAIL_MENTION_PATTERN);
  const emails = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      emails.add(match[1].toLowerCase());
    }
  }

  return Array.from(emails);
}

export function buildMessageMetadata(
  content: string,
  authorEmail?: string,
): Record<string, unknown> {
  const mentions = extractMentionEmails(content).filter(
    (email) => email !== authorEmail?.toLowerCase(),
  );

  return mentions.length > 0 ? { mentions } : {};
}
