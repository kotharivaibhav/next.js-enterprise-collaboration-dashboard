import { DocumentEditor } from "@/features/documents/components/document-editor";

interface DocumentPageProps {
  params: Promise<{ workspaceId: string; documentId: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { workspaceId, documentId } = await params;
  return <DocumentEditor workspaceId={workspaceId} documentId={documentId} />;
}
