import { AssistantClient } from "@/components/AssistantClient";
import { getProfileById, profileToChatContext } from "@/lib/mock-data";

type Props = { searchParams: Promise<{ customer?: string }> };

export default async function AssistantPage({ searchParams }: Props) {
  const { customer } = await searchParams;
  const profile = customer ? getProfileById(customer) : undefined;
  const initialContext = profile ? profileToChatContext(profile) : null;

  return (
    <AssistantClient
      initialContext={initialContext}
      customerLabel={profile ? `${profile.searchRow.name} (${profile.searchRow.idNumber})` : undefined}
    />
  );
}
