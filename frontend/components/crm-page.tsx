"use client";

import React, { useEffect, useState } from 'react';
import { SmoothReveal, StaggeredReveal, PallyButton, OrigamiCard, SmoothNavLink } from '../ui/smooth-components';
import { ArrowLeft, Users, Building2, Target, Zap, TrendingUp, Phone, Mail, MapPin, DollarSign, Calendar, Star, Filter, Plus, Search, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';

interface CRMPageProps {
  onNavigate: (page: string) => void;
}

export default function CRMPage({ onNavigate }: CRMPageProps) {
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Lightweight auth state (localStorage-backed)
  const [user, setUser] = useState<{ id: string; email?: string; provider: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signup'|'signin'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('okapiq_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persistUser = (u: { id: string; email?: string; provider: string }) => {
    setUser(u);
    try { localStorage.setItem('okapiq_user', JSON.stringify(u)); } catch {}
  };

  const signInWithGoogle = () => {
    persistUser({ id: `gg_${Date.now()}`, email: undefined, provider: 'google' });
    setShowAuth(false);
  };

  const createAccount = () => {
    if (!authEmail || !authPassword) return;
    try {
      const usersRaw = localStorage.getItem('okapiq_users');
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[authEmail]) {
        alert('Account exists. Please sign in.');
        setAuthMode('signin');
        return;
      }
      users[authEmail] = { email: authEmail, password: authPassword };
      localStorage.setItem('okapiq_users', JSON.stringify(users));
      persistUser({ id: `pw_${Date.now()}`, email: authEmail, provider: 'password' });
      setShowAuth(false);
    } catch {}
  };

  const signInEmail = () => {
    try {
      const usersRaw = localStorage.getItem('okapiq_users');
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[authEmail] && users[authEmail].password === authPassword) {
        persistUser({ id: `pw_${Date.now()}`, email: authEmail, provider: 'password' });
        setShowAuth(false);
      } else {
        alert('Invalid credentials');
      }
    } catch {}
  };

  // Notes state per entity
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<Record<string, { id: string; text: string; ts: number; author?: string }[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('okapiq_notes');
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
  }, []);

  const persistNotes = (n: typeof notes) => {
    setNotes(n);
    try { localStorage.setItem('okapiq_notes', JSON.stringify(n)); } catch {}
  };

  const openNote = (entityKey: string) => {
    if (!user) { setShowAuth(true); return; }
    setShowNoteFor(entityKey);
    setNoteDraft('');
  };

  const saveNote = () => {
    if (!showNoteFor || !user || !noteDraft.trim()) return;
    const entry = { id: `${Date.now()}`, text: noteDraft.trim(), ts: Date.now(), author: user.email || user.provider };
    const next = { ...notes, [showNoteFor]: [entry, ...(notes[showNoteFor] || [])] };
    persistNotes(next);
    setShowNoteFor(null);
    setNoteDraft('');
  };

  const mockLeads = [
    {
      id: 1,
      name: "ABC HVAC Services",
      industry: "HVAC",
      revenue: "$2.5M",
      location: "Atlanta, GA",
      status: "New",
      contact: "John Smith",
      phone: "(404) 555-0123",
      email: "john@abchvac.com",
      rating: 4.2,
      employees: 15,
      successionRisk: 75,
      leadScore: 85
    },
    {
      id: 2,
      name: "Metro Restaurant Group",
      industry: "Restaurant",
      revenue: "$1.8M",
      location: "Miami, FL",
      status: "Contacted",
      contact: "Maria Rodriguez",
      phone: "(305) 555-0456",
      email: "maria@metrorest.com",
      rating: 4.5,
      employees: 25,
      successionRisk: 60,
      leadScore: 92
    },
    {
      id: 3,
      name: "Tech Solutions Inc",
      industry: "IT Services",
      revenue: "$3.2M",
      location: "Austin, TX",
      status: "Qualified",
      contact: "David Chen",
      phone: "(512) 555-0789",
      email: "david@techsolutions.com",
      rating: 4.1,
      employees: 18,
      successionRisk: 45,
      leadScore: 78
    },
    {
      id: 4,
      name: "Green Landscaping Co",
      industry: "Landscaping",
      revenue: "$1.2M",
      location: "Phoenix, AZ",
      status: "New",
      contact: "Sarah Johnson",
      phone: "(602) 555-0321",
      email: "sarah@greenlandscaping.com",
      rating: 4.3,
      employees: 12,
      successionRisk: 80,
      leadScore: 88
    }
  ];

  const mockDeals = [
    {
      id: 1,
      name: "ABC HVAC Services",
      value: "$2.5M",
      stage: "Due Diligence",
      probability: "75%",
      expectedClose: "Q2 2024",
      contact: "John Smith",
      lastContact: "2 days ago"
    },
    {
      id: 2,
      name: "Metro Restaurant Group",
      value: "$1.8M",
      stage: "Negotiation",
      probability: "60%",
      expectedClose: "Q3 2024",
      contact: "Maria Rodriguez",
      lastContact: "1 week ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Due Diligence': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
    <div className="min-h-screen">
      {/* No duplicate top-of-page nav below global bar */}

      {/* CRM Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SmoothReveal>
          <h2 className="text-4xl font-bold text-okapi-brown-900 mb-8 text-center">Customer Relationship Management</h2>
        </SmoothReveal>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-okapi-brown-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'leads'
                  ? 'bg-white text-okapi-brown-900 shadow-sm'
                  : 'text-okapi-brown-600 hover:text-okapi-brown-900'
              }`}
            >
              Leads ({mockLeads.length})
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'deals'
                  ? 'bg-white text-okapi-brown-900 shadow-sm'
                  : 'text-okapi-brown-600 hover:text-okapi-brown-900'
              }`}
            >
              Deals ({mockDeals.length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <SmoothReveal delay={0.2}>
          <OrigamiCard pattern="okapi" className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-okapi-brown-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-okapi-brown-300 rounded-md focus:ring-2 focus:ring-okapi-brown-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-okapi-brown-300 rounded-md focus:ring-2 focus:ring-okapi-brown-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                </select>
                <PallyButton size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </PallyButton>
              </div>
            </div>
          </OrigamiCard>
        </SmoothReveal>

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <SmoothReveal delay={0.3}>
            <OrigamiCard pattern="zebra" className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-6 rounded-lg border border-okapi-brown-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-okapi-brown-900 mb-1">{lead.name}</h3>
                        <p className="text-sm text-okapi-brown-600">{lead.industry} • {lead.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-okapi-brown-400 hover:text-okapi-brown-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-okapi-brown-400 hover:text-okapi-brown-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openNote(`lead-${lead.id}`)} className="px-2 py-1 text-xs rounded bg-okapi-brown-100 text-okapi-brown-800 hover:bg-okapi-brown-200">Add Note</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-okapi-brown-500">Revenue</p>
                        <p className="font-semibold text-okapi-brown-900">{lead.revenue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-okapi-brown-500">Employees</p>
                        <p className="font-semibold text-okapi-brown-900">{lead.employees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-okapi-brown-500">Rating</p>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="font-semibold text-okapi-brown-900">{lead.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-okapi-brown-500">Lead Score</p>
                        <p className={`font-semibold ${getLeadScoreColor(lead.leadScore)}`}>{lead.leadScore}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      <div className="text-xs text-okapi-brown-500">
                        Succession Risk: {lead.successionRisk}%
                      </div>
                    </div>

                    <div className="border-t border-okapi-brown-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-okapi-brown-900">{lead.contact}</p>
                          <p className="text-xs text-okapi-brown-600">{lead.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-okapi-brown-100 text-okapi-brown-700 rounded-full hover:bg-okapi-brown-200">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-okapi-brown-100 text-okapi-brown-700 rounded-full hover:bg-okapi-brown-200">
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {(notes[`lead-${lead.id}`] || []).slice(0,3).map(n => (
                        <div key={n.id} className="mt-2 text-xs text-okapi-brown-700 bg-okapi-brown-50 border border-okapi-brown-200 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Note</span>
                            <span className="text-[10px] text-okapi-brown-500">{new Date(n.ts).toLocaleString()}</span>
                          </div>
                          <div className="mt-1">{n.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </OrigamiCard>
          </SmoothReveal>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <SmoothReveal delay={0.3}>
            <OrigamiCard pattern="cheetah" className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockDeals.map((deal) => (
                  <div key={deal.id} className="bg-white p-6 rounded-lg border border-okapi-brown-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-okapi-brown-900 mb-1">{deal.name}</h3>
                        <p className="text-sm text-okapi-brown-600">Deal Value: {deal.value}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-okapi-brown-400 hover:text-okapi-brown-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-okapi-brown-400 hover:text-okapi-brown-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-okapi-brown-500">Stage</p>
                        <p className="font-semibold text-okapi-brown-900">{deal.stage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-okapi-brown-500">Probability</p>
                        <p className="font-semibold text-green-600">{deal.probability}</p>
                      </div>
                      <div>
                        <p className="text-xs text-okapi-brown-500">Expected Close</p>
                        <p className="font-semibold text-okapi-brown-900">{deal.expectedClose}</p>
                      </div>
                      <div>
                        <p className="text-xs text-okapi-brown-500">Last Contact</p>
                        <p className="font-semibold text-okapi-brown-900">{deal.lastContact}</p>
                      </div>
                    </div>

                    <div className="border-t border-okapi-brown-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-okapi-brown-900">{deal.contact}</p>
                        </div>
                      <div className="flex gap-2">
                          <PallyButton size="sm" variant="secondary">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Call
                          </PallyButton>
                          <PallyButton size="sm">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Update Deal
                          </PallyButton>
                          <button onClick={() => openNote(`deal-${deal.id}`)} className="px-2 py-1 text-xs rounded bg-okapi-brown-100 text-okapi-brown-800 hover:bg-okapi-brown-200">Add Note</button>
                        </div>
                      </div>
                      {(notes[`deal-${deal.id}`] || []).slice(0,3).map(n => (
                        <div key={n.id} className="mt-2 text-xs text-okapi-brown-700 bg-okapi-brown-50 border border-okapi-brown-200 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Note</span>
                            <span className="text-[10px] text-okapi-brown-500">{new Date(n.ts).toLocaleString()}</span>
                          </div>
                          <div className="mt-1">{n.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </OrigamiCard>
          </SmoothReveal>
        )}

        {/* Quick Actions */}
        <SmoothReveal delay={0.4}>
          <OrigamiCard pattern="lion" className="p-8 mt-8">
            <h3 className="text-2xl font-bold text-okapi-brown-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PallyButton onClick={() => onNavigate('market-scanner')} className="w-full justify-start">
                <Search className="w-5 h-5 mr-3" />
                Find New Leads
              </PallyButton>
              <PallyButton variant="secondary" className="w-full justify-start">
                <Mail className="w-5 h-5 mr-3" />
                Send Follow-ups
              </PallyButton>
              <PallyButton variant="secondary" className="w-full justify-start">
                <BarChart3 className="w-5 h-5 mr-3" />
                Generate Reports
              </PallyButton>
            </div>
          </OrigamiCard>
        </SmoothReveal>
      </div>
    </div>

    {/* Auth Modal */}
    {showAuth && (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-okapi-brown-200 p-5 w-full max-w-sm">
          <h3 className="text-lg font-bold mb-2">Sign in to save notes</h3>
          <p className="text-sm text-okapi-brown-600 mb-3">Create an account with email or continue with Google.</p>
          <div className="space-y-3">
            <button onClick={signInWithGoogle} className="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold">Continue with Google</button>
            <div className="border-t" />
            <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border rounded" />
            <input value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded" />
            {authMode === 'signup' ? (
              <button onClick={createAccount} className="w-full py-2 rounded-lg bg-gray-900 text-white font-semibold">Create Account</button>
            ) : (
              <button onClick={signInEmail} className="w-full py-2 rounded-lg bg-gray-900 text-white font-semibold">Sign In</button>
            )}
            <button onClick={()=>setAuthMode(authMode==='signup'?'signin':'signup')} className="w-full py-2 rounded-lg bg-gray-100 text-gray-900">{authMode==='signup'?'Have an account? Sign in':'New here? Create account'}</button>
            <button onClick={()=>setShowAuth(false)} className="w-full py-2 rounded-lg bg-white border">Cancel</button>
          </div>
        </div>
      </div>
    )}

    {/* Note Modal */}
    {showNoteFor && (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-okapi-brown-200 p-5 w-full max-w-md">
          <h3 className="text-lg font-bold mb-2">New Note</h3>
          <textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} rows={5} className="w-full border rounded p-2" placeholder="Write your note..." />
          <div className="mt-3 flex gap-2 justify-end">
            <button onClick={()=>setShowNoteFor(null)} className="px-3 py-2 rounded bg-gray-100 text-gray-900">Cancel</button>
            <button onClick={saveNote} className="px-3 py-2 rounded bg-emerald-600 text-white">Save Note</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
} 