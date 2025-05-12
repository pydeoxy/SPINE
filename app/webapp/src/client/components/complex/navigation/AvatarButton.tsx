import { useState } from "react";
import { useRef } from "react";
import { Avatar } from "../../basics/Avatar";
import { useEffect } from "react";
import { cn } from "@/client/utils";

export default function AvatarButton({ className }: { className?: string }) {
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
    <div className={cn("relative", className)} ref={avatarRef}>
      <Avatar
        className={cn(
          "border-2 border-muted-foreground focus:outline-none hover:border-primary hover:cursor-pointer",

          open && "border-primary"
        )}
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
  );
}
