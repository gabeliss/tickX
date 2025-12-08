import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { Event } from '../../types';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  className,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      concert: 'Concert',
      sports: 'Sports',
      theater: 'Theater',
      festival: 'Festival',
      comedy: 'Comedy',
      other: 'Event',
    };
    return labels[category] || 'Event';
  };

  return (
    <Link
      to={`/events/${event.id}`}
      className={clsx(styles.card, styles[variant], className)}
    >
      <div className={styles.imageWrapper}>
        <img
          src={event.imageUrl}
          alt={event.name}
          className={styles.image}
          loading="lazy"
        />
        {event.isFeatured && variant !== 'compact' && (
          <span className={styles.featuredBadge}>Featured</span>
        )}
        <span className={styles.categoryBadge}>{getCategoryLabel(event.category)}</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{event.name}</h3>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <Calendar size={14} className={styles.icon} />
            <span>{format(new Date(event.eventDate), 'EEE, MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className={styles.detailRow}>
            <MapPin size={14} className={styles.icon} />
            <span>
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
        </div>

        {event.minPrice && (
          <div className={styles.pricing}>
            <span className={styles.priceLabel}>From</span>
            <span className={styles.price}>{formatPrice(event.minPrice)}</span>
            {event.listingCount && event.listingCount > 0 && (
              <span className={styles.listingCount}>
                {event.listingCount} listing{event.listingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
