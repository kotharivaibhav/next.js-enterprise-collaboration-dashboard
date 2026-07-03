import { DocumentsLayoutShell } from "@/features/documents/components/documents-layout-shell";

export default function WorkspaceDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocumentsLayoutShell>{children}</DocumentsLayoutShell>;
}
