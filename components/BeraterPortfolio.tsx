'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, User, MapPin, Star, Calendar } from 'lucide-react';

interface WordPressBerater {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  acf?: {
    [key: string]: any;
  };
  _embedded?: {
    'wp:term'?: any[];
    'wp:featuredmedia'?: any[];
  };
}

export default function BeraterPortfolio() {
  const [beraters, setBeraters] = useState<WordPressBerater[]>([]);
  const [filteredBeraters, setFilteredBeraters] = useState<WordPressBerater[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBeraters();
  }, []);

  useEffect(() => {
    filterBeraters();
  }, [beraters, searchTerm, selectedCategory]);

  const fetchBeraters = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual WordPress API endpoint
      // const response = await fetch('/api/beraters?_embed=1');
      // const data = await response.json();
      
      // Mock data for now
      const mockData: WordPressBerater[] = [
        {
          id: 1,
          title: { rendered: 'Dr. Sarah Mueller' },
          content: { rendered: 'Experienced business consultant specializing in digital transformation and strategic planning.' },
          excerpt: { rendered: 'Digital transformation expert with 15+ years of experience.' },
          acf: {
            specialization: 'Digital Transformation',
            location: 'Berlin, Germany',
            rating: 4.9,
            experience_years: 15
          }
        },
        {
          id: 2,
          title: { rendered: 'Michael Schmidt' },
          content: { rendered: 'Financial advisor and investment strategist helping businesses optimize their financial performance.' },
          excerpt: { rendered: 'Financial strategy consultant with proven track record.' },
          acf: {
            specialization: 'Financial Strategy',
            location: 'Munich, Germany',
            rating: 4.8,
            experience_years: 12
          }
        }
      ];
      
      setBeraters(mockData);
      
      // Extract categories
      const uniqueCategories = Array.from(new Set(
        mockData.map(berater => berater.acf?.specialization).filter(Boolean)
      ));
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching beraters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBeraters = () => {
    let filtered = beraters;

    if (searchTerm) {
      filtered = filtered.filter(berater =>
        berater.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()) ||
        berater.content.rendered.toLowerCase().includes(searchTerm.toLowerCase()) ||
        berater.acf?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(berater =>
        berater.acf?.specialization === selectedCategory
      );
    }

    setFilteredBeraters(filtered);
  };

  const getCategories = (item: WordPressBerater) => {
    try {
      if (!item._embedded?.['wp:term']) return [];
      const terms = item._embedded['wp:term'];
      for (const termGroup of terms) {
        if (Array.isArray(termGroup)) {
          const categories = termGroup.filter(term => 
            term.taxonomy === 'category'
          );
          if (categories.length > 0) return categories;
        }
      }
      return [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Expert Consultants</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with experienced professionals who can help transform your business
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search consultants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeraters.map((berater) => (
          <Card key={berater.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{berater.title.rendered}</CardTitle>
                    {berater.acf?.specialization && (
                      <Badge variant="secondary" className="mt-1">
                        {berater.acf.specialization}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription 
                className="mb-4"
                dangerouslySetInnerHTML={{ __html: berater.excerpt.rendered }}
              />
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {berater.acf?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{berater.acf.location}</span>
                  </div>
                )}
                {berater.acf?.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{berater.acf.rating}/5.0</span>
                  </div>
                )}
                {berater.acf?.experience_years && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{berater.acf.experience_years}+ years experience</span>
                  </div>
                )}
              </div>

              <Button className="w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBeraters.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or browse all consultants.
          </p>
        </div>
      )}
    </div>
  );
}