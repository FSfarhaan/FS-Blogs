import { LoadingSkeleton } from "@/app/components/loading-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
      <LoadingSkeleton />
    </main>
  );
}
