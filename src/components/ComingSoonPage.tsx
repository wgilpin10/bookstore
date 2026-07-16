import PageHeader from "@/components/PageHeader";
import { Construction } from "lucide-react";

export default function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-500">
          <Construction className="h-8 w-8" />
        </div>
        <h2 className="mt-6 font-display text-xl font-bold text-brand-950">
          Coming Soon
        </h2>
        <p className="mt-2 max-w-md text-sm text-brand-500">
          This feature is under development. Check back later for updates.
        </p>
      </div>
    </>
  );
}
