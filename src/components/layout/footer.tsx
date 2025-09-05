import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-[1200px] px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} INFLATE. All rights reserved.</p>
      </div>
    </footer>
  );
}
