import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, MapPin } from 'lucide-react';
import { EventCard } from '../components/events';
import { Button } from '../components/common';
import { useSearch } from '../hooks';
import styles from './Search.module.css';

const cities = [
  { id: '', label: 'All Cities' },
  { id: 'chicago', label: 'Chicago' },
  { id: 'new_york', label: 'New York' },
];

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const cityParam = searchParams.get('city') || '';

  const [inputValue, setInputValue] = useState(query);
  const [selectedCity, setSelectedCity] = useState(cityParam);

  const { events, loading, error, totalResults, search } = useSearch({
    city: selectedCity || undefined,
    pageSize: 50,
  });

  // Search when query or city changes
  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, selectedCity]);

  // Update input when URL query changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const params: Record<string, string> = { q: inputValue.trim() };
      if (selectedCity) params.city = selectedCity;
      setSearchParams(params);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (query) {
      const params: Record<string, string> = { q: query };
      if (city) params.city = city;
      setSearchParams(params);
    }
  };

  return (
    <div className={styles.page}>
      {/* Search Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <SearchIcon size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events, artists, teams..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
              <Button type="submit" size="md">
                Search
              </Button>
            </div>
          </form>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.cityFilter}>
              <MapPin size={16} />
              <span>Location:</span>
              {cities.map((city) => (
                <button
                  key={city.id}
                  className={`${styles.cityButton} ${selectedCity === city.id ? styles.cityButtonActive : ''}`}
                  onClick={() => handleCityChange(city.id)}
                >
                  {city.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.content}>
        <div className={styles.container}>
          {/* Results Header */}
          {query && (
            <div className={styles.resultsHeader}>
              <h1 className={styles.resultsTitle}>
                {loading ? (
                  'Searching...'
                ) : totalResults > 0 ? (
                  <>
                    {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                  </>
                ) : (
                  <>No results for "{query}"</>
                )}
              </h1>
              {selectedCity && !loading && (
                <p className={styles.resultsSubtitle}>
                  in {cities.find(c => c.id === selectedCity)?.label || selectedCity}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Searching events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <p>Search failed: {error}</p>
              <Button onClick={() => search(query)}>Retry</Button>
            </div>
          )}

          {/* No Query State */}
          {!query && !loading && (
            <div className={styles.emptyState}>
              <SearchIcon size={48} className={styles.emptyIcon} />
              <h2>Search for Events</h2>
              <p>Find concerts, sports, theater, and more</p>
            </div>
          )}

          {/* No Results State */}
          {query && !loading && !error && events.length === 0 && (
            <div className={styles.emptyState}>
              <h2>No events found</h2>
              <p>Try a different search term or remove filters</p>
              <div className={styles.suggestions}>
                <p>Popular searches:</p>
                <div className={styles.suggestionLinks}>
                  <Link to="/search?q=bulls">Bulls</Link>
                  <Link to="/search?q=concert">Concerts</Link>
                  <Link to="/search?q=comedy">Comedy</Link>
                  <Link to="/search?q=theater">Theater</Link>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && events.length > 0 && (
            <div className={styles.resultsGrid}>
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

export default Search;
