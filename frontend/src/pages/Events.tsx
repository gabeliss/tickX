import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Music, Trophy, Theater, Laugh, X } from 'lucide-react';
import { EventCard } from '../components/events';
import { Button } from '../components/common';
import { useEvents } from '../hooks';
import type { EventCategory } from '../types';
import styles from './Events.module.css';

const categories = [
  { id: 'concert', label: 'Concerts', icon: Music, color: '#6B46C1' },
  { id: 'sports', label: 'Sports', icon: Trophy, color: '#00D4FF' },
  { id: 'theater', label: 'Theater', icon: Theater, color: '#FF6B6B' },
  { id: 'comedy', label: 'Comedy', icon: Laugh, color: '#F59E0B' },
];

const cities = [
  { id: 'chicago', label: 'Chicago' },
  { id: 'new_york', label: 'New York' },
];

export const Events: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const categoryParam = searchParams.get('category') as EventCategory | null;
  const cityParam = searchParams.get('city') || 'chicago';

  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(categoryParam);

  // Fetch events from API with filters
  const { events, loading, error } = useEvents({
    city: selectedCity,
    category: selectedCategory || undefined,
    pageSize: 50,
  });

  // Update URL when filters change
  useEffect(() => {
    const params: Record<string, string> = { city: selectedCity };
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    setSearchParams(params, { replace: true });
  }, [selectedCity, selectedCategory, setSearchParams]);

  // Sync state with URL on mount
  useEffect(() => {
    if (cityParam && cityParam !== selectedCity) {
      setSelectedCity(cityParam);
    }
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleCategoryChange = (category: EventCategory | null) => {
    setSelectedCategory(category);
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getCityLabel = (cityId: string) => {
    return cities.find(c => c.id === cityId)?.label || cityId;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            {selectedCategory ? getCategoryLabel(selectedCategory) : 'All Events'}
            <span className={styles.titleLocation}> in {getCityLabel(selectedCity)}</span>
          </h1>

          {/* Filters */}
          <div className={styles.filters}>
            {/* City Filter */}
            <div className={styles.filterGroup}>
              <MapPin size={16} />
              <span className={styles.filterLabel}>Location:</span>
              {cities.map((city) => (
                <button
                  key={city.id}
                  className={`${styles.filterButton} ${selectedCity === city.id ? styles.filterButtonActive : ''}`}
                  onClick={() => handleCityChange(city.id)}
                >
                  {city.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Category:</span>
              <button
                className={`${styles.filterButton} ${!selectedCategory ? styles.filterButtonActive : ''}`}
                onClick={() => handleCategoryChange(null)}
              >
                All
              </button>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    className={`${styles.filterButton} ${selectedCategory === category.id ? styles.filterButtonActive : ''}`}
                    onClick={() => handleCategoryChange(category.id as EventCategory)}
                    style={{ '--category-color': category.color } as React.CSSProperties}
                  >
                    <IconComponent size={14} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters */}
          {selectedCategory && (
            <div className={styles.activeFilters}>
              <span className={styles.activeFilterLabel}>Filtered by:</span>
              <span className={styles.activeFilterTag}>
                {getCategoryLabel(selectedCategory)}
                <button onClick={() => handleCategoryChange(null)} className={styles.removeFilter}>
                  <X size={14} />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.container}>
          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <p>Failed to load events: {error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <p className={styles.resultsCount}>
              {events.length} event{events.length !== 1 ? 's' : ''} found
            </p>
          )}

          {/* No Results */}
          {!loading && !error && events.length === 0 && (
            <div className={styles.emptyState}>
              <h2>No events found</h2>
              <p>Try a different category or city</p>
              <Button onClick={() => handleCategoryChange(null)}>View All Events</Button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && events.length > 0 && (
            <div className={styles.eventsGrid}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
