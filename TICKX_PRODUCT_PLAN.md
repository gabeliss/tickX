# TickX Product Plan
## A Next-Generation Ticket Marketplace with Dynamic Bidding

---

# Table of Contents

1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Market Analysis & Differentiation](#2-market-analysis--differentiation)
3. [Core Product Features](#3-core-product-features)
4. [Auction Mechanics & Business Rules](#4-auction-mechanics--business-rules)
5. [User Journeys](#5-user-journeys)
6. [Edge Cases & Exception Handling](#6-edge-cases--exception-handling)
7. [UI/UX Design Specifications](#7-uiux-design-specifications)
8. [Technical Architecture](#8-technical-architecture)
9. [AI Features Roadmap](#9-ai-features-roadmap)
10. [MVP Scope & Phased Roadmap](#10-mvp-scope--phased-roadmap)
11. [Open Questions for Discussion](#11-open-questions-for-discussion)

---

# 1. Executive Summary & Vision

## 1.1 The Problem

The secondary ticket market is dominated by incumbents (Ticketmaster/LiveNation, StubHub, SeatGeek, Vivid Seats) that have grown complacent:

- **Static Pricing**: Sellers list at fixed prices; buyers take it or leave it
- **No Price Discovery**: True market value is obscured
- **Poor UX**: Cluttered interfaces, aggressive upselling, hidden fees
- **No Innovation**: Little meaningful advancement in the age of AI
- **Social Friction**: One person always gets stuck buying tickets for the group

## 1.2 The TickX Vision

**TickX is a modern ticket marketplace that brings dynamic pricing, transparent bidding, and AI-powered intelligence to ticket resale.**

We believe:
- **Sellers deserve flexibility** to choose how they sell (auction, fixed price, hybrid)
- **Buyers deserve transparency** in pricing and fair access to deals
- **Groups deserve better** than Venmo requests and IOU tracking
- **Everyone deserves** a beautiful, intuitive experience

## 1.3 Key Differentiators

| Feature | Incumbents | TickX |
|---------|------------|-------|
| Pricing Model | Fixed price only | Auction, Fixed, Hybrid, Declining |
| Price Transparency | Hidden fees until checkout | All-in pricing upfront |
| Group Purchases | One person pays all | Split payment built-in |
| AI Integration | Minimal | Smart pricing, demand forecasting, recommendations |
| Negotiation | None | Counter-offers, bid/ask spread visibility |
| UX Quality | Cluttered, aggressive | Clean, modern, mobile-first |

---

# 2. Market Analysis & Differentiation

## 2.1 Market Size

- **Global secondary ticket market**: ~$15B annually
- **US market**: ~$9B annually
- **Growth rate**: 8-10% CAGR
- **Key segments**: Concerts (45%), Sports (35%), Theater (15%), Other (5%)

## 2.2 Competitive Landscape

### Ticketmaster/LiveNation
- **Strengths**: Primary ticket monopoly, venue partnerships, brand recognition
- **Weaknesses**: Universally hated UX, fee opacity, antitrust scrutiny
- **Opportunity**: Regulatory pressure may create openings

### StubHub
- **Strengths**: Established brand, buyer protection, international presence
- **Weaknesses**: High fees, no innovation, static pricing only
- **Opportunity**: Users actively seeking alternatives

### SeatGeek
- **Strengths**: Good UX, "Deal Score" feature, API partnerships
- **Weaknesses**: Still fundamentally static pricing, limited seller tools
- **Opportunity**: We can out-innovate them on marketplace dynamics

### Vivid Seats
- **Strengths**: Competitive fees, rewards program
- **Weaknesses**: Smaller inventory, less brand awareness
- **Opportunity**: Similar size means we can compete directly

## 2.3 Our Strategic Positioning

**Phase 1**: Differentiate on marketplace model (bidding) and UX
**Phase 2**: Build AI-powered features that create switching costs
**Phase 3**: Expand to primary ticket partnerships

---

# 3. Core Product Features

## 3.1 Listing Types (Seller Configurable)

### 3.1.1 Standard Auction
- English-style ascending bid auction
- Seller sets: starting price, reserve price (optional), duration, bid increment preferences
- Auction runs until end time (with anti-sniping protection)
- Highest bidder wins if reserve is met

### 3.1.2 Buy Now (Fixed Price)
- Traditional fixed-price listing
- Seller sets single price
- First buyer to purchase wins
- Instant transaction

### 3.1.3 Auction + Buy Now (Hybrid)
- Auction with immediate purchase option
- Seller sets: starting bid, reserve (optional), AND "Buy Now" price
- Buyers can bid OR purchase instantly at Buy Now price
- Buy Now option disappears once bidding reaches a threshold (configurable, default 80% of Buy Now)

### 3.1.4 Declining Price (Dutch Style)
- Price starts high and decreases on a schedule
- Seller sets: starting price, floor price, decline schedule
- First buyer to accept current price wins
- Great for last-minute inventory as event approaches

## 3.2 Buyer Features

### 3.2.1 Bidding
- Place bids on auction listings
- Set maximum bid (proxy bidding - system bids incrementally up to max)
- Receive notifications when outbid
- View bid history and current position

### 3.2.2 Watchlist
- Save events and listings of interest
- Price drop alerts
- New listing alerts for watched events

### 3.2.3 Group Purchase
- Create a "ticket group" for an event
- Invite friends via link/SMS/email
- Each person claims and pays for their own ticket(s)
- Organizer can set deadline for group to complete
- If listing is auction: group bids together, splits cost proportionally

### 3.2.4 Smart Recommendations
- AI-powered event suggestions based on:
  - Past purchases and browsing
  - Location and preferred venues
  - Artist/team follows
  - Price sensitivity profile

### 3.2.5 Price Intelligence
- "Fair Price" indicator on listings
- Historical price data for comparable tickets
- Demand indicators ("High demand - 50 people watching")
- Price prediction ("Prices typically drop 20% day-of for this venue")

## 3.3 Seller Features

### 3.3.1 Flexible Listing Creation
- Choose listing type (auction, fixed, hybrid, declining)
- Configure all parameters per listing type
- Set ticket splitting rules (allow partial purchases or all-or-nothing)
- Upload ticket proof/verification

### 3.3.2 Smart Pricing Assistance
- AI-suggested starting price based on:
  - Comparable recent sales
  - Current demand signals
  - Time until event
  - Seat quality/section
- Reserve price recommendations

### 3.3.3 Offer Management
- View all incoming bids
- Accept, reject, or counter-offer any bid
- Bulk actions for power sellers
- Auto-accept rules (optional)

### 3.3.4 Seller Dashboard
- Active listings overview
- Sales history and analytics
- Earnings tracking
- Performance metrics (sell-through rate, average sale price)

## 3.4 Trust & Safety

### 3.4.1 Ticket Verification
- Integration with primary ticket platforms for transfer verification
- Barcode/QR validation where possible
- Seller verification tiers (verified seller badge)

### 3.4.2 Buyer Protection
- 100% money-back guarantee if tickets are invalid
- Escrow-based payments (funds released after verified transfer)
- Dispute resolution process

### 3.4.3 Seller Protection
- Buyer payment verified before ticket transfer required
- Clear policies on buyer no-shows
- Fraud detection systems

---

# 4. Auction Mechanics & Business Rules

## 4.1 Bid Increments

Dynamic bid increments based on current price:

| Current Price | Minimum Increment |
|---------------|-------------------|
| $0 - $24.99 | $1 |
| $25 - $99.99 | $2 |
| $100 - $249.99 | $5 |
| $250 - $499.99 | $10 |
| $500 - $999.99 | $25 |
| $1,000+ | $50 |

**Seller Override**: Sellers can increase (but not decrease) the minimum increment for their listing.

## 4.2 Anti-Sniping Protection

**Soft Close Mechanism**:
- If a bid is placed within the last **2 minutes** of an auction, the end time extends by **2 minutes**
- Maximum extensions: **10** (20 minutes total possible extension)
- This prevents last-second sniping and allows genuine price discovery

## 4.3 Reserve Prices

- Sellers can set a hidden reserve price
- If auction ends below reserve, sale does not complete
- Buyers see "Reserve not yet met" indicator (but not the actual reserve)
- Once reserve is met, indicator changes to "Reserve met"

## 4.4 Proxy Bidding

- Buyers can set a maximum bid amount
- System automatically bids the minimum necessary to maintain winning position
- If two proxy bids exist, system bids up to the lower max, then one increment
- Buyer's maximum is never revealed unless matched

**Example**:
- Current bid: $50
- Buyer A sets max bid: $100
- Buyer B sets max bid: $75
- System bids to $77 for Buyer A ($75 + increment)
- Buyer A wins at $77, not $100

## 4.5 Partial Quantity Bidding

**Seller Configuration Options**:

1. **Allow Splitting**: Buyers can bid on any quantity (1 to N)
   - Remaining tickets stay listed
   - Each partial sale is independent

2. **Minimum Group Size**: Buyers must bid on at least X tickets
   - Prevents seller from being stuck with single odd ticket
   - Common setting: minimum 2

3. **All or Nothing**: Buyer must purchase entire listing
   - Used when seller wants to sell all together

**Pricing for Partial Quantities**:
- Bids are per-ticket when splitting is allowed
- Total bid = per-ticket bid × quantity
- Seller sees total and per-ticket breakdown

## 4.6 Counter-Offers

- Seller can counter any bid below their desired price
- Counter-offer is sent to bidder with expiration (default: 24 hours or end of auction, whichever is sooner)
- Buyer can accept, decline, or re-counter (once)
- Counter-offer does not affect other bidders
- If accepted, sale completes immediately at counter-offer price

## 4.7 Time-Based Rules

### Auction End Time Constraints
- Auctions must end at least **4 hours** before event start time
- System automatically adjusts if seller tries to set later end time
- Rationale: Allow time for ticket transfer verification

### Declining Price Listings
- Must have floor price that's at least 20% of starting price
- Decline schedule cannot go below floor
- Auto-converts to fixed price at floor when floor is reached

### Last-Minute Listings
- Listings created within 24 hours of event are flagged as "Last Minute"
- Special UI treatment for urgency
- Shortened auction durations allowed (minimum 1 hour)

## 4.8 Fee Structure

### Buyer Fees
- **Service Fee**: 10% of purchase price
- Displayed upfront in all pricing ("all-in" pricing option in UI)

### Seller Fees
- **Marketplace Fee**: 10% of sale price
- Deducted from payout

### Payment Processing
- Standard payment processing fees absorbed by TickX (built into above)
- Payouts to sellers within 5 business days of verified transfer

**Launch Promotion Consideration**: Consider reduced fees (8%/8% or lower) for early adopters to build liquidity.

---

# 5. User Journeys

## 5.1 Buyer Journeys

### 5.1.1 Journey: Finding and Bidding on Tickets (Solo)

```
DISCOVERY
    │
    ├─► Browse homepage (trending events, recommended)
    │   OR
    ├─► Search for specific event/artist/team
    │   OR
    └─► Browse by category (Concerts, Sports, Theater)
          │
          ▼
    EVENT PAGE
    │
    ├─► View event details (date, venue, lineup)
    ├─► See venue map with available sections highlighted
    ├─► Filter listings (section, price range, quantity, listing type)
    │   │
    │   ▼
    LISTING SELECTION
    │
    ├─► View listing details
    │   ├─► Current bid / price
    │   ├─► Time remaining (if auction)
    │   ├─► Seller rating and verification status
    │   ├─► Ticket details (section, row, seat numbers)
    │   ├─► "Fair Price" indicator
    │   └─► Bid history (if auction)
    │       │
    │       ▼
    ACTION
    │
    ├─► [If Auction] Place bid
    │   ├─► Enter bid amount (shown: minimum required)
    │   ├─► Optional: Set max bid for proxy bidding
    │   ├─► Confirm bid
    │   └─► Receive confirmation + notifications setup
    │
    ├─► [If Buy Now / Fixed] Purchase
    │   ├─► Select quantity
    │   ├─► Review total (price + fees, all-in)
    │   ├─► Enter payment info (or use saved)
    │   └─► Confirm purchase
    │
    └─► [If Hybrid] Choose to bid or buy now
            │
            ▼
    POST-ACTION
    │
    ├─► [If Bid] Monitor auction
    │   ├─► Receive outbid notifications
    │   ├─► Option to increase bid
    │   └─► If winner: proceed to payment
    │
    └─► [If Purchase] Complete transaction
        ├─► Payment processed (held in escrow)
        ├─► Await ticket transfer from seller
        ├─► Confirm receipt of tickets
        └─► Funds released to seller
```

### 5.1.2 Journey: Group Purchase

```
ORGANIZER INITIATES
    │
    ├─► Find event and listing they want
    ├─► Click "Buy as Group"
    ├─► Set group size (e.g., 4 tickets)
    ├─► Create group and get shareable link
    │   │
    │   ▼
INVITE FRIENDS
    │
    ├─► Share link via SMS, email, WhatsApp, etc.
    ├─► Friends click link → land on group page
    ├─► Each friend claims their spot(s)
    │   ├─► Signs in / creates account
    │   ├─► Enters payment info for their portion
    │   └─► Confirms participation
    │       │
    │       ▼
GROUP STATUS
    │
    ├─► Organizer and all members see real-time status
    │   ├─► Who has joined
    │   ├─► Who has confirmed payment
    │   ├─► Countdown to deadline (set by organizer)
    │   │
    │   ▼
AUCTION BIDDING (if applicable)
    │
    ├─► Group bids together
    │   ├─► Any member can propose a bid
    │   ├─► Requires organizer approval OR auto-approve setting
    │   ├─► Cost split shown per person
    │   └─► All members' payment methods charged proportionally if win
    │       │
    │       ▼
COMPLETION
    │
    ├─► [If Win Auction / Buy Now]
    │   ├─► Each member charged their portion
    │   ├─► Tickets distributed to each member individually
    │   └─► Everyone has their own ticket in their account
    │
    └─► [If Group Incomplete by Deadline]
        ├─► Organizer notified
        ├─► Options: extend deadline, reduce quantity, cancel
        └─► No charges until group is complete
```

### 5.1.3 Journey: Watching and Getting Deals

```
PASSIVE DISCOVERY
    │
    ├─► Add events to Watchlist
    ├─► Set price alerts ("Notify me under $100")
    ├─► Follow artists/teams
    │   │
    │   ▼
NOTIFICATIONS
    │
    ├─► "Price dropped! Tickets now available for $85"
    ├─► "Auction ending soon - currently at $75"
    ├─► "New listing for [Watched Event] - $90"
    │   │
    │   ▼
QUICK ACTION
    │
    ├─► Tap notification → deep link to listing
    └─► Complete purchase/bid in 2-3 taps
```

## 5.2 Seller Journeys

### 5.2.1 Journey: Creating a Listing

```
INITIATE LISTING
    │
    ├─► Click "Sell Tickets"
    ├─► Select how to add tickets
    │   ├─► Connect ticket account (Ticketmaster, AXS, etc.)
    │   ├─► Enter ticket details manually
    │   └─► Upload ticket file/screenshot
    │       │
    │       ▼
TICKET DETAILS
    │
    ├─► Event auto-detected or manually selected
    ├─► Confirm section, row, seat numbers
    ├─► Specify quantity
    ├─► Verify ticket validity (system check where possible)
    │   │
    │   ▼
LISTING TYPE SELECTION
    │
    ├─► Choose listing type:
    │   ├─► Standard Auction
    │   ├─► Buy Now (Fixed Price)
    │   ├─► Auction + Buy Now (Hybrid)
    │   └─► Declining Price
    │       │
    │       ▼
CONFIGURE LISTING
    │
    ├─► [Standard Auction]
    │   ├─► Set starting price (AI suggestion shown)
    │   ├─► Set reserve price (optional)
    │   ├─► Set auction duration
    │   ├─► Set bid increment preference (or use default)
    │   └─► Set splitting rules (allow partial, minimum, all-or-nothing)
    │
    ├─► [Buy Now]
    │   ├─► Set price (AI suggestion shown)
    │   └─► Set splitting rules
    │
    ├─► [Hybrid]
    │   ├─► Set starting bid
    │   ├─► Set Buy Now price (AI suggestion for both)
    │   ├─► Set reserve (optional)
    │   ├─► Set duration
    │   └─► Set splitting rules
    │
    └─► [Declining Price]
        ├─► Set starting price
        ├─► Set floor price
        ├─► Set decline schedule (e.g., $5 every hour)
        └─► Set splitting rules
            │
            ▼
REVIEW & PUBLISH
    │
    ├─► Preview listing as buyers will see it
    ├─► See estimated fees and potential payout
    ├─► Confirm and publish
    │   │
    │   ▼
POST-PUBLISH
    │
    ├─► Listing goes live
    ├─► Receive notifications on bids/interest
    ├─► Manage from Seller Dashboard
    └─► Can edit (with restrictions if bids exist)
```

### 5.2.2 Journey: Managing Bids and Offers

```
BID RECEIVED
    │
    ├─► Push notification: "New bid on [Event] - $85"
    ├─► View in Seller Dashboard or tap notification
    │   │
    │   ▼
EVALUATE BID
    │
    ├─► See bid amount, bidder rating, bid history
    ├─► See time remaining in auction
    ├─► See comparison to your reserve/target
    │   │
    │   ▼
TAKE ACTION (if applicable)
    │
    ├─► [Let Auction Run] Do nothing, wait for higher bids
    │
    ├─► [Accept Early] End auction and accept current bid
    │   └─► Useful if bid meets your goal
    │
    ├─► [Counter-Offer] Propose different price to bidder
    │   ├─► Enter counter amount
    │   ├─► Set expiration for counter
    │   └─► Wait for buyer response
    │
    └─► [If Buy Now] Auto-accepted, proceed to transfer
            │
            ▼
SALE COMPLETE
    │
    ├─► Transfer tickets to buyer via platform
    ├─► Buyer confirms receipt
    ├─► Payment released to seller (minus fees)
    └─► Leave/receive reviews
```

### 5.2.3 Journey: Power Seller Management

```
BULK OPERATIONS
    │
    ├─► Upload multiple listings via CSV
    ├─► Set default listing preferences
    ├─► Create listing templates
    │   │
    │   ▼
DASHBOARD ANALYTICS
    │
    ├─► View all active listings in one place
    ├─► Sort/filter by event, status, price, bids
    ├─► See performance metrics:
    │   ├─► Sell-through rate
    │   ├─► Average time to sell
    │   ├─► Average sale vs. listing price
    │   └─► Buyer ratings received
    │       │
    │       ▼
OPTIMIZATION
    │
    ├─► AI suggestions: "Lower price on [listing] to match market"
    ├─► Bulk price adjustments
    └─► Auto-relist unsold tickets with adjusted parameters
```

---

# 6. Edge Cases & Exception Handling

## 6.1 Auction Edge Cases

### 6.1.1 No Bids Received
- **Scenario**: Auction ends with zero bids
- **Handling**:
  - Seller notified
  - Options: relist with adjusted price, convert to fixed price, or remove
  - AI suggests new pricing based on market data

### 6.1.2 Reserve Not Met
- **Scenario**: Highest bid is below reserve price
- **Handling**:
  - Sale does not complete
  - Seller can: lower reserve and accept top bid, relist, or remove
  - Buyer notified: "You had the highest bid but reserve wasn't met. Seller may contact you."
  - Optional: Seller can send counter-offer to top bidder

### 6.1.3 Winning Bidder Doesn't Pay
- **Scenario**: Auction won but payment fails/declined
- **Handling**:
  - 24-hour grace period to update payment method
  - If not resolved: offer to second-highest bidder
  - Non-paying bidder receives strike (3 strikes = suspension)
  - Seller can choose to relist instead of offering to second bidder

### 6.1.4 Seller Cancels Active Auction
- **Scenario**: Seller wants to remove listing with active bids
- **Handling**:
  - Allowed only if no bids yet
  - If bids exist: cannot cancel unless exceptional circumstance (tickets lost/stolen, event cancelled)
  - Repeated cancellations affect seller rating

### 6.1.5 Identical Max Bids (Proxy Tie)
- **Scenario**: Two buyers set exact same maximum bid
- **Handling**: First bid placed wins (timestamp priority)

### 6.1.6 Event Date Changes
- **Scenario**: Event is rescheduled to new date
- **Handling**:
  - Active listings automatically updated with new date
  - Auction end times recalculated if needed
  - All bidders notified of date change
  - Option for bidders to withdraw bids without penalty

## 6.2 Payment Edge Cases

### 6.2.1 Payment Method Expires During Auction
- **Scenario**: Buyer's card on file expires while auction is running
- **Handling**:
  - Check payment validity at bid time (pre-auth small amount)
  - Notify buyer to update before auction ends
  - Grace period to update if they win

### 6.2.2 Group Purchase - One Member Doesn't Pay
- **Scenario**: Group of 4, one person doesn't confirm by deadline
- **Handling**:
  - Organizer notified
  - Options:
    - Extend deadline
    - Kick non-responsive member, find replacement
    - Reduce group size (if listing allows partial)
    - Cancel group purchase
  - Confirmed members NOT charged until group complete

### 6.2.3 Price Dispute
- **Scenario**: Buyer claims they didn't understand final price
- **Handling**:
  - All-in pricing displayed at every step
  - Breakdown always available (base price + service fee)
  - Clear confirmation before payment
  - Dispute resolution team for edge cases

## 6.3 Ticket Transfer Edge Cases

### 6.3.1 Seller Fails to Transfer Tickets
- **Scenario**: Payment complete, seller doesn't transfer within deadline
- **Handling**:
  - Seller has 24 hours after auction end (or 4 hours before event, whichever is sooner)
  - Automatic reminders at 12 hours, 6 hours, 2 hours
  - If not transferred: full refund to buyer, penalty to seller
  - Repeated violations = seller suspension

### 6.3.2 Tickets Invalid
- **Scenario**: Buyer receives tickets but they're rejected at venue
- **Handling**:
  - 100% refund guarantee
  - Seller account suspended pending investigation
  - TickX support assists buyer in finding replacement if possible

### 6.3.3 Duplicate/Fraudulent Tickets
- **Scenario**: Same tickets listed on multiple platforms, sold twice
- **Handling**:
  - Integration with primary platforms helps detect
  - If discovered pre-transfer: block sale, flag seller
  - If discovered at venue: full refund, seller banned

### 6.3.4 Ticket Transfer System Downtime
- **Scenario**: Ticketmaster or other platform is down, can't transfer
- **Handling**:
  - Extend transfer deadline automatically
  - Notify both parties
  - No penalties during platform outages

## 6.4 Event Edge Cases

### 6.4.1 Event Cancelled
- **Scenario**: Event is fully cancelled (not postponed)
- **Handling**:
  - All active listings automatically removed
  - All pending transactions cancelled
  - Buyers with completed purchases: offer refund or credit
  - Sellers: no fees charged

### 6.4.2 Event Postponed
- **Scenario**: Event moved to future date
- **Handling**:
  - Tickets remain valid for new date
  - Active auctions paused, buyer notified
  - Bidders can withdraw without penalty
  - Completed sales: buyer can request refund or keep tickets

### 6.4.3 Venue Change
- **Scenario**: Event moves to different venue
- **Handling**:
  - Listings updated with new venue
  - Seat locations may change
  - All parties notified
  - Refund option if seat quality significantly different

## 6.5 Group Purchase Edge Cases

### 6.5.1 Organizer Abandons Group
- **Scenario**: Organizer becomes unresponsive
- **Handling**:
  - Any confirmed member can request to become organizer
  - If no action: group auto-cancels at deadline
  - No charges unless group completes

### 6.5.2 More Friends Want to Join Than Tickets Available
- **Scenario**: Group of 4, 6 people want in
- **Handling**:
  - First 4 to confirm get spots
  - Waitlist for additional interested
  - Organizer can increase group size if more tickets available

### 6.5.3 Auction Price Exceeds Some Members' Budgets
- **Scenario**: Group bidding, price goes higher than some can afford
- **Handling**:
  - Each member sets their personal max bid
  - Group's max = sum of individual maxes ÷ ticket count
  - If price exceeds someone's max: they can increase or drop out
  - If they drop out: others can cover or find replacement

### 6.5.4 Split Payments and Refunds
- **Scenario**: Group purchase needs refund due to cancelled event
- **Handling**:
  - Each member refunded their individual portion
  - Refunded to original payment method
  - Organizer has no special liability

## 6.6 Anti-Gaming Edge Cases

### 6.6.1 Shill Bidding
- **Scenario**: Seller uses alt accounts to bid up own listing
- **Handling**:
  - Detection algorithms (IP, payment method, bidding patterns)
  - Machine learning on bidding behavior
  - User reports
  - Penalties: listing removal, account suspension, ban

### 6.6.2 Bid Shielding
- **Scenario**: Buyers collude - one places high fake bid, shields low bid, withdraws
- **Handling**:
  - Bid withdrawal only allowed early in auction
  - No withdrawal in final 20% of auction duration
  - Pattern detection and penalties

### 6.6.3 Feedback Manipulation
- **Scenario**: Fake transactions to build seller rating
- **Handling**:
  - Verified purchase requirement for reviews
  - Unusual pattern detection
  - Manual review of flagged accounts

---

# 7. UI/UX Design Specifications

## 7.1 Design Philosophy

### Core Principles

1. **Mobile-First, Desktop-Excellent**
   - Design for phone screens first
   - Responsive enhancement for tablets and desktop
   - Touch-friendly targets, minimal typing required

2. **All-In Pricing**
   - Never surprise with fees at checkout
   - Total price (including service fee) displayed prominently
   - Breakdown available on demand, not forced

3. **Progressive Disclosure**
   - Show essential info upfront
   - Advanced options revealed on interaction
   - Don't overwhelm first-time users

4. **Real-Time Everything**
   - Live bid updates without refresh
   - Instant notification of outbids
   - Real-time group status

5. **Trust Signals Throughout**
   - Seller verification badges
   - Buyer protection messaging
   - Secure payment indicators

## 7.2 Color Palette & Branding

### Primary Colors
- **Primary**: Deep Purple (#6B46C1) - Trust, creativity, premium feel
- **Secondary**: Electric Cyan (#00D4FF) - Modern, energetic, digital
- **Accent**: Coral (#FF6B6B) - Urgency, CTAs, notifications

### Semantic Colors
- **Success**: Green (#10B981) - Winning bid, completed purchase
- **Warning**: Amber (#F59E0B) - Outbid, auction ending soon
- **Error**: Red (#EF4444) - Payment failed, invalid tickets
- **Info**: Blue (#3B82F6) - Informational states

### Neutrals
- **Background**: Near-white (#FAFAFA) light mode / Near-black (#0F0F0F) dark mode
- **Surface**: White (#FFFFFF) / (#1A1A1A)
- **Text Primary**: (#111827) / (#F9FAFB)
- **Text Secondary**: (#6B7280) / (#9CA3AF)

## 7.3 Typography

### Font Family
- **Primary**: Inter (clean, modern, excellent readability)
- **Accent**: Space Grotesk (for headings, prices, numbers)

### Scale
- **Hero**: 48px / 56px line-height
- **H1**: 32px / 40px
- **H2**: 24px / 32px
- **H3**: 20px / 28px
- **Body**: 16px / 24px
- **Small**: 14px / 20px
- **Caption**: 12px / 16px

## 7.4 Component Library

### Cards
- **Event Card**: Image, event name, date, venue, price range badge
- **Listing Card**: Section/row, current price, time remaining, listing type indicator
- **Bid Card**: Bid amount, bidder info (anonymized), timestamp

### Buttons
- **Primary**: Filled, purple background, white text (main CTAs)
- **Secondary**: Outlined, purple border and text (secondary actions)
- **Tertiary**: Text only, purple (minimal emphasis)
- **Danger**: Red filled (destructive actions)

### Form Elements
- Large touch targets (min 44px height)
- Clear labels above inputs
- Inline validation with helpful messages
- Numeric keypads for price inputs on mobile

### Navigation
- **Mobile**: Bottom tab bar (Home, Search, Sell, Activity, Profile)
- **Desktop**: Top navbar with same elements + expanded search

## 7.5 Key Screen Specifications

### 7.5.1 Home Screen (Mobile)

```
┌─────────────────────────────────────┐
│ [Logo]                    [🔔] [👤] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search events, artists...    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ TRENDING NOW                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │     │ │     │ │     │ │     │ ←→ │
│ │Event│ │Event│ │Event│ │Event│    │
│ │Card │ │Card │ │Card │ │Card │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────┤
│ AUCTIONS ENDING SOON           See→ │
│ ┌───────────────────────────────┐   │
│ │ [img] Taylor Swift            │   │
│ │       Sec 101 Row A           │   │
│ │       Current: $180  ⏱ 2:34   │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ [img] Lakers vs Celtics       │   │
│ │       Sec 305 Row 12          │   │
│ │       Current: $95   ⏱ 14:22  │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ RECOMMENDED FOR YOU            See→ │
│ ...                                 │
├─────────────────────────────────────┤
│ [🏠]    [🔍]    [+]    [🔔]    [👤]  │
│ Home   Search  Sell  Activity  You  │
└─────────────────────────────────────┘
```

### 7.5.2 Event Page

```
┌─────────────────────────────────────┐
│ [←]                          [♡] [↗]│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │      [Event Hero Image]        │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Taylor Swift | The Eras Tour        │
│ 📅 Sat, Mar 15, 2025 • 7:00 PM      │
│ 📍 SoFi Stadium, Los Angeles        │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │        [Venue Map]              │ │
│ │    (Interactive seat map)       │ │
│ │    Colored by availability      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Filter: [Section ▾][Price ▾][Type▾] │
├─────────────────────────────────────┤
│ 156 listings • From $89             │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ SEC 112 • Row F • Seats 5-6   │   │
│ │ ⚡ Auction+BuyNow              │   │
│ │                               │   │
│ │ Current Bid     Buy Now       │   │
│ │ $145           $225           │   │
│ │ 3 bids • ends in 4h           │   │
│ │                               │   │
│ │ [Bid Now]      [Buy Now]      │   │
│ │ ★★★★☆ (23) Verified Seller    │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ SEC 405 • Row 2 • 1-4 tickets │   │
│ │ 🏷️ Fixed Price                │   │
│ │                               │   │
│ │ $89 each                      │   │
│ │                               │   │
│ │ Qty: [-] 2 [+]    [Buy $178]  │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 7.5.3 Listing Detail / Bid Screen

```
┌─────────────────────────────────────┐
│ [←]  Listing Details         [♡][↗]│
├─────────────────────────────────────┤
│ Taylor Swift | The Eras Tour        │
│ Sat, Mar 15, 2025 • SoFi Stadium    │
├─────────────────────────────────────┤
│ Section 112 • Row F • Seats 5-6     │
│ ┌─────────────────────────────────┐ │
│ │  [Mini map with section         │ │
│ │   highlighted]                  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ⚡ AUCTION + BUY NOW                 │
│                                     │
│ Current Bid          Buy Now Price  │
│ $145                 $225           │
│ +$10 min increment   Instant        │
├─────────────────────────────────────┤
│ ⏱ Auction ends in 4h 23m 15s        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 68%        │
├─────────────────────────────────────┤
│ 📊 Price Analysis                   │
│ ┌─────────────────────────────────┐ │
│ │ Similar tickets: $120 - $280   │ │
│ │ This price:    ✓ Fair          │ │
│ │ 52 people watching             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ BID HISTORY (3 bids)                │
│ $145 • Buyer***23 • 2 hours ago     │
│ $135 • Buyer***89 • 3 hours ago     │
│ $125 • Buyer***23 • 5 hours ago     │
├─────────────────────────────────────┤
│ Seller: TicketKing ★★★★☆ (156)      │
│ ✓ Verified Seller  ✓ Fast Transfer  │
├─────────────────────────────────────┤
│                                     │
│ Your Bid: $[    155    ]            │
│ (Minimum: $155)                     │
│                                     │
│ ☐ Set max bid (proxy bidding)       │
│   Max: $[___________]               │
│                                     │
│ Total with fees: $170.50            │
│                                     │
│ [    Place Bid $155    ] ← Primary  │
│                                     │
│ [  Buy Now $225 + fees  ] ← Second  │
│                                     │
│ [👥 Buy as Group]                   │
│                                     │
├─────────────────────────────────────┤
│ 🛡️ 100% Buyer Guarantee             │
│ Full refund if tickets aren't valid │
└─────────────────────────────────────┘
```

### 7.5.4 Group Purchase Screen

```
┌─────────────────────────────────────┐
│ [←]  Group Purchase                 │
├─────────────────────────────────────┤
│ Taylor Swift | The Eras Tour        │
│ Section 112 • Row F • 4 tickets     │
│ Current bid: $145 each              │
├─────────────────────────────────────┤
│ YOUR GROUP (2/4 confirmed)          │
│ ┌───────────────────────────────┐   │
│ │ 👤 You (Organizer)   ✓ Paid   │   │
│ │    1 ticket • $159.50         │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 👤 Sarah M.          ✓ Paid   │   │
│ │    1 ticket • $159.50         │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 👤 Mike R.          ⏳ Pending │   │
│ │    1 ticket • Awaiting payment│   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ ➕ Invite 1 more friend        │   │
│ │    [Share Link]               │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ ⏱ Deadline: 23h 45m remaining       │
│ Group must be complete to proceed   │
├─────────────────────────────────────┤
│ GROUP BIDDING                       │
│                                     │
│ Current winning bid: $145/ticket    │
│ Your group's max: $175/ticket       │
│                                     │
│ [Increase Group Max Bid]            │
│                                     │
│ If you win: Each pays their share   │
│ If outbid: No charge, notified      │
├─────────────────────────────────────┤
│ [Send Reminder to Pending]          │
│ [Edit Deadline]                     │
│ [Leave Group]                       │
└─────────────────────────────────────┘
```

### 7.5.5 Seller: Create Listing Flow

```
STEP 1: Add Tickets
┌─────────────────────────────────────┐
│ [✕]  Sell Tickets            Step 1 │
├─────────────────────────────────────┤
│ How would you like to add tickets?  │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 🔗 Connect Ticketmaster       │   │
│ │    Import directly from TM    │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 🔗 Connect AXS                │   │
│ │    Import directly from AXS   │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ ✏️ Enter Manually             │   │
│ │    Type in ticket details     │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 📷 Scan/Upload               │   │
│ │    Take photo of tickets      │   │
│ └───────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

STEP 2: Confirm Details
┌─────────────────────────────────────┐
│ [←]  Sell Tickets            Step 2 │
├─────────────────────────────────────┤
│ Confirm Ticket Details              │
│                                     │
│ Event                               │
│ ┌───────────────────────────────┐   │
│ │ Taylor Swift - The Eras Tour  │   │
│ │ Sat, Mar 15 • SoFi Stadium    │   │
│ │                        [Edit] │   │
│ └───────────────────────────────┘   │
│                                     │
│ Section         Row                 │
│ ┌─────────┐     ┌─────────┐         │
│ │ 112     │     │ F       │         │
│ └─────────┘     └─────────┘         │
│                                     │
│ Seats                               │
│ ┌─────────────────────────────────┐ │
│ │ 5, 6, 7, 8                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Quantity: 4 tickets                 │
│                                     │
│ [Continue]                          │
└─────────────────────────────────────┘

STEP 3: Choose Listing Type
┌─────────────────────────────────────┐
│ [←]  Sell Tickets            Step 3 │
├─────────────────────────────────────┤
│ How do you want to sell?            │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ ⚡ Auction + Buy Now           │   │
│ │    Recommended                │   │
│ │    Let buyers bid or purchase │   │
│ │    instantly at your price    │   │
│ │                        [•]    │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 🔨 Standard Auction           │   │
│ │    Buyers compete, highest    │   │
│ │    bidder wins                │   │
│ │                        [ ]    │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 🏷️ Fixed Price                │   │
│ │    Set your price, first      │   │
│ │    buyer gets it              │   │
│ │                        [ ]    │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 📉 Declining Price            │   │
│ │    Price drops over time      │   │
│ │    until someone buys         │   │
│ │                        [ ]    │   │
│ └───────────────────────────────┘   │
│                                     │
│ [Continue]                          │
└─────────────────────────────────────┘

STEP 4: Configure Pricing (Hybrid example)
┌─────────────────────────────────────┐
│ [←]  Sell Tickets            Step 4 │
├─────────────────────────────────────┤
│ Set Your Prices                     │
│                                     │
│ Starting Bid (per ticket)           │
│ ┌─────────────────────────────────┐ │
│ │ $  125                          │ │
│ └─────────────────────────────────┘ │
│ 💡 Similar tickets start at $115-140│
│                                     │
│ Buy Now Price (per ticket)          │
│ ┌─────────────────────────────────┐ │
│ │ $  200                          │ │
│ └─────────────────────────────────┘ │
│ 💡 Suggested: $180-220              │
│                                     │
│ Reserve Price (optional)            │
│ ┌─────────────────────────────────┐ │
│ │ $  150                          │ │
│ └─────────────────────────────────┘ │
│ ℹ️ Hidden minimum you'll accept     │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Auction Duration                    │
│ ┌─────────────────────────────────┐ │
│ │ 3 days                      ▾  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Continue]                          │
└─────────────────────────────────────┘

STEP 5: Splitting & Final Options
┌─────────────────────────────────────┐
│ [←]  Sell Tickets            Step 5 │
├─────────────────────────────────────┤
│ Additional Options                  │
│                                     │
│ Can buyers purchase fewer than      │
│ all 4 tickets?                      │
│                                     │
│ ○ Yes, any quantity (1-4)           │
│ ○ Yes, but minimum 2 tickets        │
│ ● No, all 4 together only           │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Bid Increment Preference            │
│ ● Use recommended ($5 increments)   │
│ ○ Custom: $[____] minimum           │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ [Continue to Review]                │
└─────────────────────────────────────┘

STEP 6: Review & Publish
┌─────────────────────────────────────┐
│ [←]  Sell Tickets            Step 6 │
├─────────────────────────────────────┤
│ Review Your Listing                 │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Taylor Swift - The Eras Tour  │   │
│ │ Sat, Mar 15 • SoFi Stadium    │   │
│ │                               │   │
│ │ Section 112 • Row F           │   │
│ │ Seats 5, 6, 7, 8 (4 tickets)  │   │
│ │                               │   │
│ │ ⚡ Auction + Buy Now           │   │
│ │ Starting: $125  BuyNow: $200  │   │
│ │ Reserve: $150 (hidden)        │   │
│ │ Duration: 3 days              │   │
│ │ All-or-nothing (no splitting) │   │
│ └───────────────────────────────┘   │
│                                     │
│ ─────────────────────────────────── │
│ POTENTIAL EARNINGS                  │
│                                     │
│ If sold at Buy Now ($200 × 4):      │
│ Sale total:              $800.00    │
│ TickX fee (10%):         -$80.00    │
│ ─────────────────────────          │
│ Your earnings:           $720.00    │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ ☑️ I confirm these tickets are valid │
│   and I can transfer them           │
│                                     │
│ [Publish Listing]                   │
│                                     │
└─────────────────────────────────────┘
```

### 7.5.6 Seller Dashboard

```
┌─────────────────────────────────────┐
│ [←]  Seller Dashboard               │
├─────────────────────────────────────┤
│ Welcome back, Alex!                 │
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Active  │ │ Sold    │ │ Earned  │ │
│ │    3    │ │   12    │ │ $1,847  │ │
│ │listings │ │thisMonth│ │thisMonth│ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ ACTIVE LISTINGS                     │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Taylor Swift         ⚡ Hybrid │   │
│ │ Sec 112 • 4 tickets           │   │
│ │ Current: $145    BuyNow: $200 │   │
│ │ 5 bids • ends 4h 23m          │   │
│ │ [View] [Edit] [End Early]     │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Lakers vs Celtics   🔨 Auction │   │
│ │ Sec 305 • 2 tickets           │   │
│ │ Current: $95     Reserve: $80 │   │
│ │ 2 bids • ends 1d 6h           │   │
│ │ ✓ Reserve met                 │   │
│ │ [View] [Edit] [End Early]     │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Hamilton           🏷️ Fixed    │   │
│ │ Sec Orchestra • 2 tickets     │   │
│ │ Price: $350 each              │   │
│ │ 12 watching                   │   │
│ │ [View] [Edit] [Remove]        │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ PENDING ACTIONS                     │
│                                     │
│ ⚠️ Counter-offer pending response   │
│   Lakers tickets • $90 counter      │
│   Expires in 6h                     │
│   [View Details]                    │
│                                     │
├─────────────────────────────────────┤
│ [+ Create New Listing]              │
│                                     │
├─────────────────────────────────────┤
│ [🏠]    [🔍]    [+]    [🔔]    [👤]  │
└─────────────────────────────────────┘
```

## 7.6 Interaction Patterns

### 7.6.1 Real-Time Updates
- WebSocket connections for live bid updates
- Auction countdown timers update every second in final 5 minutes
- Push notifications for:
  - Outbid alerts
  - Auction won/lost
  - Counter-offers received
  - Group purchase updates
  - Price drop alerts (watchlist)

### 7.6.2 Micro-Interactions
- Bid button shows subtle pulse when you're winning
- Price changes animate (flash green if dropped, red if increased)
- Confetti animation on winning auction
- Haptic feedback on successful bid placement (mobile)

### 7.6.3 Loading States
- Skeleton screens while content loads
- Optimistic UI updates (bid shows immediately, confirmed in background)
- Pull-to-refresh on all list views

### 7.6.4 Error Handling
- Inline validation with helpful messages
- Toast notifications for async errors
- Retry mechanisms for network failures
- Clear error states with recovery actions

## 7.7 Accessibility Requirements

- WCAG 2.1 AA compliance minimum
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- All interactive elements keyboard accessible
- Screen reader support with proper ARIA labels
- Reduced motion option for animations
- Focus indicators clearly visible

---

# 8. Technical Architecture

## 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │   React     │  │   Future    │              │
│  │   Web App   │  │   Native    │  │   Native    │              │
│  │             │  │   (PWA)     │  │   Apps      │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│              ┌───────────────────────┐                           │
│              │    API Gateway        │                           │
│              │    (AWS API Gateway)  │                           │
│              └───────────┬───────────┘                           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          ▼              BACKEND LAYER            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 JAVA MICROSERVICES (Spring Boot)         │    │
│  ├─────────────┬─────────────┬─────────────┬───────────────┤    │
│  │   User      │   Event     │   Listing   │   Auction     │    │
│  │   Service   │   Service   │   Service   │   Service     │    │
│  ├─────────────┼─────────────┼─────────────┼───────────────┤    │
│  │   Payment   │   Search    │   Notifi-   │   Analytics   │    │
│  │   Service   │   Service   │   cation    │   Service     │    │
│  │             │             │   Service   │               │    │
│  └─────────────┴─────────────┴─────────────┴───────────────┘    │
│                                                                  │
│         │              │              │              │           │
│         ▼              ▼              ▼              ▼           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │PostgreSQL │  │  Redis    │  │ Elastic-  │  │  S3       │     │
│  │  (RDS)    │  │(ElastiC.) │  │  search   │  │           │     │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘     │
│                                                                  │
│                          │                                       │
│                          ▼                                       │
│              ┌───────────────────────┐                           │
│              │   Message Queue       │                           │
│              │   (SQS / EventBridge) │                           │
│              └───────────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          ▼           REAL-TIME LAYER             │
├─────────────────────────────────────────────────────────────────┤
│              ┌───────────────────────┐                           │
│              │   WebSocket Server    │                           │
│              │   (API Gateway WS)    │                           │
│              └───────────────────────┘                           │
│                          │                                       │
│                          ▼                                       │
│              ┌───────────────────────┐                           │
│              │   Push Notifications  │                           │
│              │   (SNS / Firebase)    │                           │
│              └───────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## 8.2 Service Breakdown

### User Service
- Authentication (OAuth, email/password)
- User profiles
- Verification levels
- Payment methods management

### Event Service
- Event catalog management
- Venue and seating data
- Event metadata (artists, teams, categories)
- Integration with external event APIs

### Listing Service
- Listing CRUD operations
- Listing configuration (type, pricing, rules)
- Ticket verification
- Inventory management

### Auction Service
- Bid processing and validation
- Proxy bidding logic
- Anti-sniping implementation
- Auction state management
- Counter-offer handling

### Payment Service
- Stripe/payment processor integration
- Escrow management
- Payout processing
- Fee calculation

### Search Service
- Elasticsearch-powered search
- Filtering and faceting
- Relevance tuning
- Typeahead suggestions

### Notification Service
- Email notifications
- Push notifications (mobile/web)
- SMS (critical alerts)
- In-app notification center

### Analytics Service
- Event tracking
- Pricing analytics
- User behavior analysis
- ML model data pipeline

## 8.3 Database Schema (Key Entities)

```
USERS
├── id (UUID)
├── email
├── password_hash
├── name
├── phone
├── verification_level
├── created_at
└── updated_at

EVENTS
├── id (UUID)
├── name
├── description
├── category (concert, sports, theater, etc.)
├── venue_id (FK)
├── event_date
├── doors_time
├── status (scheduled, postponed, cancelled)
├── image_url
├── created_at
└── updated_at

VENUES
├── id (UUID)
├── name
├── address
├── city
├── state
├── zip
├── capacity
├── seating_chart_data (JSON)
└── timezone

LISTINGS
├── id (UUID)
├── seller_id (FK)
├── event_id (FK)
├── listing_type (auction, fixed, hybrid, declining)
├── status (active, ended, sold, cancelled)
├── section
├── row
├── seats (array)
├── quantity
├── starting_price
├── buy_now_price (nullable)
├── reserve_price (nullable)
├── current_price
├── floor_price (for declining)
├── decline_schedule (for declining)
├── min_quantity (for splitting)
├── allow_splitting
├── bid_increment
├── auction_end_time
├── created_at
└── updated_at

BIDS
├── id (UUID)
├── listing_id (FK)
├── bidder_id (FK)
├── amount
├── max_amount (for proxy)
├── quantity
├── status (active, outbid, won, withdrawn)
├── created_at
└── updated_at

COUNTER_OFFERS
├── id (UUID)
├── listing_id (FK)
├── bid_id (FK)
├── seller_id (FK)
├── buyer_id (FK)
├── amount
├── expires_at
├── status (pending, accepted, declined, expired)
├── created_at
└── updated_at

TRANSACTIONS
├── id (UUID)
├── listing_id (FK)
├── buyer_id (FK)
├── seller_id (FK)
├── amount
├── buyer_fee
├── seller_fee
├── status (pending_payment, paid, transfer_pending, completed, refunded)
├── payment_intent_id
├── transfer_confirmed_at
├── created_at
└── updated_at

GROUPS (for group purchases)
├── id (UUID)
├── listing_id (FK)
├── organizer_id (FK)
├── target_quantity
├── deadline
├── status (forming, complete, bidding, won, failed)
├── invite_code
├── created_at
└── updated_at

GROUP_MEMBERS
├── id (UUID)
├── group_id (FK)
├── user_id (FK)
├── quantity
├── max_price_per_ticket
├── payment_status (pending, confirmed)
├── joined_at
└── confirmed_at

WATCHLIST
├── id (UUID)
├── user_id (FK)
├── event_id (FK)
├── price_alert_threshold (nullable)
├── created_at
└── updated_at
```

## 8.4 AWS Infrastructure

### Compute
- **ECS Fargate**: Container orchestration for Java services
- **Lambda**: Event-driven functions (notifications, scheduled tasks)

### Database
- **RDS PostgreSQL**: Primary database (Multi-AZ for production)
- **ElastiCache Redis**: Caching, session storage, real-time bid state

### Storage
- **S3**: Images, static assets, backups

### Networking
- **CloudFront**: CDN for React app and static assets
- **API Gateway**: REST and WebSocket APIs
- **VPC**: Isolated network for backend services

### Messaging
- **SQS**: Async job processing
- **EventBridge**: Event-driven architecture
- **SNS**: Push notifications

### Search
- **OpenSearch (Elasticsearch)**: Full-text search

### Monitoring
- **CloudWatch**: Logs, metrics, alarms
- **X-Ray**: Distributed tracing

## 8.5 Frontend Architecture (React)

```
src/
├── components/
│   ├── common/           # Buttons, inputs, cards, modals
│   ├── layout/           # Header, footer, navigation
│   ├── events/           # Event cards, event page components
│   ├── listings/         # Listing cards, listing detail
│   ├── bidding/          # Bid forms, bid history, auction timer
│   ├── groups/           # Group purchase components
│   ├── seller/           # Seller dashboard, listing creation
│   └── user/             # Profile, settings, watchlist
├── pages/
│   ├── Home.tsx
│   ├── Search.tsx
│   ├── EventDetail.tsx
│   ├── ListingDetail.tsx
│   ├── GroupPurchase.tsx
│   ├── CreateListing.tsx
│   ├── SellerDashboard.tsx
│   ├── Profile.tsx
│   └── ...
├── hooks/
│   ├── useWebSocket.ts   # Real-time bid updates
│   ├── useAuth.ts
│   ├── useBidding.ts
│   └── ...
├── context/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── NotificationContext.tsx
├── services/
│   ├── api.ts            # API client
│   ├── websocket.ts
│   └── analytics.ts
├── types/
│   └── ...               # TypeScript interfaces
├── utils/
│   └── ...               # Helpers, formatters
└── styles/
    └── ...               # Global styles, theme
```

### State Management
- **React Query**: Server state, caching, optimistic updates
- **Zustand**: Client state (simpler than Redux)
- **React Context**: Auth, theme, notifications

### Key Libraries
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **React Hook Form**: Form handling
- **date-fns**: Date formatting
- **Socket.io-client**: WebSocket connections

---

# 9. AI Features Roadmap

## 9.1 MVP AI Features

### Smart Pricing Suggestions
- **For Sellers**: Suggest starting price, reserve, and buy-now based on:
  - Historical sales data for similar tickets
  - Current market supply/demand
  - Time until event
  - Seat quality metrics
  - Day of week, venue, artist popularity

- **Implementation**:
  - Start with rule-based system using comparable sales
  - Evolve to ML model as data accumulates

### Basic Demand Signals
- "High Demand" indicator when many users viewing
- "Selling Fast" when multiple sales in short period
- "Price Drop" alerts based on watchlist

## 9.2 V2 AI Features

### Fair Price Indicator
- Show buyers if listing is above/below market rate
- Visual meter: "Great Deal" → "Fair" → "Above Market"
- Build buyer trust and confidence

### Personalized Recommendations
- Event recommendations based on:
  - Past purchases
  - Browsing history
  - Location
  - Followed artists/teams
  - Similar user patterns

### Price Prediction
- "Prices typically drop 15% day-of for this venue"
- "Similar events sold out—prices likely to rise"
- Help buyers make informed timing decisions

## 9.3 V3 AI Features

### Intelligent Chatbot
- Answer questions about listings, policies
- Help with purchase decisions
- Seller support for listing optimization

### Auto-Bidding Strategies
- "Bid for me up to $X"
- "Bid aggressively in last 10 minutes"
- "Match market price until Y date"

### Fraud Detection
- Identify suspicious listing patterns
- Detect shill bidding
- Flag potentially invalid tickets

### Dynamic Reserve Recommendations
- Suggest optimal reserve based on real-time market
- Alert sellers when reserve is too high/low

---

# 10. MVP Scope & Phased Roadmap

## 10.1 MVP (Phase 1) - Core Marketplace

### Included
- ✅ User registration/authentication
- ✅ Event browsing and search
- ✅ All 4 listing types (auction, fixed, hybrid, declining)
- ✅ Basic bidding functionality
- ✅ Buy Now purchasing
- ✅ Seller listing creation flow
- ✅ Basic seller dashboard
- ✅ Real-time bid updates
- ✅ Simple pricing suggestions (rule-based)
- ✅ Payment processing (Stripe)
- ✅ Basic notifications (email)
- ✅ Mobile-responsive web app

### Excluded from MVP
- ❌ Native mobile apps
- ❌ Group purchase feature
- ❌ Counter-offers
- ❌ Advanced AI features
- ❌ Ticket platform integrations
- ❌ Power seller tools (bulk upload, analytics)

## 10.2 Phase 2 - Enhanced Experience

### Features
- Counter-offer functionality
- Group purchase feature
- Push notifications (web and mobile PWA)
- Enhanced search with filters
- Watchlist with price alerts
- Seller ratings and reviews
- Fair price indicator
- Ticket verification improvements

## 10.3 Phase 3 - Growth & AI

### Features
- Native mobile apps (iOS, Android)
- Ticketmaster/AXS integration for ticket import
- Advanced AI pricing suggestions
- Personalized recommendations
- Auto-bidding
- Power seller tools
- Referral program
- Loyalty/rewards program

## 10.4 Phase 4 - Scale & Expand

### Features
- International expansion
- Multi-currency support
- Primary ticket partnerships
- White-label solutions
- API for partners
- Advanced analytics and reporting

---

# 11. Open Questions for Discussion

## Business Model
1. **Launch Fee Strategy**: Should we subsidize fees initially (5%/5%) to build liquidity, or start at full rate (10%/10%)?

2. **Seller Verification**: How rigorous should seller verification be at launch? Tradeoff between trust and friction.

3. **Guarantee Fund**: How much should we budget for the buyer guarantee? What's the expected fraud rate?

## Product
4. **Group Purchase Priority**: Is this a must-have for launch, or can it wait for Phase 2? It's complex but differentiating.

5. **Ticket Verification**: Without platform integrations, how do we verify tickets at MVP? Trust + guarantee?

6. **Event Data Source**: Where do we source event/venue data? SeatGeek API? Ticketmaster? Build our own?

## Technical
7. **Real-time Infrastructure**: WebSocket via API Gateway vs. dedicated service (Socket.io on EC2)?

8. **Search**: Start with PostgreSQL full-text search or implement Elasticsearch from day one?

9. **Mobile**: PWA initially or invest in React Native from the start?

## Go-to-Market
10. **Initial Categories**: Focus on one category (concerts) or all categories from launch?

11. **Geographic Focus**: Start in one city to build density, or national from day one?

12. **Supply Strategy**: How do we acquire initial sellers? Partnerships with brokers? Incentive programs?

---

# Appendix A: Competitive Feature Matrix

| Feature | TickX (MVP) | TickX (Full) | StubHub | SeatGeek | Vivid Seats |
|---------|-------------|--------------|---------|----------|-------------|
| Auction Listings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fixed Price | ✅ | ✅ | ✅ | ✅ | ✅ |
| Declining Price | ✅ | ✅ | ❌ | ❌ | ❌ |
| Counter-offers | ❌ | ✅ | ❌ | ❌ | ❌ |
| Group Purchase | ❌ | ✅ | ❌ | ❌ | ❌ |
| All-in Pricing | ✅ | ✅ | ❌ | ✅ | ❌ |
| AI Pricing | Basic | Advanced | ❌ | Basic | ❌ |
| Real-time Bids | ✅ | ✅ | N/A | N/A | N/A |
| Buyer Guarantee | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mobile App | PWA | Native | ✅ | ✅ | ✅ |

---

# Appendix B: Glossary

- **Auction**: Listing type where buyers bid competitively
- **Buy Now**: Fixed price instant purchase option
- **Dutch Auction/Declining Price**: Price decreases over time until sold
- **English Auction**: Price increases as buyers bid (our "Standard Auction")
- **Hybrid**: Combination of auction and buy now
- **Proxy Bidding**: System bids automatically up to user's max
- **Reserve Price**: Hidden minimum seller will accept
- **Shill Bidding**: Fraudulent self-bidding to inflate price
- **Sniping**: Placing bid at last second to win
- **Soft Close**: Extending auction when late bids arrive

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: TickX Product Team*
