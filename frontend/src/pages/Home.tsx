import { Link } from 'react-router-dom';
import { ChevronRight, Music, Trophy, Theater, Laugh, Sparkles } from 'lucide-react';
import { Button } from '../components/common';
import { EventCard } from '../components/events';
import { ListingCard } from '../components/listings';
import {
  getTrendingEvents,
  getAuctionsEndingSoon,
  mockEvents,
} from '../data/mockData';
import styles from './Home.module.css';

const categories = [
  { id: 'concert', label: 'Concerts', icon: Music, color: '#6B46C1' },
  { id: 'sports', label: 'Sports', icon: Trophy, color: '#00D4FF' },
  { id: 'theater', label: 'Theater', icon: Theater, color: '#FF6B6B' },
  { id: 'comedy', label: 'Comedy', icon: Laugh, color: '#F59E0B' },
];

export const Home: React.FC = () => {
  const trendingEvents = getTrendingEvents();
  const auctionsEndingSoon = getAuctionsEndingSoon();
  const featuredEvents = mockEvents.filter((e) => e.isFeatured);

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

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.categoryGrid}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/events?category=${category.id}`}
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

      {/* Auctions Ending Soon */}
      {auctionsEndingSoon.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Auctions Ending Soon</h2>
                <p className={styles.sectionSubtitle}>
                  Place your bids before time runs out
                </p>
              </div>
              <Link to="/events?type=auction" className={styles.seeAllLink}>
                See all <ChevronRight size={18} />
              </Link>
            </div>
            <div className={styles.listingGrid}>
              {auctionsEndingSoon.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showEvent />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Featured Events</h2>
                <p className={styles.sectionSubtitle}>
                  Don't miss these popular events
                </p>
              </div>
              <Link to="/events?featured=true" className={styles.seeAllLink}>
                See all <ChevronRight size={18} />
              </Link>
            </div>
            <div className={styles.eventGridFeatured}>
              {featuredEvents.slice(0, 4).map((event, index) => (
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
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Trending Now</h2>
              <p className={styles.sectionSubtitle}>
                See what everyone's talking about
              </p>
            </div>
            <Link to="/events" className={styles.seeAllLink}>
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
