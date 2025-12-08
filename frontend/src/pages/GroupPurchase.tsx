import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Users,
  Clock,
  Copy,
  Check,
  Plus,
  Mail,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Button, Card, Badge, Input, Modal, ModalFooter } from '../components/common';
import { useCountdown } from '../hooks/useCountdown';
import { mockGroups, mockListings, currentUser } from '../data/mockData';
import styles from './GroupPurchase.module.css';

export const GroupPurchase: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [newMaxBid, setNewMaxBid] = useState('');

  // Get group data (or create mock for demo)
  const group = mockGroups.find((g) => g.id === groupId) || mockGroups[0];
  const listing = group?.listing || mockListings[5];

  const countdown = useCountdown(group?.deadline);
  const auctionCountdown = useCountdown(listing?.auctionEndTime);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const copyInviteLink = () => {
    const link = `https://tickx.com/groups/join/${group?.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const confirmedMembers = group?.members.filter((m) => m.paymentStatus === 'confirmed').length || 0;
  const pendingMembers = group?.members.filter((m) => m.paymentStatus === 'pending').length || 0;
  const spotsRemaining = (group?.targetQuantity || 4) - (group?.members.length || 0);

  const isOrganizer = group?.organizerId === currentUser.id;
  const currentUserMember = group?.members.find((m) => m.userId === currentUser.id);

  const groupMaxBid = group?.members.reduce((sum, m) => sum + (m.maxPricePerTicket || 0), 0) || 0;
  const pricePerPerson = listing?.currentPrice || 0;

  if (!group || !listing) {
    return (
      <div className={styles.notFound}>
        <h1>Group Not Found</h1>
        <p>This group doesn't exist or has expired.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link to={`/listings/${listing.id}`} className={styles.backLink}>
            <ChevronLeft size={20} />
            Back to Listing
          </Link>
        </div>

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
              <p className={styles.eventMeta}>
                {format(new Date(listing.event.eventDate), 'EEE, MMM d @ h:mm a')} •{' '}
                {listing.event.venue.name}
              </p>
              <p className={styles.ticketInfo}>
                Section {listing.section} • Row {listing.row} • {listing.quantity} tickets
              </p>
            </div>
          </div>
        </Card>

        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            {/* Group Status Card */}
            <Card padding="md" className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <div>
                  <h2 className={styles.cardTitle}>
                    <Users size={20} />
                    Your Group ({confirmedMembers}/{group.targetQuantity} confirmed)
                  </h2>
                  <p className={styles.statusSubtitle}>
                    {group.status === 'forming'
                      ? `${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining`
                      : group.status === 'bidding'
                        ? 'Group complete - Bidding active'
                        : 'Waiting for all members to confirm'}
                  </p>
                </div>
                {countdown && (
                  <div className={styles.deadline}>
                    <Clock size={16} />
                    <span>
                      {countdown.hours > 0
                        ? `${countdown.hours}h ${countdown.minutes}m left`
                        : `${countdown.minutes}m left`}
                    </span>
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className={styles.membersList}>
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className={clsx(
                      styles.memberItem,
                      member.userId === currentUser.id && styles.currentUser
                    )}
                  >
                    <img
                      src={member.user.avatarUrl}
                      alt=""
                      className={styles.memberAvatar}
                    />
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>
                        {member.userId === currentUser.id
                          ? 'You'
                          : member.user.name}
                        {member.userId === group.organizerId && (
                          <Badge variant="primary" size="sm">
                            Organizer
                          </Badge>
                        )}
                      </span>
                      <span className={styles.memberMeta}>
                        {member.quantity} ticket{member.quantity !== 1 ? 's' : ''} •{' '}
                        {formatPrice(pricePerPerson * member.quantity)}
                      </span>
                    </div>
                    <div className={styles.memberStatus}>
                      {member.paymentStatus === 'confirmed' ? (
                        <Badge variant="success" size="sm" icon={<CheckCircle size={12} />}>
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" icon={<Clock size={12} />}>
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: spotsRemaining }).map((_, index) => (
                  <div key={`empty-${index}`} className={styles.emptySlot}>
                    <div className={styles.emptyAvatar}>
                      <Plus size={20} />
                    </div>
                    <span className={styles.emptyText}>Invite a friend</span>
                  </div>
                ))}
              </div>

              {/* Invite Actions */}
              {spotsRemaining > 0 && (
                <div className={styles.inviteActions}>
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={copiedLink ? <Check size={18} /> : <Copy size={18} />}
                    onClick={copyInviteLink}
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
                  </Button>
                  <Button
                    variant="tertiary"
                    fullWidth
                    leftIcon={<Mail size={18} />}
                    onClick={() => setShowInviteModal(true)}
                  >
                    Send Invites
                  </Button>
                </div>
              )}

              {/* Pending Actions */}
              {pendingMembers > 0 && isOrganizer && (
                <div className={styles.pendingNotice}>
                  <AlertCircle size={18} />
                  <span>
                    {pendingMembers} member{pendingMembers !== 1 ? 's' : ''} haven't confirmed payment yet
                  </span>
                  <Button variant="tertiary" size="sm">
                    Send Reminder
                  </Button>
                </div>
              )}
            </Card>

            {/* Group Bidding Card */}
            {(listing.listingType === 'auction' || listing.listingType === 'hybrid') && (
              <Card padding="md" className={styles.biddingCard}>
                <h2 className={styles.cardTitle}>Group Bidding</h2>

                <div className={styles.biddingInfo}>
                  <div className={styles.biddingRow}>
                    <span>Current winning bid</span>
                    <span className={styles.currentBid}>
                      {formatPrice(listing.currentPrice)}/ticket
                    </span>
                  </div>
                  <div className={styles.biddingRow}>
                    <span>Your group's max bid</span>
                    <span className={styles.groupMax}>
                      {formatPrice(groupMaxBid / group.targetQuantity)}/ticket
                    </span>
                  </div>
                  {auctionCountdown && (
                    <div className={styles.biddingRow}>
                      <span>Auction ends in</span>
                      <span className={styles.auctionTime}>
                        {auctionCountdown.hours > 0
                          ? `${auctionCountdown.hours}h ${auctionCountdown.minutes}m`
                          : `${auctionCountdown.minutes}m ${auctionCountdown.seconds}s`}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.biddingStatus}>
                  {listing.currentPrice * group.targetQuantity <= groupMaxBid ? (
                    <div className={styles.statusWinning}>
                      <CheckCircle size={20} />
                      <span>Your group is winning!</span>
                    </div>
                  ) : (
                    <div className={styles.statusOutbid}>
                      <AlertCircle size={20} />
                      <span>Your group has been outbid</span>
                    </div>
                  )}
                </div>

                <Button fullWidth onClick={() => setShowBidModal(true)}>
                  Increase Group Max Bid
                </Button>

                <p className={styles.biddingNote}>
                  If you win, each member pays their share of the final price proportionally.
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <Card padding="md" className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Cost Summary</h3>

              <div className={styles.costBreakdown}>
                <div className={styles.costRow}>
                  <span>Your tickets (1)</span>
                  <span>{formatPrice(pricePerPerson)}</span>
                </div>
                <div className={styles.costRow}>
                  <span>Service fee (10%)</span>
                  <span>{formatPrice(pricePerPerson * 0.1)}</span>
                </div>
                <div className={clsx(styles.costRow, styles.totalRow)}>
                  <span>Your total</span>
                  <span>{formatPrice(pricePerPerson * 1.1)}</span>
                </div>
              </div>

              {currentUserMember?.paymentStatus === 'pending' ? (
                <Button fullWidth size="lg">
                  Confirm & Pay {formatPrice(pricePerPerson * 1.1)}
                </Button>
              ) : (
                <div className={styles.confirmedStatus}>
                  <CheckCircle size={24} />
                  <span>Payment Confirmed</span>
                  <p>You'll only be charged if the group wins</p>
                </div>
              )}

              <div className={styles.guaranteeNote}>
                <p>
                  <strong>No charge until group wins.</strong> Your payment method is authorized but won't be charged unless your group wins the auction.
                </p>
              </div>
            </Card>

            {/* Organizer Actions */}
            {isOrganizer && (
              <Card padding="md" className={styles.organizerCard}>
                <h3 className={styles.summaryTitle}>Organizer Actions</h3>
                <div className={styles.organizerActions}>
                  <Button variant="secondary" fullWidth size="sm">
                    Edit Deadline
                  </Button>
                  <Button variant="tertiary" fullWidth size="sm">
                    Remove Member
                  </Button>
                  <Button variant="tertiary" fullWidth size="sm" className={styles.dangerButton}>
                    Cancel Group
                  </Button>
                </div>
              </Card>
            )}
          </aside>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Friends"
        size="sm"
      >
        <div className={styles.inviteModalContent}>
          <p>Share this link with your friends to join the group:</p>
          <div className={styles.inviteLinkBox}>
            <code>https://tickx.com/groups/join/{group.inviteCode}</code>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={copiedLink ? <Check size={16} /> : <Copy size={16} />}
              onClick={copyInviteLink}
            >
              {copiedLink ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className={styles.inviteOptions}>
            <Button variant="secondary" fullWidth leftIcon={<MessageCircle size={18} />}>
              Share via Text
            </Button>
            <Button variant="secondary" fullWidth leftIcon={<Mail size={18} />}>
              Share via Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Increase Your Max Bid"
        size="sm"
      >
        <div className={styles.bidModalContent}>
          <p>
            Your current max bid: <strong>{formatPrice(currentUserMember?.maxPricePerTicket || 0)}/ticket</strong>
          </p>
          <Input
            label="New Max Bid (per ticket)"
            type="number"
            value={newMaxBid}
            onChange={(e) => setNewMaxBid(e.target.value)}
            placeholder="Enter amount"
            hint="We'll bid up to this amount on your behalf"
            leftIcon={<span>$</span>}
            fullWidth
          />
          <p className={styles.bidNote}>
            This increases your share of the group's max bid. Other members' contributions remain the same.
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBidModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowBidModal(false)}>
            Update Max Bid
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GroupPurchase;
