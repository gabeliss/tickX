import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  Home,
  Events,
  EventDetail,
  ListingDetail,
  SellerDashboard,
  CreateListing,
  GroupPurchase,
  Search,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/listings/:listingId" element={<ListingDetail />} />

          {/* Seller Routes */}
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/sell" element={<CreateListing />} />
          <Route path="/sell/edit/:listingId" element={<CreateListing />} />

          {/* Group Purchase */}
          <Route path="/groups/:groupId" element={<GroupPurchase />} />
          <Route path="/groups/create" element={<GroupPurchase />} />

          {/* Search & Browse */}
          <Route path="/search" element={<Search />} />
          <Route path="/events" element={<Events />} />

          {/* User Routes (placeholder - uses Home for now) */}
          <Route path="/profile" element={<Home />} />
          <Route path="/notifications" element={<Home />} />
          <Route path="/watchlist" element={<Home />} />
          <Route path="/purchases" element={<Home />} />

          {/* Catch-all */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
