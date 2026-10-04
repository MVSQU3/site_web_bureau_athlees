import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { saveEvent, deleteEvent } from "@/lib/actions";
import EventEditor from "@/components/EventEditor";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const isNew = id === "new";
  const ev: any = isNew
    ? { title: "", slug: "", hook: "", poster: null, dates_label: "", place: "", start_date: "", deadline: null, price_label: "", infoline: "", extra: [], programme: [], capacity: null, registrations_open: true, published: false, form: [{ key: "nom", label: "Nom et prénoms", type: "text", required: true }, { key: "telephone", label: "Téléphone", type: "tel", required: true }], dedupe: ["nom"], confirmation: "Merci ! Votre inscription est enregistrée." }
    : await one("select * from events where id = $1", [Number(id) || 0]);
  if (!ev) notFound();
  return (
    <>
      <div className="adm-bar"><h1>{isNew ? "Nouvel événement" : "Modifier l'événement"}</h1></div>
      <EventEditor ev={ev} action={saveEvent.bind(null, isNew ? null : ev.id)} onDelete={!isNew && u.role === "admin" ? deleteEvent.bind(null, ev.id) as any : null} />
    </>
  );
}
