import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-1 text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>
      <PricingTable />
    </div>
  );
}
