import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  MarketplaceListing, 
  MarketplaceOffer, 
  MarketplaceOrder, 
  MaterialDispute,
  QualityGrade,
  ListingStatus 
} from '../../types';
import { 
  ShoppingBag, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  ArrowUpRight, 
  Tag, 
  Scale, 
  Layers, 
  Eye, 
  Gavel, 
  FileText, 
  Sparkles,
  PackageCheck,
  Building,
  MapPin,
  Heart,
  ChevronRight,
  Send,
  X
} from 'lucide-react';

export const MarketplaceModule: React.FC = () => {
  const { 
    marketplaceListings, 
    marketplaceOffers, 
    marketplaceOrders, 
    marketplaceDisputes, 
    marketplaceReviews,
    createListing,
    updateListingStatus,
    submitOffer,
    placeBid,
    acceptOffer,
    confirmOrderPickup,
    raiseDispute,
    submitReview,
    currentUser,
    activeOrg
  } = useAuth();

  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'browse' | 'sell' | 'auctions' | 'orders' | 'verification' | 'reviews'
  >('overview');

  // Search & Filters state for Browse tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSaleType, setSelectedSaleType] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<MarketplaceListing[]>([]);

  // Modals state
  const [offerModalListing, setOfferModalListing] = useState<MarketplaceListing | null>(null);
  const [offerPriceInput, setOfferPriceInput] = useState<string>('');
  const [offerMessageInput, setOfferMessageInput] = useState<string>('');

  const [bidModalListing, setBidModalListing] = useState<MarketplaceListing | null>(null);
  const [bidAmountInput, setBidAmountInput] = useState<string>('');

  const [disputeModalOrderId, setDisputeModalOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<MaterialDispute['reason']>('quantity_mismatch');
  const [disputeDesc, setDisputeDesc] = useState('');

  // Create Listing Form state (Wizard)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Plastics');
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState<number>(1000);
  const [newUnit, setNewUnit] = useState<'kg' | 'Tons' | 'Units' | 'Bales'>('kg');
  const [newGrade, setNewGrade] = useState<QualityGrade>('Grade A');
  const [newPrice, setNewPrice] = useState<number>(1.50);
  const [newSaleType, setNewSaleType] = useState<'direct_sale' | 'auction'>('direct_sale');
  const [newLocation, setNewLocation] = useState(activeOrg.name);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Toggle compare
  const toggleCompare = (listing: MarketplaceListing) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === listing.id);
      if (exists) return prev.filter(item => item.id !== listing.id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, listing];
    });
  };

  // Analytics Metrics
  const activeListingsCount = marketplaceListings.filter(l => l.status === 'active').length;
  const soldMaterialsCount = marketplaceListings.filter(l => l.status === 'sold').length;
  const totalRevenueGenerated = marketplaceOrders.reduce((sum, o) => sum + o.total_price, 0);
  const categoryCounts = marketplaceListings.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filtered listings
  const filteredListings = marketplaceListings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.seller_org_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || l.category === selectedCategory;
    const matchesGrade = selectedGrade === 'all' || l.quality_grade === selectedGrade;
    const matchesSale = selectedSaleType === 'all' || l.sale_type === selectedSaleType;
    return matchesSearch && matchesCat && matchesGrade && matchesSale;
  });

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-slate-100'
    }`}>
      {/* Top Header Banner - Eco Green Theme */}
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-2xl shadow-xl relative overflow-hidden transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-emerald-700/10' 
          : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40'
      }`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-200 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-emerald-300" /> Circular Economy Exchange Hub
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Reusable & Recyclable Material Marketplace
          </h1>
          <p className="text-emerald-100 text-xs mt-1 max-w-2xl">
            Trade verified post-consumer polymers, baled cardboard, organic compost, and reclaimed metals. Backed by chain-of-custody verification & escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full lg:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg active:scale-95 w-full lg:w-auto"
          >
            <PlusCircle className="w-5 h-5 text-emerald-700" />
            List Material for Sale
          </button>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'browse', label: 'Browse & Buy', icon: Search, badge: activeListingsCount },
          { id: 'sell', label: 'My Listings & Drafts', icon: Tag },
          { id: 'auctions', label: 'Live Auctions', icon: Gavel, badge: marketplaceListings.filter(l => l.sale_type === 'auction' && l.status === 'active').length },
          { id: 'orders', label: 'Orders & Escrow', icon: PackageCheck, badge: marketplaceOrders.length },
          { id: 'verification', label: 'Authenticity & Audit', icon: ShieldCheck },
          { id: 'reviews', label: 'Trust & Disputes', icon: Star, badge: marketplaceDisputes.filter(d => d.status === 'under_review').length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap ${
                isActive 
                  ? isLight
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold' 
                  : isLight
                    ? 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive 
                    ? isLight ? 'bg-white text-emerald-800' : 'bg-emerald-500 text-slate-950'
                    : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200/80 shadow-sm hover:border-emerald-400' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Active Listings</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeListingsCount}</div>
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18% from last week
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200/80 shadow-sm hover:border-emerald-400' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Materials Recovered & Sold</span>
                <div className="p-2 bg-teal-500/10 text-teal-600 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{soldMaterialsCount} Batches</div>
              <div className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>6.8 Tons diverted from landfills</div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200/80 shadow-sm hover:border-emerald-400' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Trading Volume</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold mt-2 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                ${totalRevenueGenerated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-2">100% Escrow secured</div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200/80 shadow-sm hover:border-emerald-400' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Avg Authenticity Rating</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>96.4%</div>
              <div className="text-xs text-amber-600 font-medium mt-2">Grade A/B lab verified</div>
            </div>
          </div>

          {/* Category Demand Breakdown & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Demand Breakdown */}
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Layers className="w-5 h-5 text-emerald-600" /> Material Category Share
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const percent = Math.round((count / (marketplaceListings.length || 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{cat}</span>
                        <span className="text-emerald-600 font-bold">{count} listings ({percent}%)</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Marketplace Activity Table */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Clock className="w-5 h-5 text-emerald-600" /> Recent Marketplace Transactions
                </h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1">
                  View All Orders <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b pb-2 ${isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-700/60'}`}>
                      <th className="pb-3 font-semibold">Order Code</th>
                      <th className="pb-3 font-semibold">Material</th>
                      <th className="pb-3 font-semibold">Seller</th>
                      <th className="pb-3 font-semibold">Buyer</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                    {marketplaceOrders.map(ord => (
                      <tr key={ord.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                        <td className="py-3 font-mono font-bold text-emerald-600">{ord.order_code}</td>
                        <td className={`py-3 font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{ord.listing_title}</td>
                        <td className={`py-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{ord.seller_name}</td>
                        <td className={`py-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{ord.buyer_name}</td>
                        <td className={`py-3 font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>${ord.total_price.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.delivery_status === 'verified_completed' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {ord.delivery_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROWSE & BUY */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className={`p-4 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search materials (e.g. HDPE, Cardboard, Compost)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight 
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                      : 'bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                  }`}
                >
                  <option value="all">All Categories</option>
                  <option value="Plastics">Plastics</option>
                  <option value="Paper & Cardboard">Paper & Cardboard</option>
                  <option value="Organic Compost">Organic Compost</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Metals & Aluminum">Metals & Aluminum</option>
                </select>

                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className={`rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                  }`}
                >
                  <option value="all">All Quality Grades</option>
                  <option value="Grade A">Grade A (High Purity)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Mixed)</option>
                </select>

                <select
                  value={selectedSaleType}
                  onChange={(e) => setSelectedSaleType(e.target.value)}
                  className={`rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                  }`}
                >
                  <option value="all">All Purchase Types</option>
                  <option value="direct_sale">Direct Buy</option>
                  <option value="auction">Live Auction</option>
                </select>
              </div>
            </div>

            {/* Active Comparison Bar if items selected */}
            {compareList.length > 0 && (
              <div className={`p-3 rounded-xl flex items-center justify-between border ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}>
                <div className="flex items-center gap-3 text-xs">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Comparing <strong>{compareList.length}</strong> materials: {compareList.map(c => c.title).join(' vs ')}</span>
                </div>
                <button 
                  onClick={() => setCompareList([])}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Clear Comparison
                </button>
              </div>
            )}
          </div>

          {/* Material Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => {
              const isFav = favorites.includes(listing.id);
              const isComparing = compareList.some(item => item.id === listing.id);

              return (
                <div 
                  key={listing.id}
                  className={`rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group shadow-sm hover:shadow-md ${
                    isLight ? 'bg-white border-slate-200/90 hover:border-emerald-500/50' : 'bg-slate-800/60 border-slate-700/60 hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-white/90 backdrop-blur-md text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm border border-emerald-100">
                          {listing.quality_grade}
                        </span>
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                          {listing.category}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => toggleFavorite(listing.id)}
                          className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                            isFav ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:text-rose-500'
                          }`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-white bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg">
                        <span className="flex items-center gap-1 text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {listing.location_zone}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {listing.authenticity_score}% Verified
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h4 className={`font-extrabold text-base leading-snug hover:text-emerald-600 transition-colors ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {listing.title}
                      </h4>
                      <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {listing.description}
                      </p>

                      <div className={`flex items-center justify-between text-xs pt-3 border-t ${
                        isLight ? 'border-slate-100 text-slate-600' : 'border-slate-700/60 text-slate-300'
                      }`}>
                        <div>
                          <div className={isLight ? 'text-slate-400' : 'text-slate-400'}>Available Qty</div>
                          <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{listing.quantity.toLocaleString()} {listing.unit}</div>
                        </div>

                        <div className="text-right">
                          <div className={isLight ? 'text-slate-400' : 'text-slate-400'}>{listing.sale_type === 'auction' ? 'Current High Bid' : 'Price / Unit'}</div>
                          <div className={`font-extrabold text-lg ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                            ${(listing.highest_bid || listing.price_per_unit).toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ {listing.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Seller Tag */}
                      <div className={`flex items-center gap-2 pt-2 text-xs border-t ${
                        isLight ? 'border-slate-100 text-slate-500' : 'border-slate-700/40 text-slate-400'
                      }`}>
                        <Building className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{listing.seller_org_name}</span>
                        <span className="ml-auto text-amber-600 flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {listing.seller_rating || listing.seller_trust_rating || 4.9}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className={`p-4 border-t flex items-center justify-between gap-2 ${
                    isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/60 border-slate-700/60'
                  }`}>
                    <button
                      onClick={() => toggleCompare(listing)}
                      className={`text-xs px-3 py-2 rounded-xl transition-all border font-medium ${
                        isComparing 
                          ? isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : isLight ? 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300' : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                      }`}
                    >
                      {isComparing ? 'Comparing' : 'Compare'}
                    </button>

                    {listing.sale_type === 'direct_sale' ? (
                      <button
                        onClick={() => {
                          setOfferModalListing(listing);
                          setOfferPriceInput(listing.price_per_unit.toString());
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Buy Offer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBidModalListing(listing);
                          setBidAmountInput(((listing.highest_bid || listing.price_per_unit) + 5).toString());
                        }}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
                      >
                        <Gavel className="w-3.5 h-3.5" /> Place Auction Bid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SELL & MANAGE LISTINGS */}
      {activeTab === 'sell' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border flex justify-between items-center ${
            isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Your Listed Material Batches</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Manage active listings, draft quotes, paused batches, and review buyer inquiries.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="w-4 h-4" /> Create New Listing
            </button>
          </div>

          {/* User's Listings Table */}
          <div className={`rounded-2xl overflow-hidden border ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'}`}>
            <table className="w-full text-left text-xs">
              <thead className={isLight ? 'bg-slate-50 text-slate-600 border-b border-slate-200' : 'bg-slate-900/80 text-slate-400 border-b border-slate-700'}>
                <tr>
                  <th className="p-4 font-semibold">Batch Code</th>
                  <th className="p-4 font-semibold">Material Title</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Unit Price</th>
                  <th className="p-4 font-semibold">Verification</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                {marketplaceListings.map(listing => (
                  <tr key={listing.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                    <td className="p-4 font-mono font-bold text-emerald-600">{listing.batch_code}</td>
                    <td className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{listing.title}</td>
                    <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{listing.category}</td>
                    <td className={`p-4 font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{listing.quantity} {listing.unit}</td>
                    <td className="p-4 font-extrabold text-emerald-600">${listing.price_per_unit.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> {listing.authenticity_score}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        listing.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : listing.status === 'sold'
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {listing.status === 'active' && (
                        <button
                          onClick={() => updateListingStatus(listing.id, 'paused')}
                          className="text-amber-600 font-semibold hover:underline text-xs"
                        >
                          Pause
                        </button>
                      )}
                      {listing.status === 'paused' && (
                        <button
                          onClick={() => updateListingStatus(listing.id, 'active')}
                          className="text-emerald-600 font-semibold hover:underline text-xs"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => updateListingStatus(listing.id, 'archived')}
                        className="text-slate-400 hover:text-rose-600 text-xs"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE AUCTIONS */}
      {activeTab === 'auctions' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md' : 'bg-gradient-to-r from-teal-950 to-slate-900 border-teal-800/40 text-slate-100'
          }`}>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-300" /> Active Bidding Rooms
              </h3>
              <p className="text-emerald-100 text-xs mt-1">Real-time competitive bidding for high-volume commercial material lots.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketplaceListings.filter(l => l.sale_type === 'auction').map(auction => (
              <div key={auction.id} className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
                isLight ? 'bg-white border-slate-200/90' : 'bg-slate-800/60 border-slate-700/60'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200">
                      Live Auction
                    </span>
                    <h4 className={`text-base font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{auction.title}</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{auction.seller_org_name}</p>
                  </div>
                  <div className={`text-right px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
                  }`}>
                    <div className="text-[10px] text-slate-400">Ends In</div>
                    <div className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 2h 45m 12s
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex justify-between items-center ${
                  isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div>
                    <div className="text-xs text-slate-400">Total Bids</div>
                    <div className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{auction.bids_count || 0} bids</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Highest Bid</div>
                    <div className={`text-2xl font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      ${(auction.highest_bid || auction.price_per_unit).toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBidModalListing(auction);
                    setBidAmountInput(((auction.highest_bid || auction.price_per_unit) + 5).toString());
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20"
                >
                  <Gavel className="w-4 h-4" /> Place Next Bid (+ $5.00)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS & ESCROW */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'}`}>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <PackageCheck className="w-5 h-5 text-emerald-600" /> Escrow & Logistics Status
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Funds remain locked in smart escrow contract until buyer verifies QR weight evidence.</p>
          </div>

          <div className="space-y-4">
            {marketplaceOrders.map(order => (
              <div key={order.id} className={`p-6 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
              }`}>
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${
                  isLight ? 'border-slate-100' : 'border-slate-700/60'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        {order.order_code}
                      </span>
                      <h4 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{order.listing_title}</h4>
                    </div>
                    <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Seller: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{order.seller_name}</strong> | Buyer: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{order.buyer_name}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Escrow Value</div>
                    <div className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>${order.total_price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="text-slate-400 mb-1">Escrow Lock Status</div>
                    <div className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {order.escrow_status === 'funds_held' ? 'FUNDS SECURED IN ESCROW' : 'RELEASED TO SELLER'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="text-slate-400 mb-1">Chain-of-Custody Code</div>
                    <div className={`font-mono flex items-center gap-1.5 ${isLight ? 'text-slate-800 font-bold' : 'text-slate-200'}`}>
                      <QrCode className="w-4 h-4 text-emerald-600" /> {order.batch_code}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="text-slate-400 mb-1">Delivery Progress</div>
                    <div className="font-bold text-amber-600 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" /> {order.delivery_status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setDisputeModalOrderId(order.id);
                    }}
                    className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 font-semibold"
                  >
                    Raise Quality/Weight Dispute
                  </button>

                  {order.delivery_status !== 'verified_completed' && (
                    <button
                      onClick={() => confirmOrderPickup(order.id)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                    >
                      Verify Weight & Release Escrow Funds
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUTHENTICITY & VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Material Authenticity Protocol
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
              Every marketplace batch is checked against lab purity sensors, moisture meters, and verified weighbridge scale readings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {marketplaceListings.map(listing => (
                <div key={listing.id} className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-emerald-700">{listing.batch_code}</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      Score: {listing.authenticity_score}%
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{listing.title}</h4>
                  <div className={`text-xs space-y-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <div>• Contamination Rate: &lt; 1.2%</div>
                    <div>• Quality Grade: <strong>{listing.quality_grade}</strong></div>
                    <div>• Origin Facility: <strong>{listing.location_zone}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TRUST & DISPUTES */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Active Disputes Section */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <h3 className="text-base font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" /> Open Material Disputes & Audits
            </h3>

            {marketplaceDisputes.length === 0 ? (
              <div className="text-slate-400 text-xs py-4 text-center">No active disputes reported.</div>
            ) : (
              <div className="space-y-3">
                {marketplaceDisputes.map(disp => (
                  <div key={disp.id} className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-rose-800">Dispute #{disp.id}</span>
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        {disp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800"><strong>Raised By:</strong> {disp.raised_by_name}</p>
                    <p className="text-xs text-slate-600">{disp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Reviews Section */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Buyer & Seller Trust Reviews
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketplaceReviews.map(rev => (
                <div key={rev.id} className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{rev.target_user_name}</span>
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {rev.rating}.0
                    </div>
                  </div>
                  <p className={`text-xs italic ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>"{rev.comment}"</p>
                  <div className="text-[10px] text-slate-400">— Reviewed by {rev.reviewer_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE LISTING MODAL WIZARD */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className={`flex justify-between items-center border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <PlusCircle className="w-5 h-5 text-emerald-600" /> List Recyclable Material
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sorted PET Plastic Flakes (Post-Consumer)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                    }`}
                  >
                    <option value="Plastics">Plastics</option>
                    <option value="Paper & Cardboard">Paper & Cardboard</option>
                    <option value="Organic Compost">Organic Compost</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Metals & Aluminum">Metals & Aluminum</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Quality Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                    }`}
                  >
                    <option value="Grade A">Grade A (Highest Purity)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Mixed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Quantity</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as any)}
                    className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                    }`}
                  >
                    <option value="kg">kg</option>
                    <option value="Tons">Tons</option>
                    <option value="Units">Units</option>
                    <option value="Bales">Bales</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Expected Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe material purity, processing history, MFI specs, and pickup instructions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createListing({
                    title: newTitle,
                    category: newCategory,
                    description: newDesc,
                    quantity: newQty,
                    unit: newUnit,
                    quality_grade: newGrade,
                    price_per_unit: newPrice,
                    sale_type: newSaleType,
                    location_zone: newLocation
                  });
                  setShowCreateModal(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/20"
              >
                Publish Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFER SUBMIT MODAL */}
      {offerModalListing && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="text-base font-bold">Submit Offer to Seller</h3>
            <p className="text-xs text-slate-500">Listing: <strong>{offerModalListing.title}</strong></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Offered Price per {offerModalListing.unit} ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Note to Seller</label>
                <textarea
                  rows={2}
                  value={offerMessageInput}
                  onChange={(e) => setOfferMessageInput(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOfferModalListing(null)} className="px-4 py-2 text-xs text-slate-500">Cancel</button>
              <button
                onClick={() => {
                  submitOffer(offerModalListing.id, Number(offerPriceInput), offerMessageInput);
                  setOfferModalListing(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/20"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BID SUBMIT MODAL */}
      {bidModalListing && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="text-base font-bold">Place Live Auction Bid</h3>
            <p className="text-xs text-slate-500">Auction: <strong>{bidModalListing.title}</strong></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Your Bid Amount ($)</label>
                <input
                  type="number"
                  step="1"
                  value={bidAmountInput}
                  onChange={(e) => setBidAmountInput(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setBidModalListing(null)} className="px-4 py-2 text-xs text-slate-500">Cancel</button>
              <button
                onClick={() => {
                  placeBid(bidModalListing.id, Number(bidAmountInput));
                  setBidModalListing(null);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-teal-600/20"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModalOrderId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="text-base font-bold text-rose-600">Raise Order Dispute</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value as any)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                >
                  <option value="quantity_mismatch">Weight / Quantity Discrepancy</option>
                  <option value="grade_quality_issue">Quality Grade Deviation</option>
                  <option value="failed_pickup">Logistics Pickup Issue</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Details & Evidence Note</label>
                <textarea
                  rows={3}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDisputeModalOrderId(null)} className="px-4 py-2 text-xs text-slate-500">Cancel</button>
              <button
                onClick={() => {
                  raiseDispute(disputeModalOrderId, disputeReason, disputeDesc);
                  setDisputeModalOrderId(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-rose-600/20"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
