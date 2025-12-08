import { Link } from 'react-router-dom';
import { Clock, Eye, Zap, Tag, TrendingDown, Gavel, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../common';
import { useCountdown } from '../../hooks/useCountdown';
import type { Listing, ListingType } from '../../types';
import styles from './ListingCard.module.css';

interface ListingCardProps {
  listing: Listing;
  showEvent?: boolean;
  className?: string;
  /** Called when mouse enters the card (for venue map integration) */
  onMouseEnter?: () => void;
  /** Called when mouse leaves the card (for venue map integration) */
  onMouseLeave?: () => void;
  /** Whether this card should be highlighted (section hovered on map) */
  isHighlighted?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  showEvent = false,
  className,
  onMouseEnter,
  onMouseLeave,
  isHighlighted = false,
}) => {
  const countdown = useCountdown(listing.auctionEndTime);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getListingTypeInfo = (type: ListingType) => {
    switch (type) {
      case 'auction':
        return { icon: Gavel, label: 'Auction', variant: 'primary' as const };
      case 'hybrid':
        return { icon: Zap, label: 'Auction + Buy Now', variant: 'secondary' as const };
      case 'fixed':
        return { icon: Tag, label: 'Fixed Price', variant: 'default' as const };
      case 'declining':
        return { icon: TrendingDown, label: 'Declining Price', variant: 'warning' as const };
      default:
        return { icon: Tag, label: 'For Sale', variant: 'default' as const };
    }
  };

  const typeInfo = getListingTypeInfo(listing.listingType);
  const TypeIcon = typeInfo.icon;

  const isAuction = listing.listingType === 'auction' || listing.listingType === 'hybrid';
  const isEndingSoon = isAuction && countdown && countdown.hours < 2;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className={clsx(styles.card, isHighlighted && styles.highlighted, className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {showEvent && (
        <div className={styles.eventInfo}>
          <img
            src={listing.event.imageUrl}
            alt=""
            className={styles.eventImage}
          />
          <span className={styles.eventName}>{listing.event.name}</span>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.seatInfo}>
          <span className={styles.section}>SEC {listing.section}</span>
          <span className={styles.separator}>•</span>
          <span className={styles.row}>Row {listing.row}</span>
          <span className={styles.separator}>•</span>
          <span className={styles.quantity}>
            {listing.quantity} ticket{listing.quantity !== 1 ? 's' : ''}
          </span>
        </div>
        <Badge
          variant={typeInfo.variant}
          size="sm"
          icon={<TypeIcon size={12} />}
        >
          {typeInfo.label}
        </Badge>
      </div>

      <div className={styles.pricing}>
        {isAuction ? (
          <>
            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>Current Bid</span>
              <span className={styles.price}>{formatPrice(listing.currentPrice)}</span>
              {listing.bidCount !== undefined && (
                <span className={styles.bidCount}>
                  {listing.bidCount} bid{listing.bidCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {listing.buyNowPrice && (
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Buy Now</span>
                <span className={styles.buyNowPrice}>
                  {formatPrice(listing.buyNowPrice)}
                </span>
              </div>
            )}
          </>
        ) : listing.listingType === 'declining' ? (
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Current Price</span>
            <span className={clsx(styles.price, styles.declining)}>
              {formatPrice(listing.currentPrice)}
            </span>
            <span className={styles.priceHint}>Price drops hourly</span>
          </div>
        ) : (
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Price per ticket</span>
            <span className={styles.price}>{formatPrice(listing.currentPrice)}</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {isAuction && countdown && (
          <div className={clsx(styles.countdown, isEndingSoon && styles.endingSoon)}>
            <Clock size={14} />
            <span>
              {countdown.days > 0
                ? `${countdown.days}d ${countdown.hours}h`
                : countdown.hours > 0
                  ? `${countdown.hours}h ${countdown.minutes}m`
                  : `${countdown.minutes}m ${countdown.seconds}s`}
            </span>
          </div>
        )}

        <div className={styles.meta}>
          {listing.watcherCount && listing.watcherCount > 0 && (
            <span className={styles.watchers}>
              <Eye size={14} />
              {listing.watcherCount}
            </span>
          )}
          {listing.reserveMet !== undefined && isAuction && (
            <span
              className={clsx(
                styles.reserve,
                listing.reserveMet ? styles.reserveMet : styles.reserveNotMet
              )}
            >
              {listing.reserveMet ? 'Reserve met' : 'Reserve not met'}
            </span>
          )}
        </div>

        <div className={styles.seller}>
          <Star size={12} className={styles.starIcon} />
          <span>{listing.seller.rating?.toFixed(1)}</span>
          {listing.seller.verificationLevel === 'trusted_seller' && (
            <span className={styles.verified}>Verified</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
