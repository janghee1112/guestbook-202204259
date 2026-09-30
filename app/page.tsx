import { connection } from "next/server";
import Guestbook from "@/components/Guestbook";
import Hero from "@/components/Hero";
import { getDb } from "@/lib/db";
import { listEntries } from "@/lib/guestbook";

export default async function Home() {
  await connection();
  const entries = await listEntries(getDb());

  return (
    <main>
      <Hero count={entries.length} />
      <Guestbook initialEntries={entries} />
    </main>
  );
}
