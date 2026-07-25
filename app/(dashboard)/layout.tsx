import { DashboardShell } from "@/components/layout/DashboardShell";
import { HelpChatWidget } from "@/features/assistant/components/HelpChatWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      {children}
      <HelpChatWidget />
    </DashboardShell>
  );
}
