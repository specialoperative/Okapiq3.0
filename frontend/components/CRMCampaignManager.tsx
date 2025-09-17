"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Play, Pause, Stop, Eye, Edit, Trash2, Users, 
  TrendingUp, Calendar, Clock, Target, Send, BarChart3,
  CheckCircle, AlertCircle, XCircle, Filter, Search, FileText
} from 'lucide-react';

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  contact_ids: string[];
  template_id?: string;
  subject?: string;
  content?: string;
  scheduled_date?: string;
  metrics?: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  created_at?: string;
};

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  variables: string[];
  created_at?: string;
};

export default function CRMCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
    loadTemplates();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:3001/enhanced-crm/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3001/enhanced-crm/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowCampaignModal(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignModal(true);
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/enhanced-crm/campaigns/${campaignId}/send`, {
        method: 'POST'
      });
      const result = await response.json();
      
      setNotification(`📧 Campaign sent to ${result.sent_count} contacts`);
      setTimeout(() => setNotification(''), 5000);
      
      loadCampaigns(); // Refresh campaigns
    } catch (error) {
      console.error('Failed to send campaign:', error);
      setNotification('❌ Failed to send campaign');
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status];
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Manager</h2>
          <p className="text-gray-600">Create and manage email campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={handleCreateCampaign}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
          {notification}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Campaigns"
          value={campaigns.length.toString()}
          icon={<Mail className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Campaigns"
          value={campaigns.filter(c => c.status === 'active').length.toString()}
          icon={<Play className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Sent"
          value={campaigns.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0).toLocaleString()}
          icon={<Send className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Avg Open Rate"
          value={`${Math.round(campaigns.reduce((sum, c) => {
            const metrics = c.metrics;
            return sum + (metrics?.sent ? (metrics.opened / metrics.sent) * 100 : 0);
          }, 0) / (campaigns.length || 1))}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(campaign.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.contact_ids.length} contacts
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="capitalize">{campaign.type}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  {campaign.metrics && (
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{campaign.metrics.sent}</div>
                        <div className="text-xs text-gray-500">Sent</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-blue-600">
                          {campaign.metrics.sent ? Math.round((campaign.metrics.opened / campaign.metrics.sent) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Opened</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-green-600">
                          {campaign.metrics.sent ? Math.round((campaign.metrics.clicked / campaign.metrics.sent) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Clicked</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-purple-600">
                          {campaign.metrics.sent ? Math.round((campaign.metrics.replied / campaign.metrics.sent) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Replied</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleSendCampaign(campaign.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first email campaign'
              }
            </p>
            <button
              onClick={handleCreateCampaign}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          campaign={selectedCampaign}
          templates={templates}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
          onSave={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
            loadCampaigns();
          }}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          templates={templates}
          onClose={() => setShowTemplateModal(false)}
          onSave={() => {
            setShowTemplateModal(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
}

// Helper Components
function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{title}</div>
        </div>
      </div>
    </div>
  );
}

function CampaignModal({ 
  campaign, 
  templates, 
  onClose, 
  onSave 
}: { 
  campaign: Campaign | null; 
  templates: EmailTemplate[]; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    type: campaign?.type || 'follow_up',
    subject: campaign?.subject || '',
    content: campaign?.content || '',
    template_id: campaign?.template_id || ''
  });

  const handleSave = async () => {
    try {
      const url = campaign 
        ? `http://localhost:3001/enhanced-crm/campaigns/${campaign.id}`
        : 'http://localhost:3001/enhanced-crm/campaigns';
      
      const method = campaign ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contact_ids: [], // Will be set when sending
          status: 'draft'
        })
      });
      
      onSave();
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {campaign ? 'Edit Campaign' : 'Create Campaign'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="welcome">Welcome</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="proposal">Proposal</option>
                  <option value="nurture">Nurture</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Template</label>
              <select
                value={formData.template_id}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    template_id: e.target.value,
                    subject: template?.subject || prev.subject,
                    content: template?.content || prev.content
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a template (optional)</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email content..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {{name}}, {{company}}, {{title}} to personalize emails
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {campaign ? 'Update Campaign' : 'Create Campaign'}
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

function TemplateModal({ 
  templates, 
  onClose, 
  onSave 
}: { 
  templates: EmailTemplate[]; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Template
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {template.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {template.subject}
                </div>
                <div className="text-sm text-gray-600 line-clamp-3">
                  {template.content.substring(0, 150)}...
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">Create your first email template to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
