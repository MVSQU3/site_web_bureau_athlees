import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import { eventStatus } from "@/lib/util";
import EventCard from "@/components/EventCard";
import RegistrationForm from "@/components/RegistrationForm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = await one<any>("select title, hook from events where slug = $1 and published", [(await params).slug]);
  return e ? { title: e.title, description: e.hook } : {};
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await one<any>("select * from events where slug = $1 and published", [(await params).slug]);
  if (!e) notFound();
  const open = eventStatus(e) === "open";
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <EventCard e={e} detail />
      <div className="mx-auto mt-12 max-w-3xl scroll-mt-24" id="inscription">
        <h2 className="mb-6 text-3xl font-bold tracking-tight">Inscription</h2>
        {open ? <RegistrationForm slug={e.slug} fields={e.form} infoline={e.infoline} /> : <p className="py-10 text-center text-base-content/60">Les inscriptions sont closes.</p>}
      </div>
    </div>
  );
}
