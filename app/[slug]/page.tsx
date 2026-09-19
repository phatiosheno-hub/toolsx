import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools";
import { toolComponents } from "@/components/tools";
import ToolShell from "@/components/ToolShell";

type Props = { params: Promise<{ slug: string }> };

// Hanya slug yang terdaftar yang di-generate; selain itu 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: tool.description,
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      title: tool.name,
      description: tool.description,
      url: `/${tool.slug}`,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  const Component = toolComponents[slug];
  if (!tool || !Component) notFound();

  return (
    <ToolShell tool={tool}>
      <Component />
    </ToolShell>
  );
}
