import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Music, Trophy, Theater, Laugh, Sparkles, MapPin } from 'lucide-react';
import { Button } from '../components/common';
import { EventCard } from '../components/events';
import { useEvents } from '../hooks';
import styles from './Home.module.css';

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

export const Home: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('chicago');

  // Fetch events from real API
  const { events, loading, error } = useEvents({
    city: selectedCity,
    pageSize: 12,
  });

  // Get featured events (for now, just take first 4 with images)
  const featuredEvents = events.filter(e => e.imageUrl).slice(0, 4);

  // Get trending events (rest of the events)
  const trendingEvents = events.filter(e => e.imageUrl).slice(4, 12);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Buy & Sell Tickets
            <br />
            <span className={styles.heroHighlight}>Your Way</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The modern ticket marketplace with auctions, instant buy, and group purchasing.
            Get fair prices through dynamic bidding.
          </p>
          <div className={styles.heroActions}>
            <Button size="lg" onClick={() => window.location.href = '/events'}>
              Browse Events
            </Button>
            <Button size="lg" variant="secondary" onClick={() => window.location.href = '/sell'}>
              Sell Tickets
            </Button>
          </div>
          <div className={styles.heroBadges}>
            <span className={styles.heroBadge}>100% Buyer Guarantee</span>
            <span className={styles.heroBadge}>Secure Payments</span>
            <span className={styles.heroBadge}>
              <Sparkles size={14} /> AI-Powered Pricing
            </span>
          </div>
        </div>
        <div className={styles.heroBackground} />
      </section>

      {/* City Selector */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.citySelector}>
            <MapPin size={18} />
            <span>Events in:</span>
            {cities.map((city) => (
              <button
                key={city.id}
                className={`${styles.cityButton} ${selectedCity === city.id ? styles.cityButtonActive : ''}`}
                onClick={() => setSelectedCity(city.id)}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.categoryGrid}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/events?category=${category.id}&city=${selectedCity}`}
                  className={styles.categoryCard}
                  style={{ '--category-color': category.color } as React.CSSProperties}
                >
                  <span className={styles.categoryIcon}>
                    <IconComponent size={24} />
                  </span>
                  <span className={styles.categoryLabel}>{category.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading events...</p>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.errorState}>
              <p>Failed to load events: {error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      {!loading && !error && featuredEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Featured Events</h2>
                <p className={styles.sectionSubtitle}>
                  Don't miss these popular events in {selectedCity === 'chicago' ? 'Chicago' : 'New York'}
                </p>
              </div>
              <Link to={`/events?city=${selectedCity}`} className={styles.seeAllLink}>
                See all <ChevronRight size={18} />
              </Link>
            </div>
            <div className={styles.eventGridFeatured}>
              {featuredEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant={index === 0 ? 'featured' : 'default'}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Events */}
      {!loading && !error && trendingEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>More Events</h2>
                <p className={styles.sectionSubtitle}>
                  Discover more events happening soon
                </p>
              </div>
              <Link to={`/events?city=${selectedCity}`} className={styles.seeAllLink}>
                See all <ChevronRight size={18} />
              </Link>
            </div>
            <div className={styles.eventGrid}>
              {trendingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitle}>How TickX Works</h2>
            <p className={styles.sectionSubtitle}>
              Buy and sell tickets with confidence
            </p>
          </div>
          <div className={styles.howItWorksGrid}>
            <div className={styles.howItWorksCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Find Your Event</h3>
              <p className={styles.stepDescription}>
                Browse thousands of events or search for your favorite artists, teams, and shows.
              </p>
            </div>
            <div className={styles.howItWorksCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Choose Your Style</h3>
              <p className={styles.stepDescription}>
                Bid on auctions for the best deals, buy instantly at fixed prices, or purchase as a group with friends.
              </p>
            </div>
            <div className={styles.howItWorksCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Get Your Tickets</h3>
              <p className={styles.stepDescription}>
                Tickets are transferred securely. 100% guaranteed valid or your money back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Have tickets to sell?</h2>
            <p className={styles.ctaSubtitle}>
              List your tickets in minutes. Choose your selling style and reach millions of buyers.
            </p>
            <Button size="lg" onClick={() => window.location.href = '/sell'}>
              Start Selling
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
