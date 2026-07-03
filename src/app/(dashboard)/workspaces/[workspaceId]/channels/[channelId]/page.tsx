import { ChannelView } from "@/features/channels/components/channel-view";

interface ChannelPageProps {
  params: Promise<{ workspaceId: string; channelId: string }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { workspaceId, channelId } = await params;
  return <ChannelView workspaceId={workspaceId} channelId={channelId} />;
}
