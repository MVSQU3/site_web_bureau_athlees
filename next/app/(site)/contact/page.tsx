import { Mail, Phone, MapPin } from "lucide-react";
import { settings, telHref } from "@/lib/util";
import ContactForm from "@/components/ContactForm";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Contact & adhésion" };

export default async function Contact() {
  const s = await settings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <PageHead eyebrow="Contact & adhésion" title="Parlons-en." lead={
        <span className="flex flex-col gap-2 text-base">
          <span className="flex items-center gap-2"><Mail size={18} className="text-secondary" />{s.email}</span>
          <a className="flex items-center gap-2" href={telHref(s.phone)}><Phone size={18} className="text-secondary" />{s.phone}</a>
          <span className="flex items-center gap-2"><MapPin size={18} className="text-secondary" />{s.address}</span>
        </span>} />
      <ContactForm />
    </div>
  );
}
