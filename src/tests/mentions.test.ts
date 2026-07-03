import { describe, expect, it } from "vitest";

import {
  buildMessageMetadata,
  extractMentionEmails,
} from "@/features/channels/utils/mentions";

describe("extractMentionEmails", () => {
  it("extracts email mentions from content", () => {
    const emails = extractMentionEmails(
      "Hey @alice@company.com and @bob@collabforge.io check this",
    );
    expect(emails).toEqual(["alice@company.com", "bob@collabforge.io"]);
  });

  it("returns empty array when no mentions", () => {
    expect(extractMentionEmails("Hello team")).toEqual([]);
  });
});

describe("buildMessageMetadata", () => {
  it("excludes author from mentions", () => {
    const metadata = buildMessageMetadata(
      "FYI @author@company.com",
      "author@company.com",
    );
    expect(metadata).toEqual({});
  });

  it("includes mention emails in metadata", () => {
    const metadata = buildMessageMetadata(
      "Ping @peer@company.com",
      "author@company.com",
    );
    expect(metadata).toEqual({ mentions: ["peer@company.com"] });
  });
});
