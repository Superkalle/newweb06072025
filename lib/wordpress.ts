// WordPress API Utilities für headless CMS Integration

const WORDPRESS_API_URL = 'https://cockpit4me.de/wp-json/wp/v2';

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  author: number;
  categories: number[];
  tags: number[];
  featured_media: number;
  type?: string;
  _embedded?: {
    author?: Array<{
      name: string;
      avatar_urls: {
        '96': string;
      };
    }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      taxonomy: string;
    }>>;
  };
}

export interface WordPressPortfolio {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  slug: string;
  featured_media: number;
  type: string;
  portfolio_categories: number[]; // Hinzugefügt für Kategorien-IDs
  tags: number[]; // Hinzugefügt für Tags-IDs

  acf?: {
    project_url?: string;
    client_name?: string;
    project_type?: string;
    technologies?: string;
    completion_date?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      taxonomy: string;
    }>>;
  };
}

export interface WordPressPage {
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
  date: string;
  modified: string;
  link: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface WordPressCustomPost {
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
  date: string;
  link: string;
  featured_media: number;
  type?: string;
  acf?: Record<string, any>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      taxonomy: string;
    }>>;
  };
}

export interface WordPressService {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  link: string;
  featured_media: number;
  acf?: {
    service_price?: string;
    service_duration?: string;
    service_features?: string;
    service_icon?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface WordPressBerater {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  slug: string;
  featured_media: number;
  categories: number[]; // Standard WP categories
  portfolio_categories: number[]; // Custom portfolio categories
  tags: number[]; // Standard WP tags
  type?: string;
  acf?: {
    berater_position?: string;
    berater_email?: string;
    berater_phone?: string;
    berater_linkedin?: string;
    berater_location?: string;
    berater_specialties?: string;
    berater_experience?: string;
    berater_education?: string;
    berater_certifications?: string;
    berater_languages?: string;
    berater_bio?: string;
    berater_projects?: string;
    berater_availability?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string; };
          large?: { source_url: string; };
          full?: { source_url: string; };
        };
      };
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      taxonomy: string;
      slug: string;
    }>>;
  };
}


