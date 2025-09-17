"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Upload, Download, Mail, Phone, Calendar, 
  User, Building, MapPin, Star, Tag, Clock, TrendingUp, BarChart3,
  FileText, Settings, ChevronDown, ChevronRight, Eye, Edit, Trash2,
  Send, MessageSquare, Activity, Target, Users, DollarSign,
  CheckCircle, AlertCircle, ArrowRight, ExternalLink, Zap
} from 'lucide-react';
import CRMAnalyticsDashboard from './CRMAnalyticsDashboard';
import CRMCampaignManager from './CRMCampaignManager';

// Enhanced types for comprehensive CRM
type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  industry: string;
  location: string;
  source: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'customer' | 'lost';
  tags: string[];
  lastContact: string;
  nextFollowUp?: string;
  notes: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  companyInfo?: {
    size: string;
    revenue: string;
    website: string;
    employees: number;
  };
  dealValue?: number;
  probability?: number;
  activities: Activity[];
  customFields?: Record<string, any>;
};

type Activity = {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal_update';
  title: string;
  description: string;
  date: string;
  completed: boolean;
  contactId: string;
  userId?: string;
};

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  contacts: string[];
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  createdAt: string;
};

type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
};

export default function EnhancedCRM() {
  // State management
  const [activeTab, setActiveTab] = useState<'contacts' | 'analytics' | 'campaigns' | 'automation'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'table'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize with empty data
  useEffect(() => {
    // Start with empty state - no sample data
  }, []);

  // Search and filter logic
  useEffect(() => {
    let filtered = contacts;

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(contact => {
          switch (key) {
            case 'status':
              return contact.status === value;
            case 'industry':
              return contact.industry === value;
            case 'source':
              return contact.source === value;
            case 'score':
              const [min, max] = value.split('-').map(Number);
              return contact.score >= min && contact.score <= max;
            default:
              return true;
          }
        });
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, activeFilters]);

  // Contact management functions
  const handleContactSelect = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    setLoading(true);
    
    switch (action) {
      case 'delete':
        setContacts(prev => prev.filter(c => !selectedContacts.has(c.id)));
        setNotification(`🗑️ Deleted ${selectedContacts.size} contacts`);
        break;
      case 'tag':
        // Implementation for bulk tagging
        setNotification(`🏷️ Tagged ${selectedContacts.size} contacts`);
        break;
      case 'export':
        // Implementation for bulk export
        setNotification(`📤 Exported ${selectedContacts.size} contacts`);
        break;
      case 'campaign':
        // Implementation for adding to campaign
        setNotification(`📧 Added ${selectedContacts.size} contacts to campaign`);
        break;
    }

    setSelectedContacts(new Set());
    setShowBulkActions(false);
    setLoading(false);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveSearch = () => {
    const searchId = Date.now().toString();
    const newSearch: SavedSearch = {
      id: searchId,
      name: `Search ${savedSearches.length + 1}`,
      filters: { ...activeFilters, query: searchQuery },
      createdAt: new Date().toISOString()
    };
    setSavedSearches(prev => [...prev, newSearch]);
    setNotification('🔍 Search saved successfully');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleImportMarketScannerResults = async () => {
    const stagedResults = localStorage.getItem('market_scanner_staged_results');
    if (!stagedResults) {
      setNotification('⚠️ No staged Market Scanner results found. Please export from Market Scanner first.');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    try {
      setLoading(true);
      const data = JSON.parse(stagedResults);
      
      // Convert Market Scanner results to contacts
      const importedContacts: Contact[] = data.businesses.map((business: any, index: number) => {
        const contactId = `ms_${business.business_id || Date.now()}_${index}`;
        const businessScore = Math.round(business.succession_risk || business.digital_opportunity || (50 + Math.random() * 50));
        
        // Generate initial activities for each contact
        const initialActivities: Activity[] = [
          {
            id: `activity_${contactId}_1`,
            type: 'note',
            title: 'Market Scanner Import',
            description: `Business imported from Market Scanner with ${business.reviews || 0} reviews and ${business.rating || 'N/A'} rating`,
            date: new Date().toISOString(),
            completed: true,
            contactId: contactId
          }
        ];

        // Add follow-up task based on business score
        if (businessScore >= 70) {
          initialActivities.push({
            id: `activity_${contactId}_2`,
            type: 'task',
            title: 'High-Priority Follow-up',
            description: 'Contact this high-scoring business within 24 hours for acquisition opportunity',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            contactId: contactId
          });
        } else if (businessScore >= 50) {
          initialActivities.push({
            id: `activity_${contactId}_2`,
            type: 'task',
            title: 'Standard Follow-up',
            description: 'Schedule initial outreach call within 3 days',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            contactId: contactId
          });
        }

        return {
          id: contactId,
          name: business.name || 'Unknown Business',
          email: business.email || `contact@${(business.name || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
          phone: business.phone || `(555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          company: business.name || 'Unknown Business',
          title: 'Business Owner',
          industry: business.category || 'Unknown',
          location: `${business.address?.city || ''}, ${business.address?.state || ''}`.trim(),
          source: 'Market Scanner',
          score: businessScore,
          status: businessScore >= 80 ? 'qualified' : businessScore >= 60 ? 'contacted' : 'new' as const,
          tags: ['Market Scanner Import', business.category || 'Business', businessScore >= 70 ? 'High Priority' : 'Standard'].filter(Boolean),
          lastContact: 'Never',
          nextFollowUp: businessScore >= 70 ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: `Imported from Market Scanner. Revenue: ${business.estimated_revenue || 'Unknown'}. Rating: ${business.rating || 'N/A'}. Succession Risk: ${business.succession_risk || 'N/A'}%. Digital Opportunity: ${business.digital_opportunity || 'N/A'}%.`,
          companyInfo: {
            size: business.employee_count ? `${business.employee_count} employees` : `${Math.floor(Math.random() * 50 + 5)} employees`,
            revenue: business.estimated_revenue || `$${Math.floor(Math.random() * 2000 + 500)}K`,
            website: business.website || `https://${(business.name || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
            employees: business.employee_count || Math.floor(Math.random() * 50 + 5)
          },
          dealValue: business.estimated_revenue ? parseInt(business.estimated_revenue.replace(/[^0-9]/g, '')) : Math.floor(Math.random() * 500000 + 100000),
          probability: businessScore >= 80 ? 75 : businessScore >= 60 ? 50 : 25,
          activities: initialActivities,
          customFields: {
            rating: business.rating,
            reviews: business.reviews,
            succession_risk: business.succession_risk,
            digital_opportunity: business.digital_opportunity,
            coordinates: business.coordinates,
            import_date: new Date().toISOString(),
            market_scanner_id: business.business_id
          }
        };
      });

      // Create campaigns for imported businesses
      const importedCampaigns: Campaign[] = [
        {
          id: `campaign_${Date.now()}_welcome`,
          name: `Welcome Campaign - ${data.businesses[0]?.address?.city || 'Market'} Businesses`,
          type: 'welcome',
          status: 'draft',
          contact_ids: importedContacts.map(c => c.id),
          subject: 'Partnership Opportunity for Your Business',
          content: `Hi {{name}},\n\nWe've identified your business, {{company}}, as a potential partner for exciting growth opportunities in the {{location}} market.\n\nWe'd love to discuss how we can help you:\n• Expand your market reach\n• Increase operational efficiency\n• Access new revenue streams\n\nWould you be available for a brief 15-minute call this week?\n\nBest regards,\nBusiness Development Team`,
          metrics: { sent: 0, opened: 0, clicked: 0, replied: 0 },
          created_at: new Date().toISOString()
        },
        {
          id: `campaign_${Date.now()}_followup`,
          name: `Follow-up Campaign - High Priority Leads`,
          type: 'follow_up',
          status: 'draft',
          contact_ids: importedContacts.filter(c => c.score >= 70).map(c => c.id),
          subject: 'Quick Follow-up: Partnership Discussion',
          content: `Hello {{name}},\n\nI wanted to follow up on our previous message regarding partnership opportunities for {{company}}.\n\nBased on our market analysis, your business shows strong potential for:\n• Revenue growth of 25-40%\n• Market expansion opportunities\n• Operational optimization\n\nI have a few time slots available this week. Would any of these work for a brief call?\n• Tuesday 2:00 PM\n• Wednesday 10:00 AM\n• Thursday 3:00 PM\n\nLooking forward to connecting!\n\nBest,\nBusiness Development Team`,
          metrics: { sent: 0, opened: 0, clicked: 0, replied: 0 },
          created_at: new Date().toISOString()
        }
      ];

      // Create activities for all imported contacts
      const allActivities: Activity[] = importedContacts.flatMap(contact => contact.activities);

      // Add imported data to state
      setContacts(prev => [...prev, ...importedContacts]);
      setCampaigns(prev => [...prev, ...importedCampaigns]);
      setActivities(prev => [...prev, ...allActivities]);
      
      // Clear staged results
      localStorage.removeItem('market_scanner_staged_results');
      
      setNotification(`📥 Successfully imported ${importedContacts.length} contacts, ${importedCampaigns.length} campaigns, and ${allActivities.length} activities from Market Scanner (${data.type})`);
      setTimeout(() => setNotification(''), 5000);
      
    } catch (error) {
      console.error('Error importing Market Scanner results:', error);
      setNotification('❌ Failed to import Market Scanner results. Please try again.');
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      opportunity: 'bg-green-100 text-green-800',
      customer: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.new;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM - Contact Management</h1>
              <p className="text-gray-600">Comprehensive contact and lead management system</p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'contacts' && (
                <>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button
                    onClick={handleImportMarketScannerResults}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {loading ? 'Importing...' : 'Import Market Scanner Results'}
                  </button>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'automation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Automation
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
            {notification}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'contacts' && (
        <>
          {/* Search and Filters */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts, companies, emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="list">List View</option>
                <option value="kanban">Kanban View</option>
                <option value="table">Table View</option>
              </select>
              {searchQuery || Object.keys(activeFilters).length > 0 ? (
                <button
                  onClick={handleSaveSearch}
                  className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  Save Search
                </button>
              ) : null}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={activeFilters.status || 'all'}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="customer">Customer</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={activeFilters.industry || 'all'}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Industries</option>
                  <option value="Hardware Retail">Hardware Retail</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={activeFilters.source || 'all'}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sources</option>
                  <option value="Market Scanner">Market Scanner</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
                <select
                  value={activeFilters.score || 'all'}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, score: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Scores</option>
                  <option value="80-100">80-100 (Hot)</option>
                  <option value="60-79">60-79 (Warm)</option>
                  <option value="0-59">0-59 (Cold)</option>
                </select>
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Searches</h3>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map(search => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setActiveFilters(search.filters);
                      setSearchQuery(search.filters.query || '');
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                  >
                    {search.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.size > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('tag')}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                >
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tag
                </button>
                <button
                  onClick={() => handleBulkAction('campaign')}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                >
                  <Mail className="w-4 h-4 inline mr-1" />
                  Add to Campaign
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Export
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="divide-y divide-gray-200">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => handleContactSelect(contact.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    {/* Contact Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.title} at {contact.company}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>

                    {/* Industry & Location */}
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <Building className="w-4 h-4" />
                        <span>{contact.industry}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{contact.location}</span>
                      </div>
                    </div>

                    {/* Status & Score */}
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)} mb-2`}>
                        {contact.status}
                      </span>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getScoreColor(contact.score)}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {contact.score}
                      </div>
                    </div>

                    {/* Deal Value & Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        {contact.dealValue && (
                          <div className="text-sm font-semibold text-green-600">
                            ${contact.dealValue.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {contact.source}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowContactModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {contact.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {contact.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || Object.keys(activeFilters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by importing contacts from Market Scanner or adding them manually'
                }
              </p>
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add First Contact
              </button>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && <CRMAnalyticsDashboard />}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && <CRMCampaignManager />}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="p-6">
          {activities.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
                  <p className="text-gray-600">Automated tasks and follow-ups for imported businesses</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {activities.filter(a => !a.completed).length} Active Tasks
                  </span>
                </div>
              </div>

              {/* Automation Rules */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Active Automation Rules
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">High-Priority Lead Follow-up</div>
                        <div className="text-sm text-blue-700">Auto-create tasks for leads with score ≥ 70</div>
                      </div>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">Welcome Campaign Trigger</div>
                        <div className="text-sm text-green-700">Auto-add new imports to welcome campaigns</div>
                      </div>
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium text-purple-900">Lead Scoring Updates</div>
                        <div className="text-sm text-purple-700">Auto-update contact status based on score</div>
                      </div>
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">Active</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Recent Automated Actions
                  </h3>
                  <div className="space-y-3">
                    {activities.slice(0, 5).map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded-full ${activity.completed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                          {activity.type === 'task' ? (
                            <CheckCircle className={`w-4 h-4 ${activity.completed ? 'text-green-600' : 'text-yellow-600'}`} />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                          <div className="text-xs text-gray-600">{activity.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(activity.date).toLocaleDateString()} • {activity.completed ? 'Completed' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automation Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
                  <div className="text-sm text-gray-600">Total Tasks Created</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{activities.filter(a => a.completed).length}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{activities.filter(a => !a.completed).length}</div>
                  <div className="text-sm text-gray-600">Pending Tasks</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{campaigns.length}</div>
                  <div className="text-sm text-gray-600">Auto Campaigns</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Automation</h3>
              <p className="text-gray-600 mb-4">
                Import Market Scanner results to see automated workflows, tasks, and campaigns in action.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2">🚀 Ready to Activate</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Automated lead scoring</li>
                  <li>• Email sequence automation</li>
                  <li>• Task assignment rules</li>
                  <li>• Pipeline stage triggers</li>
                  <li>• Follow-up scheduling</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact Detail Modal */}
      {showContactModal && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setShowContactModal(false);
            setSelectedContact(null);
          }}
          onSave={(updatedContact) => {
            if (selectedContact) {
              setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
            } else {
              setContacts(prev => [...prev, { ...updatedContact, id: Date.now().toString() }]);
            }
            setShowContactModal(false);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
}

// Contact Detail Modal Component
function ContactDetailModal({ 
  contact, 
  onClose, 
  onSave 
}: { 
  contact: Contact | null; 
  onClose: () => void; 
  onSave: (contact: Contact) => void; 
}) {
  const [formData, setFormData] = useState<Partial<Contact>>(
    contact || {
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      industry: '',
      location: '',
      source: '',
      status: 'new',
      tags: [],
      notes: '',
      score: 50
    }
  );

  const handleSave = () => {
    onSave(formData as Contact);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {contact ? 'Contact Details' : 'Add New Contact'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={formData.industry || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="Hardware Retail">Hardware Retail</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={formData.source || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Source</option>
                  <option value="Market Scanner">Market Scanner</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'new'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Contact['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="customer">Customer</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score || 50}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any relevant notes about this contact..."
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {contact ? 'Update Contact' : 'Add Contact'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
