"use client";

import React, { useState } from 'react';
import { ArrowLeft, Plus, Upload, BarChart3, TrendingUp, FileText, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Deal = {
  id: number;
  name: string;
  score: number;
  revenue: string;
  value: string;
  irr: string;
  multiple: string;
  cim: boolean;
  lbo: boolean;
  contact: string;
  contactWhen: string;
};

const mockStages: Record<string, Deal[]> = {
  'Franchise Candidate': [
    { id: 1, name: 'Mountain Hardware Co', score: 86, revenue: '$1.4M', value: '$320K', irr: '35.8%', multiple: '2.4x', cim: false, lbo: false, contact: 'Lisa Wang', contactWhen: '5 hours ago' },
  ],
  'Franchise Readiness Review': [
    { id: 2, name: 'Valley Tool & Supply', score: 91, revenue: '$1.8M', value: '$380K', irr: '31.2%', multiple: '2.8x', cim: false, lbo: false, contact: 'Sarah Johnson', contactWhen: '1 day ago' },
  ],
  'Conversion Planning': [
    { id: 3, name: 'Green Thumb Garden Center', score: 94, revenue: '$2.1M', value: '$450K', irr: '28.5%', multiple: '3.2x', cim: true, lbo: true, contact: 'John Smith', contactWhen: '2 hours ago' },
  ],
  'Contract Sent': [
    { id: 4, name: 'Rocky Mountain Tools', score: 88, revenue: '$3.2M', value: '$720K', irr: '24.7%', multiple: '4.1x', cim: true, lbo: true, contact: 'Mike Chen', contactWhen: '3 days ago' },
    { id: 5, name: 'Frontier Hardware', score: 85, revenue: '$2.7M', value: '$580K', irr: '29.3%', multiple: '3.7x', cim: true, lbo: true, contact: 'David Rodriguez', contactWhen: '1 hour ago' },
  ],
};

export default function CRMDealPipeline() {
  const [tab, setTab] = useState<'pipeline' | 'financial' | 'documents' | 'analytics'>('pipeline');
  const [notification, setNotification] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string>('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [campaignTypes, setCampaignTypes] = useState<any[]>([]);
  const [importingFromMarketScanner, setImportingFromMarketScanner] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    client_name: '',
    deal_name: '',
    campaign_type: '',
    budget_range: '',
    timeline: '',
    special_instructions: '',
    contact_email: '',
    contact_phone: ''
  });

  // Button handler functions
  const handleAdvanceStage = (dealId: number, dealName: string) => {
    const deal = Object.values(mockStages).flat().find(d => d.id === dealId);
    if (deal) {
      setSelectedDeal(deal);
      setActiveModal('advance-stage');
    }
  };

  const handleViewDetails = (dealId: number, dealName: string) => {
    const deal = Object.values(mockStages).flat().find(d => d.id === dealId);
    if (deal) {
      setSelectedDeal(deal);
      setActiveModal('details');
    }
  };

  const handleGenerateMemo = (dealId: number, dealName: string) => {
    const deal = Object.values(mockStages).flat().find(d => d.id === dealId);
    if (deal) {
      setSelectedDeal(deal);
      setActiveModal('investment-memo');
    }
  };

  const handleCalculateROI = (dealId: number, dealName: string) => {
    const deal = Object.values(mockStages).flat().find(d => d.id === dealId);
    if (deal) {
      setSelectedDeal(deal);
      setActiveModal('franchise-roi');
    }
  };

  const handleAddTerritoryOpportunities = () => {
    setNotification(`🎯 Opening territory opportunity scanner`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleImportMarketScannerResults = async () => {
    const stagedResults = localStorage.getItem('market_scanner_staged_results');
    if (!stagedResults) {
      setNotification(`⚠️ No staged Market Scanner results found. Please export from Market Scanner first.`);
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    const data = JSON.parse(stagedResults);
    setImportingFromMarketScanner(true);
    setShowImportModal(true);
    setImportProgress(0);

    // Simulate import process with progress
    for (let i = 0; i <= 100; i += 12) {
      setImportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Here you could add the businesses to your CRM state
    // For now, we'll just show the notification
    localStorage.removeItem('market_scanner_staged_results'); // Clear after import
    
    setImportProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setImportingFromMarketScanner(false);
    setShowImportModal(false);
    setNotification(`📥 Successfully imported ${data.businesses.length} businesses from Market Scanner (${data.type})`);
    setTimeout(() => setNotification(''), 5000);
  };

  const handleExecuteCampaign = () => {
    // Load campaign types and show modal
    fetchCampaignTypes();
    setActiveModal('execute-campaign');
  };

  const fetchCampaignTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/crm/campaigns/types');
      const data = await response.json();
      setCampaignTypes(data.campaign_types || []);
    } catch (error) {
      console.error('Failed to load campaign types:', error);
    }
  };

  const handleCampaignFormSubmit = async () => {
    try {
      if (!campaignForm.client_name || !campaignForm.deal_name || !campaignForm.campaign_type || !campaignForm.contact_email) {
        setNotification('❌ Please fill in all required fields');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      const response = await fetch('http://localhost:3001/crm/execute-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: campaignForm.client_name,
          deal_name: campaignForm.deal_name,
          campaign_type: campaignForm.campaign_type,
          budget_range: campaignForm.budget_range,
          timeline: campaignForm.timeline,
          special_instructions: campaignForm.special_instructions,
          contact_email: campaignForm.contact_email,
          contact_phone: campaignForm.contact_phone,
          target_details: {
            source: 'crm_pipeline',
            pipeline_stage: 'manual_campaign_request',
            requested_by: campaignForm.contact_email
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute campaign');
      }

      const result = await response.json();
      
      setNotification(`🚀 Campaign "${result.campaign_id}" executed successfully! Okapiq team notified.`);
      setTimeout(() => setNotification(''), 5000);
      
      // Reset form and close modal
      setCampaignForm({
        client_name: '',
        deal_name: '',
        campaign_type: '',
        budget_range: '',
        timeline: '',
        special_instructions: '',
        contact_email: '',
        contact_phone: ''
      });
      setActiveModal('');
      
    } catch (error) {
      console.error('Campaign execution failed:', error);
      setNotification('❌ Campaign execution failed. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const closeModal = () => {
    setActiveModal('');
    setSelectedDeal(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Removed duplicate breadcrumb/nav under global header */}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {notification && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            {notification}
          </div>
        )}

        {tab === 'pipeline' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">Franchise Conversion Pipeline</h1>
                <p className="text-gray-600 mt-1">CRM (Acquisition Assistant) - End-to-end campaign execution</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleExecuteCampaign}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors"
                >
                  🚀 Execute Campaign
                </button>
                <button 
                  onClick={handleAddTerritoryOpportunities}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4"/>Add Territory Opportunities
                </button>
                <button 
                  onClick={handleImportMarketScannerResults}
                  disabled={importingFromMarketScanner}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {importingFromMarketScanner ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4"/>
                  )}
                  {importingFromMarketScanner ? 'Importing...' : 'Import Market Scanner Results'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KPI label="Franchise Candidates" value="5"/>
              <KPI label="Conversion Value" value="$2450K"/>
              <KPI label="Avg Conversion Rate" value="73%"/>
              <KPI label="Investment Memos" value="3"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(mockStages).map(([stage, deals]) => (
                <div key={stage} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{stage}</h2>
                    <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 font-semibold">{deals.length}</span>
                  </div>
                  <div className="space-y-3">
                    {deals.map((d)=> (
                      <div key={d.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{d.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{d.revenue}</div>
                          </div>
                          <div className="text-lg font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                            {d.score}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-3">
                          <Field k="Value" v={d.value} />
                          <Field k="IRR" v={d.irr} />
                          <Field k="Multiple" v={d.multiple} />
                          <Field k="CIM" v={d.cim ? '✓' : '○'} />
                          <Field k="LBO" v={d.lbo ? '✓' : '○'} />
                        </div>
                        <div className="text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                          Contact: {d.contact} • {d.contactWhen}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleAdvanceStage(d.id, d.name)}
                            className="text-xs px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium border border-emerald-200"
                          >
                            Advance Stage
                          </button>
                          <button 
                            onClick={() => handleViewDetails(d.id, d.name)}
                            className="text-xs px-3 py-2 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium border border-gray-200"
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => handleGenerateMemo(d.id, d.name)}
                            className="text-xs px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium border border-indigo-200"
                          >
                            Investment Memo
                          </button>
                          <button 
                            onClick={() => handleCalculateROI(d.id, d.name)}
                            className="text-xs px-3 py-2 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors font-medium border border-orange-200"
                          >
                            Franchise ROI
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'financial' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Financial Analysis & LBO Modeling</h1>
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"><BarChart3 className="w-4 h-4"/>Run New Analysis</button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm"><ExternalLink className="w-4 h-4"/>Export Models</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card title="Portfolio IRR Analysis">
                  <IRRRow name="Golden Gate HVAC" irr="28.5%" risk="Low" conf="94/100" purchase="$450K" multiple="3.2x" period="5 years" />
                  <IRRRow name="SF Electric Services" irr="24.7%" risk="Medium" conf="88/100" purchase="$720K" multiple="4.1x" period="6 years" />
                  <IRRRow name="Oakland Trade Co" irr="29.3%" risk="Medium" conf="85/100" purchase="$580K" multiple="3.7x" period="5 years" />
                </Card>
                <Card title="Detailed LBO Model - Golden Gate HVAC">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Acquisition Structure</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>Enterprise Value: $2,100,000</li>
                        <li>Debt Financing (60%): $1,260,000</li>
                        <li>Equity Investment (40%): $840,000</li>
                        <li>Transaction Costs: $105,000</li>
                        <li>Total Cash Required: $945,000</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Return Analysis</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>Entry Multiple (EV/EBITDA): 4.2x</li>
                        <li>Exit Multiple (EV/EBITDA): 5.1x</li>
                        <li>EBITDA Growth (CAGR): 12%</li>
                        <li>Debt Paydown: $780,000</li>
                        <li>Total Return: $2,688,000</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-500">
                        <tr><th>Year</th><th>Revenue</th><th>EBITDA</th><th>Debt Service</th><th>FCF</th></tr>
                      </thead>
                      <tbody className="text-gray-800">
                        {[
                          ['1', '$2,100K', '$500K', '$189K', '$311K'],
                          ['2', '$2,310K', '$560K', '$189K', '$371K'],
                          ['3', '$2,541K', '$627K', '$189K', '$438K'],
                          ['4', '$2,795K', '$702K', '$189K', '$513K'],
                          ['5', '$3,075K', '$786K', '$189K', '$597K'],
                        ].map((r,i)=> (
                          <tr key={i} className="border-t"><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              <div className="space-y-4">
                <Card title="Portfolio Metrics">
                  <Metric label="Weighted Avg IRR" value="29.7%"/>
                  <Metric label="Avg Money Multiple" value="3.4x"/>
                  <Metric label="Years Avg Hold" value="4.6"/>
                </Card>
                <Card title="Risk Analysis">
                  <Metric label="Market Risk" value="Low"/>
                  <Metric label="Execution Risk" value="Medium"/>
                  <Metric label="Financial Risk" value="Low"/>
                </Card>
                <Card title="Quick Actions">
                  <button className="w-full mb-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white px-3 py-2 text-sm"><TrendingUp className="w-4 h-4"/>Run Sensitivity Analysis</button>
                  <button className="w-full mb-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-900 px-3 py-2 text-sm">Export LBO Models</button>
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-900 px-3 py-2 text-sm"><Calendar className="w-4 h-4"/>Schedule Review</button>
                </Card>
              </div>
            </div>
          </section>
        )}

        {tab === 'documents' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">AI-Generated Documents & CIMs</h1>
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"><FileText className="w-4 h-4"/>Generate New CIM</button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm">Template Library</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['Golden Gate HVAC','SF Electric Services','Oakland Trade Co'].map((n,i)=> (
                <Card key={i} title={`${n} - Confidential Information Memorandum`} right={<span className="inline-flex items-center gap-1 text-emerald-700 text-xs"><CheckCircle className="w-3 h-3"/>Generated</span>}>
                  <h4 className="font-semibold mb-2">Executive Summary</h4>
                  <p className="text-sm text-gray-700 mb-3">{n} is a well-established services company with consistent growth and strong market positioning in a fragmented industry ripe for consolidation.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-1">Key Financials</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>Annual Revenue: {i===0? '$2.1M': i===1? '$3.2M': '$2.7M'}</li>
                        <li>EBITDA Margin: 24%</li>
                        <li>Customer Count: 1,200+</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Investment Highlights</h5>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Market-leading position</li>
                        <li>Recurring customer base</li>
                        <li>Experienced management</li>
                        <li>Growth opportunities</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs px-2 py-1 rounded bg-gray-900 text-white">Download Full CIM</button>
                    <button className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700">Send to Investor</button>
                    <button className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">Regenerate</button>
                  </div>
                </Card>
              ))}
              <div className="lg:col-span-1 space-y-4">
                <Card title="AI Document Templates">
                  {['Letter of Intent (LOI)','Purchase Agreement','Due Diligence Checklist','Management Presentation','Financing Memorandum','Integration Plan'].map((t)=> (
                    <div key={t} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="text-sm font-medium">{t}</div>
                        <div className="text-xs text-gray-500">Template Ready</div>
                      </div>
                      <button className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">Generate</button>
                    </div>
                  ))}
                </Card>
                <Card title="Document Status">
                  <Metric label="CIMs Generated" value="3/5"/>
                  <Metric label="LOIs Drafted" value="2/5"/>
                  <Metric label="Due Diligence Packages" value="3/5"/>
                </Card>
                <Card title="AI Document Assistant">
                  <p className="text-sm text-gray-700 mb-3">Our AI generates professional‑grade acquisition documents based on your deal parameters and market intelligence.</p>
                  <div className="flex gap-2">
                    <button className="text-sm px-3 py-2 rounded bg-gray-900 text-white">Generate Deal Package</button>
                    <button className="text-sm px-3 py-2 rounded bg-gray-100 text-gray-900">Custom Template</button>
                  </div>
                </Card>
                <Card title="Recent Activity">
                  {[
                    ['CIM generated','Golden Gate HVAC • 2 hours ago'],
                    ['LOI sent','SF Electric • 1 day ago'],
                    ['DD checklist created','Oakland Trade • 2 days ago'],
                  ].map((r,i)=> (
                    <div key={i} className="py-2 border-b last:border-0">
                      <div className="text-sm font-medium">{r[0]}</div>
                      <div className="text-xs text-gray-500">{r[1]}</div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </section>
        )}

        {tab === 'analytics' && (
          <section>
            <h1 className="text-3xl font-bold mb-4">CRM Analytics & Performance</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Conversion Rates by Stage">
                <Metric label="Prospects → Initial Contact" value="68%"/>
                <Metric label="Initial Contact → Due Diligence" value="45%"/>
                <Metric label="Due Diligence → Closing" value="78%"/>
                <Metric label="Overall Close Rate" value="23%"/>
              </Card>
              <Card title="Financial Performance">
                <Metric label="Avg Deal Size" value="$486K"/>
                <Metric label="Avg IRR" value="29.7%"/>
                <Metric label="Avg Multiple" value="3.4x"/>
                <Metric label="Pipeline Velocity" value="$12.4K/day"/>
              </Card>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm">Generate Full Report</button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm">Export Data</button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm">Schedule Review</button>
            </div>
          </section>
        )}
      </main>

      {/* Modal Overlays */}
      
      {/* Campaign Execution Modal - doesn't require selectedDeal */}
      {activeModal === 'execute-campaign' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">🚀 Execute Campaign - Acquisition Assistant</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📧 End-to-End Campaign Execution</h3>
                <p className="text-sm text-blue-700">
                  Submit your campaign request and our expert team will execute the entire process for you. 
                  A notification will be sent to <span className="font-mono bg-blue-100 px-2 py-1 rounded">osiris@okapiq.com</span> to begin immediate execution.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Campaign Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                    <input
                      type="text"
                      value={campaignForm.client_name}
                      onChange={(e) => setCampaignForm({...campaignForm, client_name: e.target.value})}
                      placeholder="Enter client or company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deal/Project Name *</label>
                    <input
                      type="text"
                      value={campaignForm.deal_name}
                      onChange={(e) => setCampaignForm({...campaignForm, deal_name: e.target.value})}
                      placeholder="Enter deal or project name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type *</label>
                    <select
                      value={campaignForm.campaign_type}
                      onChange={(e) => setCampaignForm({...campaignForm, campaign_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select campaign type</option>
                      {campaignTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.estimated_duration}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {campaignForm.campaign_type && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {(() => {
                        const selectedType = campaignTypes.find(t => t.id === campaignForm.campaign_type);
                        return selectedType ? (
                          <div>
                            <p className="text-sm font-medium text-gray-700">{selectedType.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{selectedType.description}</p>
                            <p className="text-xs text-blue-600 mt-2">
                              Duration: {selectedType.estimated_duration} • Budget: {selectedType.typical_budget}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Right Column - Contact & Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                    <input
                      type="email"
                      value={campaignForm.contact_email}
                      onChange={(e) => setCampaignForm({...campaignForm, contact_email: e.target.value})}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={campaignForm.contact_phone}
                      onChange={(e) => setCampaignForm({...campaignForm, contact_phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select
                      value={campaignForm.budget_range}
                      onChange={(e) => setCampaignForm({...campaignForm, budget_range: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select budget range</option>
                      <option value="$500-2000">$500 - $2,000</option>
                      <option value="$2000-5000">$2,000 - $5,000</option>
                      <option value="$5000-10000">$5,000 - $10,000</option>
                      <option value="$10000+">$10,000+</option>
                      <option value="custom">Custom (specify in instructions)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                    <select
                      value={campaignForm.timeline}
                      onChange={(e) => setCampaignForm({...campaignForm, timeline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP</option>
                      <option value="1-2_weeks">1-2 weeks</option>
                      <option value="2-4_weeks">2-4 weeks</option>
                      <option value="1-2_months">1-2 months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={campaignForm.special_instructions}
                  onChange={(e) => setCampaignForm({...campaignForm, special_instructions: e.target.value})}
                  placeholder="Any specific requirements, target criteria, or additional information for the execution team..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={handleCampaignFormSubmit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                >
                  🚀 Execute Campaign
                </button>
                <button onClick={closeModal} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal && selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Advance Stage Modal */}
            {activeModal === 'advance-stage' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Advance Stage: {selectedDeal.name}</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Current Status</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>Revenue:</strong> {selectedDeal.revenue}</p>
                      <p><strong>Score:</strong> {selectedDeal.score}/100</p>
                      <p><strong>IRR:</strong> {selectedDeal.irr}</p>
                      <p><strong>Multiple:</strong> {selectedDeal.multiple}</p>
                      <p><strong>Contact:</strong> {selectedDeal.contact}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input type="checkbox" className="rounded" />
                        <span>Schedule management presentation</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input type="checkbox" className="rounded" />
                        <span>Complete financial due diligence</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input type="checkbox" className="rounded" />
                        <span>Prepare franchise conversion proposal</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => {
                      setNotification(`✅ ${selectedDeal.name} advanced to next stage`);
                      setTimeout(() => setNotification(''), 3000);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Confirm Advance
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Details Modal */}
            {activeModal === 'details' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Deal Details: {selectedDeal.name}</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3">Business Overview</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="mb-2"><strong>Industry:</strong> Hardware & Home Improvement</p>
                      <p className="mb-2"><strong>Founded:</strong> 1987</p>
                      <p className="mb-2"><strong>Employees:</strong> 24</p>
                      <p className="mb-2"><strong>Locations:</strong> 1 (Main Store)</p>
                      <p><strong>Market Position:</strong> Leading local hardware retailer</p>
                    </div>
                    
                    <h4 className="font-semibold mb-2">Key Strengths</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Strong local customer loyalty (85% repeat customers)</li>
                      <li>Prime downtown location with high foot traffic</li>
                      <li>Established supplier relationships</li>
                      <li>Experienced management team</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-sm text-emerald-600">Annual Revenue</p>
                        <p className="text-xl font-bold text-emerald-800">{selectedDeal.revenue}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600">EBITDA</p>
                        <p className="text-xl font-bold text-blue-800">$420K</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm text-orange-600">Asking Price</p>
                        <p className="text-xl font-bold text-orange-800">{selectedDeal.value}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 border rounded-lg">
                      <p className="text-sm text-gray-600">Franchise Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{width: `${selectedDeal.score}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{selectedDeal.score}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Investment Memo Modal */}
            {activeModal === 'investment-memo' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Investment Memo: {selectedDeal.name}</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="prose max-w-none">
                  <h3>Executive Summary</h3>
                  <p>{selectedDeal.name} represents an exceptional franchise conversion opportunity in the hardware retail sector. With strong local market presence and established customer relationships, this acquisition aligns perfectly with Ace Hardware's expansion strategy.</p>
                  
                  <h3>Investment Highlights</h3>
                  <ul>
                    <li><strong>Market Leadership:</strong> Dominant position in local hardware market</li>
                    <li><strong>Financial Performance:</strong> Consistent revenue growth of 8% annually</li>
                    <li><strong>Strategic Fit:</strong> Perfect complement to Ace's franchise network</li>
                    <li><strong>Conversion Potential:</strong> Immediate brand recognition and supply chain benefits</li>
                  </ul>
                  
                  <h3>Financial Projections</h3>
                  <div className="grid grid-cols-2 gap-4 not-prose">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold">Current Performance</h4>
                      <p>Revenue: {selectedDeal.revenue}</p>
                      <p>EBITDA: $420K (30% margin)</p>
                      <p>IRR: {selectedDeal.irr}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h4 className="font-semibold">Post-Conversion (Year 2)</h4>
                      <p>Revenue: $2.8M (+40%)</p>
                      <p>EBITDA: $672K (24% margin)</p>
                      <p>Franchise Fees: $84K annually</p>
                    </div>
                  </div>
                  
                  <h3>Recommendation</h3>
                  <p>We recommend proceeding with the acquisition at the proposed valuation. The strategic benefits of adding this location to the Ace network, combined with strong financial returns, make this an attractive investment opportunity.</p>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => {
                      setNotification(`📄 Investment memo generated for ${selectedDeal.name}`);
                      setTimeout(() => setNotification(''), 3000);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => {
                      setNotification(`📧 Investment memo sent to stakeholders`);
                      setTimeout(() => setNotification(''), 3000);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Send to Stakeholders
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Franchise ROI Modal */}
            {activeModal === 'franchise-roi' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Franchise ROI Calculator: {selectedDeal.name}</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Investment Structure</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Purchase Price:</span>
                        <span className="font-semibold">{selectedDeal.value}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Franchise Fee:</span>
                        <span className="font-semibold">$45K</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Working Capital:</span>
                        <span className="font-semibold">$75K</span>
                      </div>
                      <div className="flex justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="font-semibold">Total Investment:</span>
                        <span className="font-bold text-emerald-700">$440K</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">5-Year Projections</h3>
                    <div className="space-y-2">
                      {[
                        {year: 'Year 1', revenue: '$2.1M', ebitda: '$420K', roi: '28%'},
                        {year: 'Year 2', revenue: '$2.5M', ebitda: '$525K', roi: '32%'},
                        {year: 'Year 3', revenue: '$2.8M', ebitda: '$644K', roi: '35%'},
                        {year: 'Year 4', revenue: '$3.1M', ebitda: '$744K', roi: '38%'},
                        {year: 'Year 5', revenue: '$3.4M', ebitda: '$850K', roi: '41%'},
                      ].map((item, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 p-2 text-sm border-b">
                          <span className="font-medium">{item.year}</span>
                          <span>{item.revenue}</span>
                          <span>{item.ebitda}</span>
                          <span className="font-semibold text-emerald-600">{item.roi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600">5-Year IRR</p>
                    <p className="text-2xl font-bold text-blue-800">{selectedDeal.irr}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-emerald-600">Cash-on-Cash Return</p>
                    <p className="text-2xl font-bold text-emerald-800">193%</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-orange-600">Payback Period</p>
                    <p className="text-2xl font-bold text-orange-800">2.8 years</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => {
                      setNotification(`📊 ROI analysis exported for ${selectedDeal.name}`);
                      setTimeout(() => setNotification(''), 3000);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Export Analysis
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Close
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Import Staging Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 7l3 3 3-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Importing from Market Scanner
                </h3>
                <p className="text-gray-600">
                  Processing and importing staged business results into CRM...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Import Progress</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Messages */}
              <div className="text-sm text-gray-500">
                {importProgress < 20 && "Reading staged data..."}
                {importProgress >= 20 && importProgress < 40 && "Validating business records..."}
                {importProgress >= 40 && importProgress < 60 && "Creating CRM entries..."}
                {importProgress >= 60 && importProgress < 80 && "Updating pipeline..."}
                {importProgress >= 80 && importProgress < 100 && "Finalizing import..."}
                {importProgress === 100 && "✅ Import completed successfully!"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({label, value}:{label:string; value:string}){
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function Field({k, v}:{k:string; v:string}){
  return (
    <div className="flex items-center justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-800">{v}</span></div>
  );
}

function Card({title, right, children}:{title:string; right?:React.ReactNode; children:React.ReactNode}){
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{title}</h3>{right}</div>
      {children}
    </div>
  );
}

function Metric({label, value}:{label:string; value:string}){
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function IRRRow({name, irr, risk, conf, purchase, multiple, period}:{name:string; irr:string; risk:string; conf:string; purchase:string; multiple:string; period:string}){
  return (
    <div className="rounded-lg border border-gray-200 p-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{name}</div>
        <div className="text-lg font-bold">{irr}</div>
      </div>
      <div className="grid grid-cols-5 gap-3 text-sm text-gray-700 mt-1">
        <div>Purchase<br/><span className="font-medium">{purchase}</span></div>
        <div>Multiple<br/><span className="font-medium">{multiple}</span></div>
        <div>Period<br/><span className="font-medium">{period}</span></div>
        <div>Risk<br/><span className="font-medium">{risk}</span></div>
        <div>Confidence<br/><span className="font-medium">{conf}</span></div>
      </div>
    </div>
  );
}



