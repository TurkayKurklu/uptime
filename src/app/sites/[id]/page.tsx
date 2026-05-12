import { SiteDetail } from "@/components/site-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SiteDetail siteId={id} />;
}
