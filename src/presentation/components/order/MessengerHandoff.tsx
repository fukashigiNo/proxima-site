"use client";

import { useMemo } from "react";
import { CONTACTS, telegramLink, whatsappLink } from "@/presentation/content/contacts";

export function MessengerHandoff({ message }: { message: string }) {
  const links = useMemo(
    () =>
      [
        CONTACTS.whatsapp && { label: "Отправить в WhatsApp", href: whatsappLink(CONTACTS.whatsapp, message), tone: "bg-[#25d366] text-[#06210f]" },
        CONTACTS.telegram && { label: "Отправить в Telegram", href: telegramLink(CONTACTS.telegram, message), tone: "bg-[#2aabee] text-[#04192a]" },
      ].filter(Boolean) as { label: string; href: string; tone: string }[],
    [message],
  );
  if (links.length === 0) return null;
  return (
    <div className="grid w-full gap-3 rounded-card bg-surface-2 p-4">
      <p className="text-sm text-muted">Чтобы ответили быстрее, отправьте заявку нам в мессенджер. Текст уже готов:</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium no-underline transition-[filter] hover:brightness-110 ${link.tone}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
