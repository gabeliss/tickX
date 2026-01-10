import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Share2,
  ChevronLeft,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Button, Badge, Select } from '../components/common';
import { ListingCard } from '../components/listings';
import { VenueMap } from '../components/venue';
import { VenueMapProvider, useVenueMap } from '../context/VenueMapContext';
import { useEvent } from '../hooks';
import { useEventListings } from '../hooks/useListings';
import { getVenueMap } from '../data/venueMaps';
import type { ListingType, Listing } from '../types';
import styles from './EventDetail.module.css';

type SortOption = 'price-asc' | 'price-desc' | 'ending-soon' | 'newest';

/**
 * Inner component that uses the VenueMapContext
 */
function EventDetailContent({
  listings,
  listingTypeFilter,
  setListingTypeFilter,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  hasMap,
}: {
  listings: Listing[];
  listingTypeFilter: ListingType | 'all';
  setListingTypeFilter: (filter: ListingType | 'all') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasMap: boolean;
}) {
  const venueMapContext = hasMap ? useVenueMap() : null;

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings];

    // Filter by listing type
    if (listingTypeFilter !== 'all') {
      result = result.filter((l) => l.listingType === listingTypeFilter);
    }

    // Filter by selected section from map
    if (venueMapContext?.selectedSection) {
      result = result.filter((l) => l.section === venueMapContext.selectedSection);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'ending-soon':
        result.sort((a, b) => {
          if (!a.auctionEndTime && !b.auctionEndTime) return 0;
          if (!a.auctionEndTime) return 1;
          if (!b.auctionEndTime) return -1;
          return new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime();
        });
        break;
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [listings, listingTypeFilter, sortBy, venueMapContext?.selectedSection]);

  // Handle listing hover (updates map)
  const handleListingMouseEnter = useCallback(
    (listing: Listing) => {
      if (venueMapContext) {
        venueMapContext.setHoveredSection(listing.section);
        venueMapContext.setHoveredListingId(listing.id);
      }
    },
    [venueMapContext]
  );

  const handleListingMouseLeave = useCallback(() => {
    if (venueMapContext) {
      venueMapContext.setHoveredSection(null);
      venueMapContext.setHoveredListingId(null);
    }
  }, [venueMapContext]);

  // Check if a listing should be highlighted (its section is hovered on map)
  const isListingHighlighted = useCallback(
    (listing: Listing) => {
      if (!venueMapContext) return false;
      // Highlight if section matches hovered section (but not from our own listing hover)
      return (
        venueMapContext.hoveredSection === listing.section &&
        venueMapContext.hoveredListingId === null
      );
    },
    [venueMapContext]
  );

  return (
    <>
      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <button
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>

        <div className={styles.quickFilters}>
          <button
            className={clsx(
              styles.filterChip,
              listingTypeFilter === 'all' && styles.active
            )}
            onClick={() => setListingTypeFilter('all')}
          >
            All Types
          </button>
          <button
            className={clsx(
              styles.filterChip,
              listingTypeFilter === 'auction' && styles.active
            )}
            onClick={() => setListingTypeFilter('auction')}
          >
            Auctions
          </button>
          <button
            className={clsx(
              styles.filterChip,
              listingTypeFilter === 'fixed' && styles.active
            )}
            onClick={() => setListingTypeFilter('fixed')}
          >
            Fixed Price
          </button>
          <button
            className={clsx(
              styles.filterChip,
              listingTypeFilter === 'hybrid' && styles.active
            )}
            onClick={() => setListingTypeFilter('hybrid')}
          >
            Hybrid
          </button>
        </div>

        <div className={styles.sortWrapper}>
          <ArrowUpDown size={16} />
          <Select
            options={[
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'ending-soon', label: 'Ending Soon' },
              { value: 'newest', label: 'Newest' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className={styles.expandedFilters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Section</label>
            <Select
              options={[
                { value: '', label: 'All Sections' },
                { value: 'floor', label: 'Floor' },
                { value: '100', label: '100 Level' },
                { value: '200', label: '200 Level' },
                { value: '300', label: '300 Level' },
                { value: '400', label: '400 Level' },
              ]}
              placeholder="Select section"
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Quantity</label>
            <Select
              options={[
                { value: '', label: 'Any' },
                { value: '1', label: '1 Ticket' },
                { value: '2', label: '2 Tickets' },
                { value: '3', label: '3 Tickets' },
                { value: '4', label: '4+ Tickets' },
              ]}
              placeholder="Select quantity"
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Max Price</label>
            <Select
              options={[
                { value: '', label: 'No Limit' },
                { value: '100', label: 'Under $100' },
                { value: '200', label: 'Under $200' },
                { value: '500', label: 'Under $500' },
              ]}
              placeholder="Select price"
            />
          </div>
        </div>
      )}

      {/* Section filter indicator */}
      {venueMapContext?.selectedSection && (
        <div className={styles.sectionFilter}>
          <span>
            Showing listings in <strong>Section {venueMapContext.selectedSection}</strong>
          </span>
          <button onClick={() => venueMapContext.setSelectedSection(null)}>
            Clear
          </button>
        </div>
      )}

      {/* Listings Grid or No Listings */}
      {filteredAndSortedListings.length > 0 ? (
        <div className={hasMap ? styles.listingsGrid : styles.listingsGridFull}>
          {filteredAndSortedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onMouseEnter={() => handleListingMouseEnter(listing)}
              onMouseLeave={handleListingMouseLeave}
              isHighlighted={isListingHighlighted(listing)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noListings}>
          <h3>No listings found</h3>
          <p>
            {listingTypeFilter !== 'all' || venueMapContext?.selectedSection
              ? 'Try adjusting your filters or check back later.'
              : 'Check back later for available tickets.'}
          </p>
          {(listingTypeFilter !== 'all' || venueMapContext?.selectedSection) && (
            <Button
              variant="secondary"
              onClick={() => {
                setListingTypeFilter('all');
                venueMapContext?.setSelectedSection(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch event and listings from real API
  const { event, loading, error } = useEvent(eventId);
  const { listings: allListings, isLoading: listingsLoading } = useEventListings(eventId);

  // Check if venue has an interactive map
  const venueId = event?.venue.id;
  const venueMapConfig = venueId ? getVenueMap(venueId) : undefined;
  const hasMap = !!venueMapConfig;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Loading state
  if (loading || listingsLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading event...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.notFound}>
        <h1>Error Loading Event</h1>
        <p>{error}</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  // Not found state
  if (!event) {
    return (
      <div className={styles.notFound}>
        <h1>Event Not Found</h1>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const lowestPrice = allListings.length > 0
    ? Math.min(...allListings.map((l) => l.currentPrice))
    : null;

  // Content wrapped with or without VenueMapProvider based on map availability
  const renderContent = () => {
    const contentProps = {
      listings: allListings,
      listingTypeFilter,
      setListingTypeFilter,
      sortBy,
      setSortBy,
      showFilters,
      setShowFilters,
      hasMap,
    };

    if (hasMap && venueMapConfig) {
      return (
        <VenueMapProvider listings={allListings}>
          <div className={styles.splitLayout}>
            {/* Listings Panel */}
            <div className={styles.listingsPanel}>
              <EventDetailContent {...contentProps} />
            </div>

            {/* Map Panel */}
            <div className={styles.mapPanel}>
              <VenueMap mapConfig={venueMapConfig} />
            </div>
          </div>
        </VenueMapProvider>
      );
    }

    // No map - render standard layout
    return <EventDetailContent {...contentProps} />;
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroImage}>
          <img src={event.imageUrl} alt={event.name} />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <Link to="/" className={styles.backLink}>
            <ChevronLeft size={20} />
            Back
          </Link>

          <div className={styles.eventInfo}>
            <Badge variant="primary" size="md">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>

            <h1 className={styles.eventTitle}>{event.name}</h1>

            <div className={styles.eventMeta}>
              <div className={styles.metaItem}>
                <Calendar size={18} />
                <span>{format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={18} />
                <span>{format(new Date(event.eventDate), 'h:mm a')}</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={18} />
                <span>
                  {event.venue.name}, {event.venue.city}, {event.venue.state}
                </span>
              </div>
            </div>

            <div className={styles.eventActions}>
              <Button
                variant={isWatchlisted ? 'primary' : 'secondary'}
                onClick={() => setIsWatchlisted(!isWatchlisted)}
                leftIcon={<Heart size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />}
              >
                {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
              </Button>
              <Button
                variant="tertiary"
                leftIcon={<Share2 size={18} />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className={styles.content}>
        <div className={styles.container}>
          {/* Stats Bar */}
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{allListings.length}</span>
              <span className={styles.statLabel}>Listings</span>
            </div>
            {lowestPrice && (
              <div className={styles.stat}>
                <span className={styles.statValue}>{formatPrice(lowestPrice)}</span>
                <span className={styles.statLabel}>Lowest Price</span>
              </div>
            )}
          </div>

          {/* Main content (with or without map) */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
