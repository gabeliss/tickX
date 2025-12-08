import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Ticket,
  Zap,
  Gavel,
  Tag,
  TrendingDown,
  Check,
  Lightbulb,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Button, Card, Input, Select } from '../components/common';
import { mockEvents } from '../data/mockData';
import type { ListingType, Event } from '../types';
import styles from './CreateListing.module.css';

type Step = 'tickets' | 'details' | 'type' | 'pricing' | 'options' | 'review';

const STEPS: { id: Step; label: string }[] = [
  { id: 'tickets', label: 'Add Tickets' },
  { id: 'details', label: 'Confirm Details' },
  { id: 'type', label: 'Listing Type' },
  { id: 'pricing', label: 'Set Pricing' },
  { id: 'options', label: 'Options' },
  { id: 'review', label: 'Review' },
];

const LISTING_TYPES: {
  id: ListingType;
  label: string;
  description: string;
  icon: React.ElementType;
  recommended?: boolean;
}[] = [
  {
    id: 'hybrid',
    label: 'Auction + Buy Now',
    description: 'Let buyers bid or purchase instantly at your price',
    icon: Zap,
    recommended: true,
  },
  {
    id: 'auction',
    label: 'Standard Auction',
    description: 'Buyers compete, highest bidder wins',
    icon: Gavel,
  },
  {
    id: 'fixed',
    label: 'Fixed Price',
    description: 'Set your price, first buyer gets it',
    icon: Tag,
  },
  {
    id: 'declining',
    label: 'Declining Price',
    description: 'Price drops over time until someone buys',
    icon: TrendingDown,
  },
];

