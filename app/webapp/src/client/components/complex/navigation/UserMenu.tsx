import { useRouter } from "next/router";
import { Avatar } from "@/client/components/basics/Avatar";
import { cn } from "@/client/utils";
import Link from "next/link";
import ThemeButton from "./ThemButton";

type UserMenuProps = {
  onClick: () => void;
};

export default function UserMenu({ onClick }: UserMenuProps) {
  const user = {
    data: {
      fullName: "Tom Cook",
      email: "tom@example.com",
      image: "/avatar.png",
    },
  };
  const { asPath: currentPath } = useRouter();

  if (user.data) {
    return (
      <>
        <div className="flex items-center px-5">
          <div className="flex-shrink-0 text-foreground/70">
            <Avatar
              src={user.data.image}
              alt={user.data.fullName}
              className="h-10 w-10"
            />
          </div>
          <div className="ml-3">
            <div className="text-base text-foreground">
              {user.data.fullName}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.data.email}
            </div>
          </div>
          <div className="flex-1" />
          <ThemeButton />
        </div>

        <div className="mt-3">
          <button
            className={cn(
              "w-full border-transparent text-foreground hover:border-border hover:bg-surface hover:text-foreground/90",
              "flex items-center border-l-4 py-2 pl-3 pr-4 text-sm"
            )}
            onClick={() => {}}
            data-testrole="sb-mobile-navigation-option"
          >
            Sign out
          </button>
        </div>
      </>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className={cn(
        currentPath === "/auth/signin"
          ? "border-elec-purple-500 bg-elec-purple-50 text-elec-purple-700 font-bold"
          : "border-transparent text-foreground hover:border-border hover:bg-surface hover:text-foreground/90",
        "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
      )}
      aria-current={currentPath === "/auth/signin" ? "page" : undefined}
      onClick={() => onClick()}
      data-testrole="sb-mobile-navigation-option"
    >
      Sign in
    </Link>
  );
}
