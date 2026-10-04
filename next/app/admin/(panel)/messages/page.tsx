import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/util";
import { setMessageHandled, deleteMessage } from "@/lib/actions";

export default async function Messages() {
  await requireUser("admin");
  const rows = await q("select * from messages order by handled asc, created_at desc limit 500");
  return (
    <>
      <h1>Messages</h1>
      <p className="sub-h">Reçus depuis le formulaire de contact.</p>
      {rows.map((m: any) => (
        <div className="acard" key={m.id} style={m.handled ? { opacity: 0.6 } : undefined}>
          <div className="arow">
            <div><b>{m.name}</b> <span className="chip">{m.subject}</span>{!m.handled && <span className="chip warn">Nouveau</span>}
              <div className="meta"><a href={`mailto:${m.email}`}>{m.email}</a> · {fmtDateTime(m.created_at)}</div></div>
            <div style={{ whiteSpace: "nowrap" }}>
              <form action={setMessageHandled.bind(null, m.id, !m.handled)} style={{ display: "inline" }}><button className="abtn ghost sm">{m.handled ? "Marquer non traité" : "Marquer traité"}</button></form>{" "}
              <form action={deleteMessage.bind(null, m.id)} style={{ display: "inline" }}><button className="abtn danger sm">Supprimer</button></form>
            </div>
          </div>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{m.body}</p>
        </div>
      ))}
      {rows.length === 0 && <p className="meta">Aucun message.</p>}
    </>
  );
}
