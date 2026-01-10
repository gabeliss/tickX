import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Button, Card, Badge } from '../components/common';
import { useCountdown, useSellerListings } from '../hooks';
import { currentUser } from '../data/mockData';
import type { Listing, ListingType } from '../types';
import styles from './SellerDashboard.module.css';

const ListingRow: React.FC<{ listing: Listing; onDelete: (id: string) => Promise<boolean> }> = ({ listing, onDelete }) => {
  const countdown = useCountdown(listing.auctionEndTime);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeLabel = (type: ListingType): string => {
    const labels: Record<ListingType, string> = {
      auction: 'Auction',
      hybrid: 'Hybrid',
      fixed: 'Fixed',
      declining: 'Declining',
    };
    return labels[type];
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this listing?')) {
      setIsDeleting(true);
      await onDelete(listing.id);
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const isAuction = listing.listingType === 'auction' || listing.listingType === 'hybrid';

  return (
    <div className={styles.listingRow}>
      <div className={styles.listingInfo}>
        <img
          src={listing.event.imageUrl}
          alt=""
          className={styles.listingImage}
        />
        <div className={styles.listingDetails}>
          <Link to={`/listings/${listing.id}`} className={styles.listingTitle}>
            {listing.event.name}
          </Link>
          <span className={styles.listingMeta}>
            Sec {listing.section} • Row {listing.row} • {listing.quantity} ticket
            {listing.quantity !== 1 ? 's' : ''}
          </span>
          <span className={styles.listingDate}>
            {format(new Date(listing.event.eventDate), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className={styles.listingType}>
        <Badge
          variant={listing.listingType === 'hybrid' ? 'secondary' : 'primary'}
          size="sm"
        >
          {getTypeLabel(listing.listingType)}
        </Badge>
      </div>

      <div className={styles.listingPrice}>
        <span className={styles.priceValue}>{formatPrice(listing.currentPrice)}</span>
        {listing.buyNowPrice && (
          <span className={styles.buyNowValue}>
            BN: {formatPrice(listing.buyNowPrice)}
          </span>
        )}
      </div>

      <div className={styles.listingBids}>
        {isAuction ? (
          <>
            <span className={styles.bidCount}>{listing.bidCount || 0} bids</span>
            {listing.reserveMet !== undefined && (
              <Badge
                variant={listing.reserveMet ? 'success' : 'warning'}
                size="sm"
              >
                {listing.reserveMet ? 'Reserve met' : 'Reserve not met'}
              </Badge>
            )}
          </>
        ) : (
          <span className={styles.watcherCount}>
            <Eye size={14} /> {listing.watcherCount || 0}
          </span>
        )}
      </div>

      <div className={styles.listingTime}>
        {isAuction && countdown ? (
          <span className={clsx(countdown.hours < 2 && styles.endingSoon)}>
            {countdown.days > 0
              ? `${countdown.days}d ${countdown.hours}h`
              : countdown.hours > 0
                ? `${countdown.hours}h ${countdown.minutes}m`
                : `${countdown.minutes}m`}
          </span>
        ) : (
          <span className={styles.activeStatus}>Active</span>
        )}
      </div>

      <div className={styles.listingActions}>
        <button
          className={styles.actionButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={18} />
        </button>
        {showMenu && (
          <div className={styles.actionMenu}>
            <Link to={`/listings/${listing.id}`} className={styles.menuItem}>
              <Eye size={16} /> View
            </Link>
            <Link to={`/sell/edit/${listing.id}`} className={styles.menuItem}>
              <Edit size={16} /> Edit
            </Link>
            <button className={clsx(styles.menuItem, styles.danger)} onClick={handleDelete} disabled={isDeleting}>
              <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Remove'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'expired'>('active');
  const { listings, isLoading, error, deleteListing } = useSellerListings(currentUser.id);

  const activeListings = listings.filter((l) => l.status === 'active');
  const soldListings = listings.filter((l) => l.status === 'sold');

  // Mock stats
  const stats = {
    activeListings: activeListings.length,
    totalSold: 12,
    monthlyEarnings: 1847,
    avgSalePrice: 154,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Seller Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, {currentUser.name}!
            </p>
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/sell')}>
            Create Listing
          </Button>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <Card padding="md" className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-primary-100)' }}>
              <Package size={24} color="var(--color-primary)" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.activeListings}</span>
              <span className={styles.statLabel}>Active Listings</span>
            </div>
          </Card>

          <Card padding="md" className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-success-light)' }}>
              <TrendingUp size={24} color="var(--color-success)" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.totalSold}</span>
              <span className={styles.statLabel}>Sold This Month</span>
            </div>
          </Card>

          <Card padding="md" className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-warning-light)' }}>
              <DollarSign size={24} color="var(--color-warning)" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{formatPrice(stats.monthlyEarnings)}</span>
              <span className={styles.statLabel}>Monthly Earnings</span>
            </div>
          </Card>

          <Card padding="md" className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-info-light)' }}>
              <Clock size={24} color="var(--color-info)" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{formatPrice(stats.avgSalePrice)}</span>
              <span className={styles.statLabel}>Avg Sale Price</span>
            </div>
          </Card>
        </div>

        {/* Pending Actions */}
        <Card padding="md" className={styles.actionsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pending Actions</h2>
          </div>
          <div className={styles.actionsList}>
            <div className={styles.actionItem}>
              <div className={styles.actionIcon} style={{ backgroundColor: 'var(--color-warning-light)' }}>
                <Clock size={18} color="var(--color-warning)" />
              </div>
              <div className={styles.actionContent}>
                <span className={styles.actionTitle}>Counter-offer pending response</span>
                <span className={styles.actionMeta}>
                  Lakers vs Celtics • $90 counter • Expires in 6h
                </span>
              </div>
              <Link to="/listings/listing-5" className={styles.actionLink}>
                View Details <ChevronRight size={16} />
              </Link>
            </div>

            <div className={styles.actionItem}>
              <div className={styles.actionIcon} style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                <TrendingUp size={18} />
              </div>
              <div className={styles.actionContent}>
                <span className={styles.actionTitle}>Auction ending soon</span>
                <span className={styles.actionMeta}>
                  Taylor Swift tickets • Current bid $185 • 4h remaining
                </span>
              </div>
              <Link to="/listings/listing-1" className={styles.actionLink}>
                View <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Listings Table */}
        <Card padding="none" className={styles.listingsCard}>
          <div className={styles.listingsHeader}>
            <h2 className={styles.cardTitle}>Your Listings</h2>
            <div className={styles.tabs}>
              <button
                className={clsx(styles.tab, activeTab === 'active' && styles.activeTab)}
                onClick={() => setActiveTab('active')}
              >
                Active ({activeListings.length})
              </button>
              <button
                className={clsx(styles.tab, activeTab === 'sold' && styles.activeTab)}
                onClick={() => setActiveTab('sold')}
              >
                Sold ({soldListings.length})
              </button>
              <button
                className={clsx(styles.tab, activeTab === 'expired' && styles.activeTab)}
                onClick={() => setActiveTab('expired')}
              >
                Expired (0)
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className={styles.tableHeader}>
            <span className={styles.colEvent}>Event</span>
            <span className={styles.colType}>Type</span>
            <span className={styles.colPrice}>Price</span>
            <span className={styles.colBids}>Bids/Interest</span>
            <span className={styles.colTime}>Time</span>
            <span className={styles.colActions}></span>
          </div>

          {/* Table Body */}
          <div className={styles.tableBody}>
            {isLoading ? (
              <div className={styles.loading}>Loading listings...</div>
            ) : error ? (
              <div className={styles.error}>Error: {error}</div>
            ) : activeTab === 'active' && activeListings.length > 0 ? (
              activeListings.map((listing) => (
                <ListingRow key={listing.id} listing={listing} onDelete={deleteListing} />
              ))
            ) : activeTab === 'active' ? (
              <div className={styles.emptyState}>
                <Package size={48} strokeWidth={1} />
                <h3>No active listings</h3>
                <p>Create a listing to start selling your tickets</p>
                <Button onClick={() => navigate('/sell')}>Create Listing</Button>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Package size={48} strokeWidth={1} />
                <h3>No {activeTab} listings</h3>
                <p>Your {activeTab} listings will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
