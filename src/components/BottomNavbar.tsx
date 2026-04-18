"use client";

import Link from "next/link";

export function BottomNavbar() {
  return (
    <nav className="relative z-40 flex h-[56px] w-full flex-shrink-0 items-center justify-around bg-[#161616] text-[#d4d3d3]">
      <NavItem href="/" icon={<HomeIcon />} label="Home" active />
      <NavItem icon={<FriendsIcon />} label="Friends" />
      <CreateItem />
      <NavItem icon={<InboxIcon />} label="Inbox" badge={7} />
      <NavItem icon={<UserIcon />} label="Profile" />
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  const content = (
    <span
      className={`relative flex flex-col items-center gap-0.5 ${active ? "text-white" : "text-[#d4d3d3]"}`}
    >
      <span className="relative">
        {icon}
        {badge !== undefined && (
          <span className="absolute -right-2 -top-1 flex min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 py-[1px] text-[8px] font-bold leading-none text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </span>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return <button type="button">{content}</button>;
}

function CreateItem() {
  return (
    <button type="button" className="flex flex-col items-center gap-0.5">
      <span
        className="flex h-[26px] w-[38px] items-center justify-center rounded-[8px] bg-white text-[#161616]"
        style={{
          boxShadow:
            "-5px 0 0 0 #40e8f0, 5px 0 0 0 #fe2c55, inset 0 0 0 0 transparent",
        }}
      >
        <PlusIcon />
      </span>
      <span className="text-[10px] font-medium tracking-tight text-[#d4d3d3]">
        Create
      </span>
    </button>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3z" />
    </svg>
  );
}

function FriendsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
