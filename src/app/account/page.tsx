import { createClient } from "@/lib/supabase/server";
import AccountClient from "@/components/account/AccountClient";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/account");
  return (
    <AccountClient
      email={user.email ?? ""}
      displayName={user.user_metadata?.display_name ?? ""}
      avatarColor={user.user_metadata?.avatar_color ?? "#0c1e42"}
      avatarUrl={user.user_metadata?.avatar_url ?? null}
    />
  );
}
