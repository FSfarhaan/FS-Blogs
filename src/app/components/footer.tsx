import Link from "next/link";
import { navigationLinks, siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[color:rgba(255,250,244,0.72)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <p className="font-semibold text-[var(--foreground)]">{siteConfig.name}</p>
          <p className="mt-1 max-w-xl leading-7">{siteConfig.description}</p>
        </div>

        <nav className="flex flex-wrap gap-4">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
