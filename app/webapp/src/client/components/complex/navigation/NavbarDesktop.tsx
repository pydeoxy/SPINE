"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "../../basics/Avatar";
import { Switch } from "../../basics/switch";

const navLinks = [
  { name: "Dashboard", href: "/" },
  { name: "Projects", href: "/projects" },
];

type NavbarProps = {
  theme: "light" | "dark" | "system";
  toggleTheme: () => void;
};

export default function NavbarDesktop({ theme, toggleTheme }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <nav className="w-full bg-background flex items-center px-6 py-3 border-b border-border shadow-xs">
      {/* Logo */}
      <div className="flex items-center mr-8">
        <span className="text-3xl text-primary fill-primary font-bold mr-2">
          {/* Replace with your SVG or logo */}
          <svg width="32" height="32" viewBox="0 0 32 32">
            <path d="M16 4L28 28H4L16 4Z" fill="currentColor" />
          </svg>
        </span>
      </div>
      {/* Nav Links */}
      <div className="flex gap-6 flex-1">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`relative px-2 py-1 transition-colors ${
              pathname === link.href
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {link.name}
            {pathname === link.href && (
              <span className="absolute left-0 -bottom-3.5 w-full h-0.5 bg-primary rounded"></span>
            )}
          </Link>
        ))}
      </div>
      {/* Right Side: Notification & Avatar */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-gray-400" />
        </button>
        <div className="relative" ref={avatarRef}>
          <Avatar
            className="border-2 border-muted-foreground focus:outline-none hover:border-primary hover:cursor-pointer"
            src="/avatar.png"
            alt="User Avatar"
            onClick={() => setOpen((v) => !v)}
            size={"md"}
          />
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-sm shadow-lg border z-50 text-sm px-4 py-2 text-surface-foreground">
              {/* <Link
                href="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link> */}
              <div className="flex items-center justify-between mb-2">
                <span>Theme</span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={() => toggleTheme()}
                />
              </div>
              <button
                className="block w-full text-left hover:text-primary hover:cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  // TODO: Add sign out logic here
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
