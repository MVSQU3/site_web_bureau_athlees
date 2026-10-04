import { settings, telHref } from "@/lib/util";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact & adhésion" };

export default async function Contact() {
  const s = await settings();
  return (
    <div className="page"><div className="wrap narrow">
      <p className="eyebrow">Contact &amp; adhésion</p>
      <h1 className="h1s">Parlons-en.</h1>
      <p className="lead left">{s.email}<br /><a href={telHref(s.phone)}>{s.phone}</a><br />{s.address}</p>
      <ContactForm />
    </div></div>
  );
}
