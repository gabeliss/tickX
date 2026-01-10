package com.tickx.service;

import com.tickx.model.Listing;
import com.tickx.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.tickx.constants.DynamoDbConstants.STATUS_ACTIVE;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;

    public Listing createListing(Listing listing) {
        String now = Instant.now().toString();
        listing.setListingId(UUID.randomUUID().toString());
        listing.setCreatedAt(now);
        listing.setUpdatedAt(now);
        listing.setStatus(STATUS_ACTIVE);
        listing.setBidCount(0);
        listing.setWatcherCount(0);
        listing.setViewCount(0);
        
        return listingRepository.save(listing);
    }

    public Optional<Listing> getListingById(String listingId) {
        return listingRepository.findById(listingId);
    }

    public Listing updateListing(String listingId, Listing updatedListing) {
        Optional<Listing> existing = listingRepository.findById(listingId);
        if (existing.isEmpty()) {
            throw new RuntimeException("Listing not found: " + listingId);
        }
        
        updatedListing.setListingId(listingId);
        updatedListing.setUpdatedAt(Instant.now().toString());
        updatedListing.setCreatedAt(existing.get().getCreatedAt()); // Preserve original creation time
        
        return listingRepository.save(updatedListing);
    }

    public void deleteListing(String listingId) {
        listingRepository.deleteById(listingId);
    }

    public List<Listing> getListingsBySeller(String sellerId) {
        return listingRepository.findBySellerId(sellerId);
    }

    public List<Listing> getListingsByEvent(String eventId) {
        return listingRepository.findByEventId(eventId);
    }

    public List<Listing> getListingsByStatus(String status) {
        return listingRepository.findByStatus(status);
    }

    public List<Listing> getActiveListings() {
        return listingRepository.findByStatus(STATUS_ACTIVE);
    }
}