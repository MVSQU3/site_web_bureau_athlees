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
    <div className="page"><div className="wrap">
      <EventCard e={e} detail />
      <div className="narrow" style={{ margin: "0 auto" }} id="inscription">
        <h2 className="sec" style={{ marginTop: 24 }}>Inscription</h2>
        {open ? <RegistrationForm slug={e.slug} fields={e.form} infoline={e.infoline} /> : <p className="empty">Les inscriptions sont closes.</p>}
      </div>
    </div></div>
  );
}
