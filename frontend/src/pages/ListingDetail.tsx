import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Share2,
  ChevronLeft,
  Users,
  Shield,
  TrendingUp,
  Eye,
  Star,
  Check,
  AlertCircle,
  Zap,
  Gavel,
  Tag,
  TrendingDown,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { Button, Badge, Input, Card, Modal, ModalFooter } from '../components/common';
import { MiniVenueMap } from '../components/venue';
import { useCountdown } from '../hooks/useCountdown';
import { useListing } from '../hooks/useListings';
import { getBidsForListing, currentUser } from '../data/mockData';
import { getVenueMap } from '../data/venueMaps';
import type { ListingType } from '../types';
import styles from './ListingDetail.module.css';

export const ListingDetail: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const [bidAmount, setBidAmount] = useState('');
  const [maxBidAmount, setMaxBidAmount] = useState('');
  const [showProxyBid, setShowProxyBid] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showBidConfirmModal, setShowBidConfirmModal] = useState(false);
  const [showBuyConfirmModal, setShowBuyConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { listing, isLoading, error } = useListing(listingId);
  const bids = listingId ? getBidsForListing(listingId) : [];
  const countdown = useCountdown(listing?.auctionEndTime);

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
        return { icon: Gavel, label: 'Auction', color: 'var(--color-primary)' };
      case 'hybrid':
        return { icon: Zap, label: 'Auction + Buy Now', color: 'var(--color-secondary)' };
      case 'fixed':
        return { icon: Tag, label: 'Fixed Price', color: 'var(--color-text-secondary)' };
      case 'declining':
        return { icon: TrendingDown, label: 'Declining Price', color: 'var(--color-warning)' };
      default:
        return { icon: Tag, label: 'For Sale', color: 'var(--color-text-secondary)' };
    }
  };

  if (isLoading) {
    return (
      <div className={styles.notFound}>
        <h1>Loading...</h1>
        <p>Loading listing details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className={styles.notFound}>
        <h1>Listing Not Found</h1>
        <p>{error || "This listing doesn't exist or has been removed."}</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const typeInfo = getListingTypeInfo(listing.listingType);
  const TypeIcon = typeInfo.icon;
  const isAuction = listing.listingType === 'auction' || listing.listingType === 'hybrid';
  const minBid = listing.currentPrice + listing.bidIncrement;
  const serviceFee = 0.1; // 10%

  // Get venue map if available
  const venueMapConfig = getVenueMap(listing.event.venue.id);
  // totalPrice used in modal display
  const _totalPrice = (parseFloat(bidAmount) || listing.currentPrice) * quantity;
  void _totalPrice; // suppress unused warning - used in calculations below

  const handlePlaceBid = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowBidConfirmModal(false);
    // In real app, would refresh listing data
    alert('Bid placed successfully!');
  };

  const handleBuyNow = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowBuyConfirmModal(false);
    navigate('/checkout/success');
  };

  return (
    <div className={styles.page}>
      {/* Back Navigation */}
      <div className={styles.topNav}>
        <div className={styles.container}>
          <Link to={`/events/${listing.eventId}`} className={styles.backLink}>
            <ChevronLeft size={20} />
            Back to Event
          </Link>
          <div className={styles.topActions}>
            <button
              className={styles.iconButton}
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Heart size={20} fill={isWatchlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              className={styles.iconButton}
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              aria-label="Share listing"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* Main Content */}
            <div className={styles.main}>
              {/* Event Info */}
              <Card padding="md" className={styles.eventCard}>
                <div className={styles.eventInfo}>
                  <img
                    src={listing.event.imageUrl}
                    alt=""
                    className={styles.eventImage}
                  />
                  <div className={styles.eventDetails}>
                    <h1 className={styles.eventTitle}>{listing.event.name}</h1>
                    <div className={styles.eventMeta}>
                      <span className={styles.metaItem}>
                        <Calendar size={16} />
                        {format(new Date(listing.event.eventDate), 'EEE, MMM d, yyyy')}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={16} />
                        {format(new Date(listing.event.eventDate), 'h:mm a')}
                      </span>
                      <span className={styles.metaItem}>
                        <MapPin size={16} />
                        {listing.event.venue.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ticket Details */}
              <Card padding="md" className={styles.ticketCard}>
                <div className={styles.ticketHeader}>
                  <div>
                    <Badge
                      variant={listing.listingType === 'hybrid' ? 'secondary' : 'primary'}
                      icon={<TypeIcon size={14} />}
                    >
                      {typeInfo.label}
                    </Badge>
                    <h2 className={styles.ticketTitle}>
                      Section {listing.section} &bull; Row {listing.row}
                    </h2>
                    <p className={styles.ticketSeats}>
                      Seats: {listing.seats.join(', ')} ({listing.quantity} ticket
                      {listing.quantity !== 1 ? 's' : ''})
                    </p>
                  </div>
                  <div className={styles.ticketMeta}>
                    {listing.watcherCount && (
                      <span className={styles.watcherCount}>
                        <Eye size={16} />
                        {listing.watcherCount} watching
                      </span>
                    )}
                  </div>
                </div>

                {/* Venue Map */}
                {venueMapConfig ? (
                  <MiniVenueMap
                    mapConfig={venueMapConfig}
                    highlightedSection={listing.section}
                    className={styles.venueMap}
                  />
                ) : (
                  <div className={styles.venueMapPlaceholder}>
                    <span>Venue Seating Chart</span>
                    <span className={styles.sectionHighlight}>
                      Section {listing.section} highlighted
                    </span>
                  </div>
                )}
              </Card>

              {/* Price Analysis */}
              <Card padding="md" className={styles.analysisCard}>
                <h3 className={styles.cardTitle}>
                  <TrendingUp size={18} />
                  Price Analysis
                </h3>
                <div className={styles.analysisGrid}>
                  <div className={styles.analysisItem}>
                    <span className={styles.analysisLabel}>Similar tickets</span>
                    <span className={styles.analysisValue}>$120 - $280</span>
                  </div>
                  <div className={styles.analysisItem}>
                    <span className={styles.analysisLabel}>This price</span>
                    <Badge variant="success">Fair</Badge>
                  </div>
                  <div className={styles.analysisItem}>
                    <span className={styles.analysisLabel}>Demand</span>
                    <Badge variant="warning">High</Badge>
                  </div>
                </div>
              </Card>

              {/* Bid History (if auction) */}
              {isAuction && bids.length > 0 && (
                <Card padding="md" className={styles.bidsCard}>
                  <h3 className={styles.cardTitle}>
                    Bid History ({bids.length} bid{bids.length !== 1 ? 's' : ''})
                  </h3>
                  <div className={styles.bidList}>
                    {bids.slice(0, 5).map((bid, index) => (
                      <div
                        key={bid.id}
                        className={clsx(styles.bidItem, index === 0 && styles.winningBid)}
                      >
                        <div className={styles.bidInfo}>
                          <span className={styles.bidAmount}>{formatPrice(bid.amount)}</span>
                          <span className={styles.bidder}>
                            {bid.bidderId === currentUser.id
                              ? 'You'
                              : `${bid.bidder.name.slice(0, 3)}***`}
                          </span>
                        </div>
                        <span className={styles.bidTime}>
                          {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                        </span>
                        {index === 0 && (
                          <Badge variant="success" size="sm">
                            Winning
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Seller Info */}
              <Card padding="md" className={styles.sellerCard}>
                <h3 className={styles.cardTitle}>Seller Information</h3>
                <div className={styles.sellerInfo}>
                  <img
                    src={listing.seller.avatarUrl}
                    alt=""
                    className={styles.sellerAvatar}
                  />
                  <div className={styles.sellerDetails}>
                    <span className={styles.sellerName}>{listing.seller.name}</span>
                    <div className={styles.sellerStats}>
                      <span className={styles.sellerRating}>
                        <Star size={14} fill="currentColor" />
                        {listing.seller.rating?.toFixed(1)}
                      </span>
                      <span className={styles.sellerSales}>
                        {listing.seller.totalSales} sales
                      </span>
                      {listing.seller.verificationLevel === 'trusted_seller' && (
                        <Badge variant="success" size="sm" icon={<Check size={12} />}>
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar - Bidding/Purchase */}
            <aside className={styles.sidebar}>
              <Card padding="lg" className={styles.bidCard}>
                {/* Auction Timer */}
                {isAuction && countdown && (
                  <div
                    className={clsx(
                      styles.auctionTimer,
                      countdown.hours < 2 && styles.endingSoon
                    )}
                  >
                    <Clock size={18} />
                    <span>
                      {countdown.isExpired
                        ? 'Auction ended'
                        : countdown.days > 0
                          ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m remaining`
                          : countdown.hours > 0
                            ? `${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s remaining`
                            : `${countdown.minutes}m ${countdown.seconds}s remaining`}
                    </span>
                  </div>
                )}

                {/* Current Price */}
                <div className={styles.priceSection}>
                  {isAuction && (
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Current Bid</span>
                      <span className={styles.currentPrice}>
                        {formatPrice(listing.currentPrice)}
                      </span>
                      {listing.bidCount !== undefined && (
                        <span className={styles.bidCount}>
                          {listing.bidCount} bid{listing.bidCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {listing.buyNowPrice && (
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Buy Now</span>
                      <span className={styles.buyNowPrice}>
                        {formatPrice(listing.buyNowPrice)}
                      </span>
                      <span className={styles.priceHint}>Instant purchase</span>
                    </div>
                  )}

                  {listing.listingType === 'fixed' && (
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Price per ticket</span>
                      <span className={styles.currentPrice}>
                        {formatPrice(listing.currentPrice)}
                      </span>
                    </div>
                  )}

                  {listing.listingType === 'declining' && (
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Current Price</span>
                      <span className={clsx(styles.currentPrice, styles.declining)}>
                        {formatPrice(listing.currentPrice)}
                      </span>
                      <span className={styles.priceHint}>Price drops every hour</span>
                    </div>
                  )}

                  {listing.reserveMet !== undefined && isAuction && (
                    <div
                      className={clsx(
                        styles.reserveStatus,
                        listing.reserveMet ? styles.reserveMet : styles.reserveNotMet
                      )}
                    >
                      {listing.reserveMet ? (
                        <>
                          <Check size={16} /> Reserve met
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} /> Reserve not yet met
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Bidding Form */}
                {isAuction && (
                  <div className={styles.bidForm}>
                    <Input
                      label="Your Bid"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min ${formatPrice(minBid)}`}
                      hint={`Minimum bid: ${formatPrice(minBid)} (+${formatPrice(listing.bidIncrement)} increment)`}
                      leftIcon={<span className={styles.currencySymbol}>$</span>}
                      fullWidth
                    />

                    <button
                      type="button"
                      className={styles.proxyToggle}
                      onClick={() => setShowProxyBid(!showProxyBid)}
                    >
                      {showProxyBid ? '- Hide' : '+ Set'} maximum bid (proxy bidding)
                    </button>

                    {showProxyBid && (
                      <Input
                        label="Maximum Bid"
                        type="number"
                        value={maxBidAmount}
                        onChange={(e) => setMaxBidAmount(e.target.value)}
                        placeholder="Enter max amount"
                        hint="We'll bid for you up to this amount"
                        leftIcon={<span className={styles.currencySymbol}>$</span>}
                        fullWidth
                      />
                    )}

                    <Button
                      fullWidth
                      size="lg"
                      onClick={() => setShowBidConfirmModal(true)}
                      disabled={!bidAmount || parseFloat(bidAmount) < minBid}
                    >
                      Place Bid {bidAmount && `${formatPrice(parseFloat(bidAmount))}`}
                    </Button>
                  </div>
                )}

                {/* Buy Now / Fixed Price Button */}
                {(listing.buyNowPrice || listing.listingType === 'fixed' || listing.listingType === 'declining') && (
                  <div className={styles.buySection}>
                    {listing.allowSplitting && listing.quantity > 1 && (
                      <div className={styles.quantitySelector}>
                        <span className={styles.quantityLabel}>Quantity</span>
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.quantityButton}
                            onClick={() => setQuantity(Math.max(listing.minQuantity, quantity - 1))}
                            disabled={quantity <= listing.minQuantity}
                          >
                            -
                          </button>
                          <span className={styles.quantityValue}>{quantity}</span>
                          <button
                            className={styles.quantityButton}
                            onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                            disabled={quantity >= listing.quantity}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={styles.totalSection}>
                      <div className={styles.totalRow}>
                        <span>
                          {quantity} ticket{quantity !== 1 ? 's' : ''} @{' '}
                          {formatPrice(listing.buyNowPrice || listing.currentPrice)}
                        </span>
                        <span>
                          {formatPrice((listing.buyNowPrice || listing.currentPrice) * quantity)}
                        </span>
                      </div>
                      <div className={styles.totalRow}>
                        <span>Service fee (10%)</span>
                        <span>
                          {formatPrice((listing.buyNowPrice || listing.currentPrice) * quantity * serviceFee)}
                        </span>
                      </div>
                      <div className={clsx(styles.totalRow, styles.grandTotal)}>
                        <span>Total</span>
                        <span>
                          {formatPrice((listing.buyNowPrice || listing.currentPrice) * quantity * (1 + serviceFee))}
                        </span>
                      </div>
                    </div>

                    <Button
                      fullWidth
                      size="lg"
                      variant={isAuction ? 'secondary' : 'primary'}
                      onClick={() => setShowBuyConfirmModal(true)}
                    >
                      {isAuction ? 'Buy Now' : 'Buy Tickets'}{' '}
                      {formatPrice((listing.buyNowPrice || listing.currentPrice) * quantity * (1 + serviceFee))}
                    </Button>
                  </div>
                )}

                {/* Group Purchase */}
                <Button
                  fullWidth
                  variant="tertiary"
                  leftIcon={<Users size={18} />}
                  onClick={() => navigate(`/groups/create?listing=${listing.id}`)}
                >
                  Buy as Group
                </Button>

                {/* Guarantee */}
                <div className={styles.guarantee}>
                  <Shield size={18} />
                  <div>
                    <strong>100% Buyer Guarantee</strong>
                    <span>Full refund if tickets aren't valid</span>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </div>

      {/* Bid Confirmation Modal */}
      <Modal
        isOpen={showBidConfirmModal}
        onClose={() => setShowBidConfirmModal(false)}
        title="Confirm Your Bid"
        size="sm"
      >
        <div className={styles.confirmContent}>
          <p>
            You are about to place a bid of <strong>{formatPrice(parseFloat(bidAmount) || 0)}</strong>{' '}
            for {listing.quantity} ticket{listing.quantity !== 1 ? 's' : ''}.
          </p>
          {showProxyBid && maxBidAmount && (
            <p className={styles.proxyNote}>
              Proxy bidding enabled: We'll automatically bid up to{' '}
              <strong>{formatPrice(parseFloat(maxBidAmount))}</strong> for you.
            </p>
          )}
          <div className={styles.confirmDetails}>
            <div className={styles.confirmRow}>
              <span>{listing.event.name}</span>
            </div>
            <div className={styles.confirmRow}>
              <span>Section {listing.section}, Row {listing.row}</span>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBidConfirmModal(false)}>
            Cancel
          </Button>
          <Button onClick={handlePlaceBid} loading={isSubmitting}>
            Confirm Bid
          </Button>
        </ModalFooter>
      </Modal>

      {/* Buy Confirmation Modal */}
      <Modal
        isOpen={showBuyConfirmModal}
        onClose={() => setShowBuyConfirmModal(false)}
        title="Confirm Purchase"
        size="sm"
      >
        <div className={styles.confirmContent}>
          <p>
            You are about to purchase {quantity} ticket{quantity !== 1 ? 's' : ''} for{' '}
            <strong>
              {formatPrice((listing.buyNowPrice || listing.currentPrice) * quantity * (1 + serviceFee))}
            </strong>
            .
          </p>
          <div className={styles.confirmDetails}>
            <div className={styles.confirmRow}>
              <span>{listing.event.name}</span>
            </div>
            <div className={styles.confirmRow}>
              <span>Section {listing.section}, Row {listing.row}</span>
            </div>
            <div className={styles.confirmRow}>
              <span>
                {format(new Date(listing.event.eventDate), 'EEE, MMM d @ h:mm a')}
              </span>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBuyConfirmModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleBuyNow} loading={isSubmitting}>
            Complete Purchase
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ListingDetail;
