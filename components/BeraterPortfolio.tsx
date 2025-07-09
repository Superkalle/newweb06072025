'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, ArrowRight, User, Mail, Phone, Linkedin, MapPin, AlertCircle, Users, Award, Briefcase, GraduationCap, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { WordPressBerater, fetchBerater, fetchCategories, fetchTags } from '@/lib/wordpress';

export default function BeraterPortfolio() {
  const [beraterTeam, setBeraterTeam] = useState<WordPressBerater[]>([]);
  const [filteredBeraters, setFilteredBeraters] = useState<WordPressBerater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [allCategories, setAllCategories] = useState<Array<{ id: number; name: string; slug: string; taxonomy: string; }>>([]);
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string; }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Unsere Berater",
    "description": "Lernen Sie unser erfahrenes Team von Strategieberatern und Leadership-Experten kennen.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredBeraters.map((berater, index) => ({
        "@type": "Person",
        "position": index + 1,
        "name": stripHtml(berater.title.rendered),
        "url": berater.link,
        "image": getFeaturedImage(berater) || undefined,
        "jobTitle": berater.acf?.berater_position || undefined,
        "email": berater.acf?.berater_email || undefined,
        "telephone": berater.acf?.berater_phone || undefined,
        "address": berater.acf?.berater_location ? {
          "@type": "PostalAddress",
          "addressLocality": berater.acf.berater_location
        } : undefined,
        "sameAs": berater.acf?.berater_linkedin ? [berater.acf.berater_linkedin] : undefined,
        "description": berater.acf?.berater_bio || stripHtml(berater.excerpt.rendered) || undefined,
        "knowsAbout": berater.acf?.berater_specialties?.split(',').map(s => s.trim()) || undefined,
        "alumniOf": berater.acf?.berater_education ? {
          "@type": "EducationalOrganization",
          "name": berater.acf.berater_education
        } : undefined,
      }))
    }
  };

  useEffect(() => {
    const loadBeraterData = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo('');

  // Filter-Effekt
  useEffect(() => {
    let filtered = beraterTeam;

    if (searchTerm) {
      filtered = filtered.filter(berater =>
        berater.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()) ||
        berater.content.rendered.toLowerCase().includes(searchTerm.toLowerCase()) ||
        berater.acf?.berater_specialties?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(berater => {
        const categories = getCategories(berater, allCategories);
        return categories.some(cat => cat.slug === selectedCategory);
      });
    }

    setFilteredBeraters(filtered);
  }, [beraterTeam, searchTerm, selectedCategory]);

  const getCategories = (item: WordPressBerater, allCategories: Array<{ id: number; name: string; slug: string; taxonomy: string; }>) => {
    if (!item.portfolio_categories || item.portfolio_categories.length === 0) return [];
    return item.portfolio_categories
      .map(catId => allCategories.find(cat => cat.id === catId))
      .filter((cat): cat is { id: number; name: string; slug: string; taxonomy: string; } => cat !== undefined);
  };

  const getTags = (item: WordPressBerater, allTags: Array<{ id: number; name: string; slug: string; }>) => {
    if (!item.tags || item.tags.length === 0) return [];
    return item.tags
      .map(tagId => allTags.find(tag => tag.id === tagId))
      .filter((tag): tag is { id: number; name: string; slug: string; } => tag !== undefined);
  };

  const getFeaturedImage = (item: WordPressBerater) => {
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

  const getSpecialtyColor = (specialty: string) => {
    const normalizedSpecialty = specialty.toLowerCase();
    const colors: Record<string, string> = {
      'strategieberatung': 'bg-cockpit-violet/10 text-cockpit-violet border-cockpit-violet/20',
      'strategy': 'bg-cockpit-violet/10 text-cockpit-violet border-cockpit-violet/20',
      'leadership': 'bg-cockpit-blue-light/10 text-cockpit-blue-light border-cockpit-blue-light/20',
      'führung': 'bg-cockpit-blue-light/10 text-cockpit-blue-light border-cockpit-blue-light/20',
      'transformation': 'bg-cockpit-pink/10 text-cockpit-pink border-cockpit-pink/20',
      'change': 'bg-cockpit-pink/10 text-cockpit-pink border-cockpit-pink/20',
      'prozess': 'bg-cockpit-turquoise/10 text-cockpit-turquoise border-cockpit-turquoise/20',
      'process': 'bg-cockpit-turquoise/10 text-cockpit-turquoise border-cockpit-turquoise/20',
      'digital': 'bg-cockpit-lime/10 text-cockpit-teal border-cockpit-lime/20',
      'innovation': 'bg-cockpit-orange/10 text-orange-600 border-cockpit-orange/20'
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (normalizedSpecialty.includes(key)) return value;
    }
    
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Extrahiere verfügbare Kategorien für Filter
  const availableCategoriesForFilter = allCategories.filter(cat => cat.taxonomy === 'portfolio_category');

  // Loading State
  if (loading) {
    return (
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-cockpit-violet/10 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-cockpit-violet" />
              <span className="text-sm font-medium text-cockpit-violet">Unser Team</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Unsere{' '}
              <span className="bg-gradient-to-r from-cockpit-violet to-cockpit-blue-light bg-clip-text text-transparent">
                Berater
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Lernen Sie unser erfahrenes Team von Strategieberatern und Leadership-Experten kennen. 
              Gemeinsam bringen wir Ihr Unternehmen auf die nächste Stufe.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-cockpit-violet">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cockpit-violet"></div>
              <span className="text-sm">Lade Berater-Team aus WordPress...</span>
            </div>
            
            {/* Debug Info während Loading */}
            {debugInfo && (
              <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 max-w-2xl mx-auto">
                <strong>Debug:</strong> {debugInfo}
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error || beraterTeam.length === 0) {
    return (
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-cockpit-violet/10 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-cockpit-violet" />
              <span className="text-sm font-medium text-cockpit-violet">Unser Team</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Unsere{' '}
              <span className="bg-gradient-to-r from-cockpit-violet to-cockpit-blue-light bg-clip-text text-transparent">
                Berater
              </span>
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  <h3 className="text-xl font-semibold text-amber-800">Berater-Profile werden eingerichtet</h3>
                </div>
                <p className="text-amber-700 mb-4 leading-relaxed">
                  Die Berater-Posts für Marcus Kaliga, Jörg Wachsmuth, Manuel Jork und Stefan Wolf 
                  werden gerade in WordPress vorbereitet. Besuchen Sie unsere Hauptwebsite für aktuelle Team-Informationen.
                </p>
                
                {/* Debug Info */}
                {debugInfo && (
                  <div className="text-xs text-amber-600 bg-amber-100 rounded p-3 mb-4">
                    <strong>Debug-Info:</strong> {debugInfo}
                  </div>
                )}
                
                {/* Gefundene Kategorien anzeigen */}
                {foundCategories.length > 0 && (
                  <div className="text-xs text-amber-600 bg-amber-100 rounded p-3 mb-4">
                    <strong>Gefundene Berater-Kategorien:</strong>
                    <ul className="mt-1">
                      {foundCategories.map(cat => (
                        <li key={cat.id}>• "{cat.name}" ({cat.count} Posts)</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    className="bg-cockpit-gradient hover:opacity-90 text-white"
                  >
                    <a 
                      href="https://cockpit4me.de/team" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2"
                    >
                      <span>Team kennenlernen</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="border-cockpit-violet text-cockpit-violet hover:bg-cockpit-violet hover:text-white"
                  >
                    <a 
                      href="https://cockpit4me.de/kontakt" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2"
                    >
                      <span>Kontakt aufnehmen</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Success State - Zeige alle gefundenen Berater
  return (
    <section className="py-20 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-cockpit-violet/10 rounded-full px-4 py-2 mb-6">
            <Users className="w-4 h-4 text-cockpit-violet" />
            <span className="text-sm font-medium text-cockpit-violet">Unser Team</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Unsere{' '}
            <span className="bg-gradient-to-r from-cockpit-violet to-cockpit-blue-light bg-clip-text text-transparent">
              Berater
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Lernen Sie unser erfahrenes Team von Strategieberatern und Leadership-Experten kennen. 
            Gemeinsam bringen wir Ihr Unternehmen auf die nächste Stufe.
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">
              Live-Daten von WordPress ({beraterTeam.length} Berater-Posts)
            </span>
          </div>
          
          {/* Debug Info */}
          {debugInfo && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 max-w-2xl mx-auto mb-8">
              <strong>Debug:</strong> {debugInfo}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cockpit-violet mb-2">{beraterTeam.length}+</div>
              <div className="text-gray-600">Experten</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cockpit-blue-light mb-2">{foundCategories.length}+</div>
              <div className="text-gray-600">Kategorien</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cockpit-turquoise mb-2">15+</div>
              <div className="text-gray-600">Jahre Erfahrung</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Berater suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {availableCategoriesForFilter.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {availableCategoriesForFilter.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Berater Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredBeraters.map((berater) => {
            const tags = getTags(berater, allTags);
            const categories = getCategories(berater, allCategories);
            const featuredImage = getFeaturedImage(berater);
            const position = berater.acf?.berater_position || 'Senior Berater';
            const specialties = berater.acf?.berater_specialties?.split(',').map(s => s.trim()) || [];

            return (
              <Card key={berater.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gray-50/50 overflow-hidden">
                {/* Profile Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-cockpit-violet/10 to-cockpit-blue-light/10">
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt={stripHtml(berater.title.rendered)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-cockpit-violet/20 to-cockpit-blue-light/20">
                              <div class="text-center">
                                <div class="w-20 h-20 mx-auto mb-4 bg-cockpit-violet/20 rounded-full flex items-center justify-center">
                                  <span class="text-3xl font-bold text-cockpit-violet/60">${stripHtml(berater.title.rendered).charAt(0)}</span>
                                </div>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cockpit-violet/20 to-cockpit-blue-light/20">
                      <div className="text-center">
                        <User className="w-20 h-20 text-cockpit-violet/60 mx-auto mb-4" />
                        <div className="text-3xl font-bold text-cockpit-violet/40">
                          {stripHtml(berater.title.rendered).charAt(0)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {/* Position Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-800 border-0">
                      {position}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-cockpit-violet transition-colors">
                    {stripHtml(berater.title.rendered)}
                  </CardTitle>

                  {/* Contact Info */}
                  <div className="space-y-1 text-sm text-gray-500">
                    {berater.acf?.berater_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{berater.acf.berater_email}</span>
                      </div>
                    )}
                    {berater.acf?.berater_location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{berater.acf.berater_location}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {berater.acf?.berater_bio || stripHtml(berater.excerpt.rendered) || stripHtml(berater.content.rendered).substring(0, 150) + '...'}
                  </CardDescription>

                  {/* Experience & Education */}
                  <div className="space-y-2 mb-4 text-sm">
                    {berater.acf?.berater_experience && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{berater.acf.berater_experience}</span>
                      </div>
                    )}
                    {berater.acf?.berater_education && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>{berater.acf.berater_education}</span>
                      </div>
                    )}
                    {berater.acf?.berater_certifications && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{berater.acf.berater_certifications}</span>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {specialties.slice(0, 3).map((specialty, index) => (
                        <Badge 
                          key={index} 
                          className={`text-xs border ${getSpecialtyColor(specialty)}`}
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {specialties.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs border-gray-300 text-gray-500 bg-gray-50"
                        >
                          +{specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Categories Debug */}
                  {categories.length > 0 && (
                    <div className="text-xs text-gray-400 mb-2">
                      Kategorien: {categories.map(cat => cat.name).join(', ')}
                    </div>
                  )}

                  {/* Languages */}
                  {berater.acf?.berater_languages && (
                    <div className="text-xs text-gray-500 mb-4">
                      <strong>Sprachen:</strong> {berater.acf.berater_languages}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button 
                      asChild
                      variant="ghost" 
                      className="p-0 h-auto text-cockpit-violet hover:text-cockpit-blue-light font-semibold group/btn"
                    >
                      <a 
                        href={berater.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2"
                      >
                        <span>Profil ansehen</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </Button>

                    {/* LinkedIn */}
                    {berater.acf?.berater_linkedin && (
                      <Button 
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-cockpit-violet text-cockpit-violet hover:bg-cockpit-violet hover:text-white"
                      >
                        <a 
                          href={berater.acf.berater_linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1"
                        >
                          <Linkedin className="w-3 h-3" />
                          <span>LinkedIn</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredBeraters.length === 0 && beraterTeam.length > 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berater gefunden</h3>
            <p className="text-gray-600 mb-4">
              Versuchen Sie andere Suchbegriffe oder entfernen Sie die Filter.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Filter zurücksetzen
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-cockpit-violet/5 to-cockpit-blue-light/5 rounded-2xl p-8 sm:p-12 border border-cockpit-violet/10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Bereit für Ihr nächstes Projekt?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Unser erfahrenes Berater-Team steht bereit, um Ihre strategischen 
              Herausforderungen zu lösen. Kontaktieren Sie uns für eine 
              unverbindliche Erstberatung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-cockpit-gradient hover:opacity-90 text-white px-8 py-4 text-lg font-semibold">
                Beratung anfragen
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-2 border-cockpit-violet text-cockpit-violet hover:bg-cockpit-violet hover:text-white px-8 py-4 text-lg font-semibold"
              >
                <a 
                  href="https://cockpit4me.de/kontakt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2"
                >
                  <span>Kontakt aufnehmen</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}