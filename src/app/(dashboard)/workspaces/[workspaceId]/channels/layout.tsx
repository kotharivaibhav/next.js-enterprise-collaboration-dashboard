import { ChannelsLayoutShell } from "@/features/channels/components/channels-layout-shell";

export default function WorkspaceChannelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChannelsLayoutShell>{children}</ChannelsLayoutShell>;
}