export const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('tickets');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seats, setSeats] = useState('');
  const [quantity, setQuantity] = useState('2');
  const [listingType, setListingType] = useState<ListingType>('hybrid');
  const [startingPrice, setStartingPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [floorPrice, setFloorPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('3');
  const [allowSplitting, setAllowSplitting] = useState<'all' | 'min2' | 'none'>('none');
  const [bidIncrement, setBidIncrement] = useState('recommended');

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredEvents = mockEvents.filter((event) =>
    event.name.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'tickets':
        return selectedEvent !== null;
      case 'details':
        return section !== '' && row !== '' && quantity !== '';
      case 'type':
        return true;
      case 'pricing':
        if (listingType === 'fixed') {
          return startingPrice !== '';
        }
        if (listingType === 'declining') {
          return startingPrice !== '' && floorPrice !== '';
        }
        if (listingType === 'auction') {
          return startingPrice !== '';
        }
        return startingPrice !== '' && buyNowPrice !== '';
      case 'options':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'tickets':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>How would you like to add tickets?</h2>

            <div className={styles.ticketOptions}>
              <button className={styles.ticketOption}>
                <LinkIcon size={24} />
                <span className={styles.optionLabel}>Connect Ticketmaster</span>
                <span className={styles.optionHint}>Import directly from TM</span>
              </button>
              <button className={styles.ticketOption}>
                <LinkIcon size={24} />
                <span className={styles.optionLabel}>Connect AXS</span>
                <span className={styles.optionHint}>Import directly from AXS</span>
              </button>
              <button className={clsx(styles.ticketOption, styles.selected)}>
                <Ticket size={24} />
                <span className={styles.optionLabel}>Enter Manually</span>
                <span className={styles.optionHint}>Type in ticket details</span>
              </button>
              <button className={styles.ticketOption}>
                <Upload size={24} />
                <span className={styles.optionLabel}>Scan/Upload</span>
                <span className={styles.optionHint}>Take photo of tickets</span>
              </button>
            </div>

            <div className={styles.eventSelector}>
              <h3 className={styles.sectionTitle}>Select Event</h3>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.eventList}>
                {filteredEvents.slice(0, 5).map((event) => (
                  <button
                    key={event.id}
                    className={clsx(
                      styles.eventItem,
                      selectedEvent?.id === event.id && styles.selected
                    )}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <img src={event.imageUrl} alt="" className={styles.eventImage} />
                    <div className={styles.eventDetails}>
                      <span className={styles.eventName}>{event.name}</span>
                      <span className={styles.eventMeta}>
                        {format(new Date(event.eventDate), 'MMM d, yyyy')} •{' '}
                        {event.venue.name}
                      </span>
                    </div>
                    {selectedEvent?.id === event.id && (
                      <Check size={20} className={styles.checkIcon} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Confirm Ticket Details</h2>

            {selectedEvent && (
              <Card padding="md" className={styles.selectedEventCard}>
                <img
                  src={selectedEvent.imageUrl}
                  alt=""
                  className={styles.selectedEventImage}
                />
                <div>
                  <h3 className={styles.selectedEventName}>{selectedEvent.name}</h3>
                  <p className={styles.selectedEventMeta}>
                    {format(new Date(selectedEvent.eventDate), 'EEEE, MMMM d, yyyy • h:mm a')}
                    <br />
                    {selectedEvent.venue.name}, {selectedEvent.venue.city}
                  </p>
                </div>
              </Card>
            )}

            <div className={styles.formGrid}>
              <Input
                label="Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g., 112, Floor A, Orchestra"
                fullWidth
              />
              <Input
                label="Row"
                value={row}
                onChange={(e) => setRow(e.target.value)}
                placeholder="e.g., F, 3, AA"
                fullWidth
              />
            </div>

            <Input
              label="Seat Numbers"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              placeholder="e.g., 5, 6, 7, 8"
              hint="Enter seat numbers separated by commas"
              fullWidth
            />

            <Select
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              options={[
                { value: '1', label: '1 ticket' },
                { value: '2', label: '2 tickets' },
                { value: '3', label: '3 tickets' },
                { value: '4', label: '4 tickets' },
                { value: '5', label: '5 tickets' },
                { value: '6', label: '6 tickets' },
              ]}
              fullWidth
            />
          </div>
        );

      case 'type':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>How do you want to sell?</h2>

            <div className={styles.typeOptions}>
              {LISTING_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    className={clsx(
                      styles.typeOption,
                      listingType === type.id && styles.selected
                    )}
                    onClick={() => setListingType(type.id)}
                  >
                    <div className={styles.typeIcon}>
                      <Icon size={24} />
                    </div>
                    <div className={styles.typeContent}>
                      <span className={styles.typeLabel}>
                        {type.label}
                        {type.recommended && (
                          <span className={styles.recommendedBadge}>Recommended</span>
                        )}
                      </span>
                      <span className={styles.typeDescription}>{type.description}</span>
                    </div>
                    <div className={styles.typeRadio}>
                      {listingType === type.id && <Check size={20} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Set Your Prices</h2>

            <div className={styles.pricingForm}>
              {(listingType === 'auction' || listingType === 'hybrid') && (
                <Input
                  label="Starting Bid (per ticket)"
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="Enter amount"
                  leftIcon={<span>$</span>}
                  fullWidth
                />
              )}

              {(listingType === 'fixed' || listingType === 'declining') && (
                <Input
                  label={listingType === 'fixed' ? 'Price (per ticket)' : 'Starting Price (per ticket)'}
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="Enter amount"
                  leftIcon={<span>$</span>}
                  fullWidth
                />
              )}

              <div className={styles.aiSuggestion}>
                <Lightbulb size={18} />
                <span>Similar tickets are priced between $115 - $180</span>
              </div>

              {listingType === 'hybrid' && (
                <Input
                  label="Buy Now Price (per ticket)"
                  type="number"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                  placeholder="Enter amount"
                  hint="Price for instant purchase"
                  leftIcon={<span>$</span>}
                  fullWidth
                />
              )}

              {(listingType === 'auction' || listingType === 'hybrid') && (
                <Input
                  label="Reserve Price (optional)"
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  placeholder="Enter amount"
                  hint="Hidden minimum you'll accept"
                  leftIcon={<span>$</span>}
                  fullWidth
                />
              )}

              {listingType === 'declining' && (
                <Input
                  label="Floor Price (per ticket)"
                  type="number"
                  value={floorPrice}
                  onChange={(e) => setFloorPrice(e.target.value)}
                  placeholder="Enter minimum"
                  hint="Price won't go below this"
                  leftIcon={<span>$</span>}
                  fullWidth
                />
              )}

              {(listingType === 'auction' || listingType === 'hybrid') && (
                <Select
                  label="Auction Duration"
                  value={auctionDuration}
                  onChange={(e) => setAuctionDuration(e.target.value)}
                  options={[
                    { value: '1', label: '1 day' },
                    { value: '3', label: '3 days' },
                    { value: '5', label: '5 days' },
                    { value: '7', label: '7 days' },
                  ]}
                  fullWidth
                />
              )}
            </div>
          </div>
        );

      case 'options':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Additional Options</h2>

            <div className={styles.optionsForm}>
              <div className={styles.optionGroup}>
                <h3 className={styles.optionLabel}>
                  Can buyers purchase fewer than all {quantity} tickets?
                </h3>
                <div className={styles.radioOptions}>
                  <label className={clsx(styles.radioOption, allowSplitting === 'all' && styles.selected)}>
                    <input
                      type="radio"
                      name="splitting"
                      checked={allowSplitting === 'all'}
                      onChange={() => setAllowSplitting('all')}
                    />
                    <span>Yes, any quantity (1-{quantity})</span>
                  </label>
                  <label className={clsx(styles.radioOption, allowSplitting === 'min2' && styles.selected)}>
                    <input
                      type="radio"
                      name="splitting"
                      checked={allowSplitting === 'min2'}
                      onChange={() => setAllowSplitting('min2')}
                    />
                    <span>Yes, but minimum 2 tickets</span>
                  </label>
                  <label className={clsx(styles.radioOption, allowSplitting === 'none' && styles.selected)}>
                    <input
                      type="radio"
                      name="splitting"
                      checked={allowSplitting === 'none'}
                      onChange={() => setAllowSplitting('none')}
                    />
                    <span>No, all {quantity} together only</span>
                  </label>
                </div>
              </div>

              {(listingType === 'auction' || listingType === 'hybrid') && (
                <div className={styles.optionGroup}>
                  <h3 className={styles.optionLabel}>Bid Increment Preference</h3>
                  <div className={styles.radioOptions}>
                    <label className={clsx(styles.radioOption, bidIncrement === 'recommended' && styles.selected)}>
                      <input
                        type="radio"
                        name="increment"
                        checked={bidIncrement === 'recommended'}
                        onChange={() => setBidIncrement('recommended')}
                      />
                      <span>Use recommended ($5 increments)</span>
                    </label>
                    <label className={clsx(styles.radioOption, bidIncrement === 'custom' && styles.selected)}>
                      <input
                        type="radio"
                        name="increment"
                        checked={bidIncrement === 'custom'}
                        onChange={() => setBidIncrement('custom')}
                      />
                      <span>Custom increment</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Review Your Listing</h2>

            <Card padding="lg" className={styles.reviewCard}>
              {selectedEvent && (
                <div className={styles.reviewSection}>
                  <h3>Event</h3>
                  <p className={styles.reviewValue}>{selectedEvent.name}</p>
                  <p className={styles.reviewMeta}>
                    {format(new Date(selectedEvent.eventDate), 'EEEE, MMMM d, yyyy • h:mm a')}
                  </p>
                  <p className={styles.reviewMeta}>
                    {selectedEvent.venue.name}, {selectedEvent.venue.city}
                  </p>
                </div>
              )}

              <div className={styles.reviewSection}>
                <h3>Tickets</h3>
                <p className={styles.reviewValue}>
                  Section {section} • Row {row}
                </p>
                <p className={styles.reviewMeta}>
                  {seats || 'Seats TBD'} ({quantity} ticket{parseInt(quantity) !== 1 ? 's' : ''})
                </p>
              </div>

              <div className={styles.reviewSection}>
                <h3>Listing Type</h3>
                <p className={styles.reviewValue}>
                  {LISTING_TYPES.find((t) => t.id === listingType)?.label}
                </p>
              </div>

              <div className={styles.reviewSection}>
                <h3>Pricing</h3>
                {listingType === 'hybrid' && (
                  <>
                    <p className={styles.reviewValue}>
                      Starting Bid: {formatPrice(parseFloat(startingPrice) || 0)}
                    </p>
                    <p className={styles.reviewValue}>
                      Buy Now: {formatPrice(parseFloat(buyNowPrice) || 0)}
                    </p>
                  </>
                )}
                {listingType === 'auction' && (
                  <p className={styles.reviewValue}>
                    Starting Bid: {formatPrice(parseFloat(startingPrice) || 0)}
                  </p>
                )}
                {listingType === 'fixed' && (
                  <p className={styles.reviewValue}>
                    Price: {formatPrice(parseFloat(startingPrice) || 0)}
                  </p>
                )}
                {listingType === 'declining' && (
                  <>
                    <p className={styles.reviewValue}>
                      Starting: {formatPrice(parseFloat(startingPrice) || 0)}
                    </p>
                    <p className={styles.reviewValue}>
                      Floor: {formatPrice(parseFloat(floorPrice) || 0)}
                    </p>
                  </>
                )}
                {reservePrice && (
                  <p className={styles.reviewMeta}>
                    Reserve: {formatPrice(parseFloat(reservePrice))} (hidden)
                  </p>
                )}
              </div>

              <div className={styles.reviewSection}>
                <h3>Potential Earnings</h3>
                <div className={styles.earningsCalc}>
                  <div className={styles.earningsRow}>
                    <span>If sold at {listingType === 'fixed' ? 'price' : 'Buy Now'}:</span>
                    <span>
                      {formatPrice((parseFloat(buyNowPrice || startingPrice) || 0) * parseInt(quantity))}
                    </span>
                  </div>
                  <div className={styles.earningsRow}>
                    <span>TickX fee (10%):</span>
                    <span>
                      -{formatPrice((parseFloat(buyNowPrice || startingPrice) || 0) * parseInt(quantity) * 0.1)}
                    </span>
                  </div>
                  <div className={clsx(styles.earningsRow, styles.total)}>
                    <span>Your earnings:</span>
                    <span>
                      {formatPrice((parseFloat(buyNowPrice || startingPrice) || 0) * parseInt(quantity) * 0.9)}
                    </span>
                  </div>
                </div>
              </div>

              <label className={styles.confirmCheckbox}>
                <input type="checkbox" />
                <span>I confirm these tickets are valid and I can transfer them</span>
              </label>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className={styles.title}>Sell Tickets</h1>
        </div>

        {/* Progress Steps */}
        <div className={styles.progress}>
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={clsx(
                styles.progressStep,
                index <= currentStepIndex && styles.completed,
                step.id === currentStep && styles.current
              )}
            >
              <div className={styles.stepIndicator}>
                {index < currentStepIndex ? <Check size={14} /> : index + 1}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={styles.content}>{renderStepContent()}</div>

        {/* Navigation */}
        <div className={styles.navigation}>
          {currentStepIndex > 0 && (
            <Button variant="secondary" onClick={goToPrevStep}>
              <ChevronLeft size={18} />
              Back
            </Button>
          )}
          <div className={styles.navSpacer} />
          {currentStep === 'review' ? (
            <Button onClick={handleSubmit} loading={isSubmitting} disabled={!canProceed()}>
              Publish Listing
            </Button>
          ) : (
            <Button onClick={goToNextStep} disabled={!canProceed()}>
              Continue
              <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