const createSearchParams = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams({
    _embed: "true",
  });

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams;
};
export const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: einfache Regex-basierte HTML-Entfernung
    return html.replace(/<[^>]*>/g, '');
  }
  // Client-side: DOM-basierte HTML-Entfernung
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const formatDate = (dateString: string, locale: string = 'de-DE'): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getExcerpt = (content: string, maxLength: number = 150): string => {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// API Functions mit verbesserter Fehlerbehandlung
export const fetchPosts = async (params: {
  per_page?: number;
  page?: number;
  categories?: string;
  tags?: string;
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<WordPressPost[]> => {
  const searchParams = createSearchParams(params);

  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Timeout nach 10 Sekunden
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPortfolio = async (params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  search?: string;
  portfolio_category?: string; // Hinzugefügt für Kategoriefilterung
} = {}): Promise<WordPressPortfolio[]> => {
  const searchParams = createSearchParams(params);

  // Versuche verschiedene Endpoints
  const endpoints = [
    `${WORDPRESS_API_URL}/avada_portfolio?${searchParams}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Map embedded terms to portfolio_categories
          const mappedData: WordPressPortfolio[] = data.map((item: any) => ({
            ...item,
            portfolio_categories: item._embedded?.['wp:term']?.flat()
              .filter((term: any) => term.taxonomy === 'portfolio_category')
              .map((term: any) => term.id) || [],
            tags: item._embedded?.['wp:term']?.flat()
              .filter((term: any) => term.taxonomy === 'post_tag')
              .map((term: any) => term.id) || [],
          }));
          return mappedData;
        }
      }
    } catch (error) {
      console.error(`Portfolio endpoint ${endpoint} failed:`, error);
    }
  }

  throw new Error('No portfolio data found');
};

export const fetchPages = async (params: {
  per_page?: number;
  page?: number;
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<WordPressPage[]> => {
  const searchParams = createSearchParams(params);

  try {
    const response = await fetch(`${WORDPRESS_API_URL}/pages?${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

export const fetchCustomPosts = async (
  postType: string,
  params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}
): Promise<WordPressCustomPost[]> => {
  const searchParams = createSearchParams(params);

  try {
    const response = await fetch(`${WORDPRESS_API_URL}/${postType}?${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching ${postType}:`, error);
    throw error;
  }
};

export const fetchPostById = async (id: number): Promise<WordPressPost> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts/${id}?_embed=true`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
};

export const fetchPageById = async (id: number): Promise<WordPressPage> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/pages/${id}?_embed=true`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching page ${id}:`, error);
    throw error;
  }
};

// Search Function mit verbesserter Fehlerbehandlung
export const searchContent = async (
  query: string,
  postTypes: string[] = ['posts', 'portfolio']
): Promise<{
  posts: WordPressPost[];
  portfolio: WordPressPortfolio[];
  total: number;
}> => {
  const results = await Promise.allSettled([
    fetchPosts({ search: query, per_page: 5 }),
    fetchPortfolio({ search: query, per_page: 5 })
  ]);

  const posts: WordPressPost[] = results[0].status === 'fulfilled' ? results[0].value : [];
  const portfolio: WordPressPortfolio[] = results[1].status === 'fulfilled' ? results[1].value : [];

  return {
    posts,
    portfolio,
    total: posts.length + portfolio.length
  };
};

// Categories and Tags mit Fehlerbehandlung
export const fetchCategories = async (): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  count: number;
}>> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchTags = async (): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  count: number;
}>> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/tags?per_page=100`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

export const fetchServices = async (params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  search?: string;
} = {}): Promise<WordPressService[]> => {
  const searchParams = createSearchParams(params);

  // Try fetching from 'services' custom post type first
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/services?${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Could not fetch from services CPT, trying posts category:', error);
  }

  // Fallback to fetching from 'posts' with 'services' category
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?categories=services&${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching services from posts category:', error);
    throw error;
  }
};

export const fetchBerater = async (params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  search?: string;
  portfolio_category?: string; // Filter by portfolio category
} = {}): Promise<WordPressBerater[]> => {
  const searchParams = createSearchParams(params);

  // Try fetching from 'avada_portfolio' custom post type first, filtered by category
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/avada_portfolio?${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Map embedded terms to portfolio_categories and tags
        const mappedData: WordPressBerater[] = data.map((item: any) => ({
          ...item,
          portfolio_categories: item._embedded?.['wp:term']?.flat()
            .filter((term: any) => term.taxonomy === 'portfolio_category')
            .map((term: any) => term.id) || [],
          tags: item._embedded?.['wp:term']?.flat()
            .filter((term: any) => term.taxonomy === 'post_tag')
            .map((term: any) => term.id) || [],
        }));
        return mappedData;
      }
    }
  } catch (error) {
    console.warn('Could not fetch from avada_portfolio CPT, trying posts category:', error);
  }

  // Fallback to fetching from 'posts' with 'berater' category (assuming 'berater' is a category slug)
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?categories=berater&${searchParams}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // Map embedded terms to portfolio_categories and tags for fallback posts
    const mappedData: WordPressBerater[] = data.map((item: any) => ({
      ...item,
      portfolio_categories: item._embedded?.['wp:term']?.flat()
        .filter((term: any) => term.taxonomy === 'portfolio_category')
        .map((term: any) => term.id) || [],
      tags: item._embedded?.['wp:term']?.flat()
        .filter((term: any) => term.taxonomy === 'post_tag')
        .map((term: any) => term.id) || [],
    }));
    return mappedData;
  } catch (error) {
    console.error('Error fetching berater from posts category:', error);
    throw error;
  }
};

// Hilfsfunktion für robuste API-Aufrufe
export const fetchWithFallback = async <T>(
  primaryFetch: () => Promise<T>,
  fallbackData: T,
  errorMessage?: string
): Promise<{ data: T; isUsingFallback: boolean; error?: string }> => {
  try {
    const data = await primaryFetch();
    return { data, isUsingFallback: false };
  } catch (error) {
    console.error(errorMessage || 'API fetch failed:', error);
    return { 
      data: fallbackData, 
      isUsingFallback: true, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};