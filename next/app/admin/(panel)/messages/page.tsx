import { Check, Undo2, Trash2, Mail } from "lucide-react";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/util";
import { setMessageHandled, deleteMessage } from "@/lib/actions";

export default async function Messages() {
  await requireUser("admin");
  const rows = await q("select * from messages order by handled asc, created_at desc limit 500");
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
      <p className="mb-6 mt-1 text-base-content/60">Reçus depuis le formulaire de contact.</p>
      <div className="space-y-3">
        {rows.map((m: any) => (
          <div className={"card bg-base-200 " + (m.handled ? "opacity-60" : "")} key={m.id}>
            <div className="card-body gap-2 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><b>{m.name}</b><span className="badge badge-neutral">{m.subject}</span>{!m.handled && <span className="badge badge-warning">Nouveau</span>}</div>
                  <div className="text-sm text-base-content/60"><a className="link inline-flex items-center gap-1" href={`mailto:${m.email}`}><Mail size={14} />{m.email}</a> · {fmtDateTime(m.created_at)}</div>
                </div>
                <div className="flex gap-1">
                  <form action={setMessageHandled.bind(null, m.id, !m.handled)}><button className="btn btn-ghost btn-xs">{m.handled ? <Undo2 size={14} /> : <Check size={14} />}{m.handled ? "Marquer non traité" : "Marquer traité"}</button></form>
                  <form action={deleteMessage.bind(null, m.id)}><button className="btn btn-ghost btn-xs text-error"><Trash2 size={14} />Supprimer</button></form>
                </div>
              </div>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-base-content/60">Aucun message.</p>}
      </div>
    </>
  );
}
