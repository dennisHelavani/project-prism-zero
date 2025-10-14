// app/dashboard/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();   // ⟵ add await
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <pre className="mt-4">{JSON.stringify({ signedIn: !!user }, null, 2)}</pre>
    </main>
  );
}
