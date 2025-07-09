import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioDetail from '@/components/PortfolioDetail';
import { fetchPortfolio } from '@/lib/wordpress';

export async function generateStaticParams() {
  const portfolioItems = await fetchPortfolio();
 
  return portfolioItems.map((item) => ({
    slug: item.slug,
  }));
}

interface PortfolioPageProps {
  params: {
    slug: string;
  };
}

export default function PortfolioPage({ params }: PortfolioPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <PortfolioDetail slug={params.slug} />
      <Footer />
    </main>
  );
}

export async function generateMetadata({ params }: PortfolioPageProps) {
  // Hier könnten Sie die Metadaten basierend auf dem Portfolio-Item generieren
  return {
    title: `Portfolio - ${params.slug} | cockpit4me`,
    description: 'Detailansicht unseres Portfolio-Projekts',
  };
}