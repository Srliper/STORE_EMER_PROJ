import { createFileRoute } from "@tanstack/react-router";
import { StoreNav } from "@/components/StoreNav";
import { Hero } from "@/components/Hero";
import { VapesSection } from "@/components/VapesSection";
import { ShirtsSection } from "@/components/ShirtsSection";
import { PerfumesSection } from "@/components/PerfumesSection";
import { StoreFooter } from "@/components/StoreFooter";
import { WhatsFloat } from "@/components/WhatsFloat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emerson Store — Vapes, Camisetas e Perfumes com Delivery" },
      {
        name: "description",
        content:
          "Pods Ignite, camisetas anime personalizadas e perfumes contratipos premium com entrega delivery.",
      },
      { property: "og:title", content: "Emerson Store — Street Essentials" },
      {
        property: "og:description",
        content:
          "Vapes, camisetas personalizadas e perfumes premium com entrega rápida.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <StoreNav />
      <main>
        <Hero />
        <VapesSection />
        <ShirtsSection />
        <PerfumesSection />
      </main>
      <StoreFooter />
      <WhatsFloat />
    </div>
  );
}
