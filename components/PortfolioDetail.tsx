'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  Briefcase, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Users,
  Award,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Github,
  Download,
  Share2,
  Heart,
  Eye,
  MessageCircle
} from 'lucide-react';

import { WordPressPortfolio, fetchPortfolio, fetchCategories } from '@/lib/wordpress';

interface PortfolioDetailProps {
  slug: string;
}

export default function PortfolioDetail({ slug }: PortfolioDetailProps) {
  const [portfolioItem, setPortfolioItem] = useState<WordPressPortfolio | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<WordPressPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Array<{ id: number; name: string; slug: string; taxonomy: string; }>>([]);
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string; }>>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all categories and tags once
        const categoriesData = await fetchCategories();
        setAllCategories(categoriesData);

        const tagsData = await fetchTags();
        setAllTags(tagsData);

        // Fetch the specific portfolio item by slug
        const portfolioItems = await fetchPortfolio({ search: slug });
        const foundItem = portfolioItems.find(item => item.slug === slug);

        if (foundItem) {
          setPortfolioItem(foundItem);
          // Load related projects based on the found item's categories
          await fetchRelatedProjects(foundItem, categoriesData);
        } else {
          setError('Portfolio-Projekt nicht gefunden');
        }

      } catch (err) {
        console.error('Fehler beim Laden der Portfolio-Details:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProjects = async (currentItem: WordPressPortfolio, categoriesData: Array<{ id: number; name: string; slug: string; taxonomy: string; }>) => {
      try {
        const categoryIds = currentItem.portfolio_categories.join(',');
        
        if (categoryIds) {
          const related = await fetchPortfolio({
            portfolio_category: categoryIds,
            exclude: String(currentItem.id),
            per_page: 3,
          });
          setRelatedProjects(related);
        }
      } catch (err) {
        console.log('Fehler beim Laden ähnlicher Projekte:', err);
      }
    };

    loadData();
  }, [slug]);

  const getCategories = (item: WordPressPortfolio, allCategories: Array<{ id: number; name: string; slug: string; taxonomy: string; }>) => {
    if (!item.portfolio_categories || item.portfolio_categories.length === 0) return [];
    return item.portfolio_categories
      .map(catId => allCategories.find(cat => cat.id === catId))
      .filter((cat): cat is { id: number; name: string; slug: string; taxonomy: string; } => cat !== undefined);
  };

  const getTags = (item: WordPressPortfolio, allTags: Array<{ id: number; name: string; slug: string; }>) => {
    if (!item.tags || item.tags.length === 0) return [];
    return item.tags
      .map(tagId => allTags.find(tag => tag.id === tagId))
      .filter((tag): tag is { id: number; name: string; slug: string; } => tag !== undefined);
  };

  const getFeaturedImage = (item: WordPressPortfolio) => {
    try {
      const media = item._embedded?.['wp:featuredmedia']?.[0];
      if (!media) return null;
      
      const sizes = media.media_details?.sizes;
      if (sizes?.large?.source_url) return sizes.large.source_url;
      if (sizes?.medium?.source_url) return sizes.medium.source_url;
      if (sizes?.full?.source_url) return sizes.full.source_url;
      
      return media.source_url;
    } catch {
      return null;
    }
  };

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    } catch {
      return html;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Datum unbekannt';
    }
  };

  const getProjectTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    const colors: Record<string, string> = {
      'strategieberatung': 'bg-cockpit-violet/10 text-cockpit-violet border-cockpit-violet/20',
      'strategy': 'bg-cockpit-violet/10 text-cockpit-violet border-cockpit-violet/20',
      'leadership': 'bg-cockpit-blue-light/10 text-cockpit-blue-light border-cockpit-blue-light/20',
      'führung': 'bg-cockpit-blue-light/10 text-cockpit-blue-light border-cockpit-blue-light/20',
      'optimization': 'bg-cockpit-turquoise/10 text-cockpit-turquoise border-cockpit-turquoise/20',
      'optimierung': 'bg-cockpit-turquoise/10 text-cockpit-turquoise border-cockpit-turquoise/20',
      'transformation': 'bg-cockpit-pink/10 text-cockpit-pink border-cockpit-pink/20',
      'digital': 'bg-cockpit-pink/10 text-cockpit-pink border-cockpit-pink/20',
      'analysis': 'bg-cockpit-lime/10 text-cockpit-teal border-cockpit-lime/20',
      'analyse': 'bg-cockpit-lime/10 text-cockpit-teal border-cockpit-lime/20',
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (normalizedType.includes(key)) return value;
    }
    
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const handleShare = async () => {
    if (navigator.share && portfolioItem) {
      try {
        await navigator.share({
          title: stripHtml(portfolioItem.title.rendered),
          text: stripHtml(portfolioItem.excerpt.rendered),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Sharing failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Loading State
  if (loading) {
    return (
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error || !portfolioItem) {
    return (
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Portfolio-Projekt nicht gefunden
            </h1>
            <p className="text-gray-600 mb-8">
              Das angeforderte Portfolio-Projekt konnte nicht geladen werden.
            </p>
            <Button 
              onClick={() => router.push('/#portfolio')}
              className="bg-cockpit-gradient hover:opacity-90 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Portfolio
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const categories = getCategories(portfolioItem, allCategories);
  const tags = getTags(portfolioItem, allTags);
  const featuredImage = getFeaturedImage(portfolioItem);
  const projectType = portfolioItem.acf?.project_type || categories[0]?.name || 'Projekt';

  return (
    <section className="py-20 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/#portfolio')}
            className="text-cockpit-turquoise hover:text-cockpit-teal group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Zurück zum Portfolio
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          {/* Project Type Badge */}
          <div className="mb-6">
            <Badge className={`${getProjectTypeColor(projectType)} border text-lg px-4 py-2`}>
              {projectType}
            </Badge>
          </div>

          {/* Title and Meta */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                {stripHtml(portfolioItem.title.rendered)}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {stripHtml(portfolioItem.excerpt.rendered)}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {portfolioItem.acf?.project_url && (
                  <Button 
                    asChild
                    className="bg-cockpit-gradient hover:opacity-90 text-white"
                  >
                    <a 
                      href={portfolioItem.acf.project_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Live ansehen</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={handleShare}
                  className="border-cockpit-turquoise text-cockpit-turquoise hover:bg-cockpit-turquoise hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Teilen
                </Button>
              </div>
            </div>

            {/* Project Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-50/50 border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Projekt-Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolioItem.acf?.client_name && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-cockpit-turquoise" />
                      <div>
                        <div className="text-sm text-gray-500">Kunde</div>
                        <div className="font-medium">{portfolioItem.acf.client_name}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-cockpit-turquoise" />
                    <div>
                      <div className="text-sm text-gray-500">Datum</div>
                      <div className="font-medium">{formatDate(portfolioItem.date)}</div>
                    </div>
                  </div>

                  {portfolioItem.acf?.project_duration && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-cockpit-turquoise" />
                      <div>
                        <div className="text-sm text-gray-500">Dauer</div>
                        <div className="font-medium">{portfolioItem.acf.project_duration}</div>
                      </div>
                    </div>
                  )}

                  {portfolioItem.acf?.project_team_size && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-cockpit-turquoise" />
                      <div>
                        <div className="text-sm text-gray-500">Team-Größe</div>
                        <div className="font-medium">{portfolioItem.acf.project_team_size}</div>
                      </div>
                    </div>
                  )}

                  {portfolioItem.acf?.project_status && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <div className="font-medium">{portfolioItem.acf.project_status}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Featured Image */}
          {featuredImage && (
            <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-cockpit-turquoise/10 to-cockpit-lime/10 mb-8">
              <img
                src={featuredImage}
                alt={stripHtml(portfolioItem.title.rendered)}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Projekt-Beschreibung</h2>
              <div 
                className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: portfolioItem.acf?.project_description || portfolioItem.content.rendered 
                }}
              />
            </div>

            {/* Challenges */}
            {portfolioItem.acf?.project_challenges && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-cockpit-pink" />
                  Herausforderungen
                </h3>
                <div 
                  className="text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: portfolioItem.acf.project_challenges }}
                />
              </div>
            )}

            {/* Solutions */}
            {portfolioItem.acf?.project_solutions && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-cockpit-turquoise" />
                  Lösungsansatz
                </h3>
                <div 
                  className="text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: portfolioItem.acf.project_solutions }}
                />
              </div>
            )}

            {/* Results */}
            {portfolioItem.acf?.project_results && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-cockpit-lime" />
                  Ergebnisse
                </h3>
                <div 
                  className="text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: portfolioItem.acf.project_results }}
                />
              </div>
            )}

            {/* Client Testimonial */}
            {portfolioItem.acf?.client_testimonial && (
              <div className="bg-gradient-to-r from-cockpit-violet/5 to-cockpit-blue-light/5 rounded-2xl p-8 border border-cockpit-violet/10">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-cockpit-violet" />
                  Kundenstimme
                </h3>
                <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                  "{portfolioItem.acf.client_testimonial}"
                </blockquote>
                {portfolioItem.acf?.client_name && (
                  <cite className="block mt-4 text-sm font-medium text-cockpit-violet">
                    — {portfolioItem.acf.client_name}
                  </cite>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Technologies */}
            {portfolioItem.acf?.technologies && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Technologien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {portfolioItem.acf.technologies.split(',').map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-cockpit-lime/30 text-cockpit-teal bg-cockpit-lime/5"
                      >
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Kategorien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge 
                        key={category.id} 
                        className="bg-cockpit-turquoise/10 text-cockpit-turquoise border-cockpit-turquoise/20"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="bg-gray-100 text-gray-600"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact CTA */}
            <Card className="bg-gradient-to-br from-cockpit-gradient opacity-90 text-white border-0">
              <CardHeader>
                <CardTitle className="text-white">
                  Ähnliches Projekt geplant?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 mb-4">
                  Lassen Sie uns über Ihr nächstes Projekt sprechen.
                </p>
                <Button 
                  asChild
                  variant="secondary"
                  className="w-full bg-white text-cockpit-violet hover:bg-gray-100"
                >
                  <a href="mailto:info@cockpit4me.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Kontakt aufnehmen
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Ähnliche Projekte
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((project) => {
                const relatedImage = getFeaturedImage(project);
                const relatedCategories = getCategories(project, allCategories);
                const relatedType = project.acf?.project_type || relatedCategories[0]?.name || 'Projekt';

                return (
                  <Card 
                    key={project.id} 
                    className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gray-50/50 overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/portfolio/${project.slug || project.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cockpit-turquoise/10 to-cockpit-lime/10">
                      {relatedImage ? (
                        <img
                          src={relatedImage}
                          alt={stripHtml(project.title.rendered)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="w-12 h-12 text-cockpit-turquoise/60" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getProjectTypeColor(relatedType)} border`}>
                          {relatedType}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-cockpit-turquoise transition-colors">
                        {stripHtml(project.title.rendered)}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="text-gray-600 leading-relaxed line-clamp-3">
                        {stripHtml(project.excerpt.rendered)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}