'use client';

import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  PuzzlePieceIcon, 
  DocumentTextIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export function ProductCards() {
  const products = [
    {
      name: 'Oppy',
      subtitle: 'Opportunity Finder',
      description: 'Zeroes in on income data, demographic shifts, and consumer trends in stable markets. Perfect for growth and expansion opportunities.',
      icon: MagnifyingGlassIcon,
      target: 'Chains, franchises, and growth-focused operators',
      features: [
        'Public contracts & licensing board data',
        'Median household income tracking',
        'Population growth analysis',
        'TAM/SAM estimates per market',
        'Google Trends integration',
        'Local government grants tracking',
        'Policy change impact analysis',
        'Ad spend recommendations'
      ]
    },
    {
      name: 'Fragment Finder',
      subtitle: 'Roll-up Targeting',
      description: 'Identifies highly fragmented markets with multiple small players. Ideal for M&A aggregators looking to unify them into synergistic platforms.',
      icon: PuzzlePieceIcon,
      target: 'PE funds, search funds, and strategic acquirers',
      features: [
        'HHI (Herfindahl–Hirschman Index) calculation',
        'ZIP code & MSA fragmentation scoring',
        'Mom-and-pop density mapping',
        'Consolidation opportunity ranking',
        'Synergy potential scoring',
        'Post-acquisition return projections',
        'Top 10-15 target localities',
        'Market takeover cost analysis'
      ]
    },
    {
      name: 'Acquisition Assistant',
      subtitle: 'Deal Pipeline Manager',
      description: 'Streamlines the entire acquisition process from initial outreach to closing. Your central hub for managing multiple deals simultaneously.',
      icon: DocumentTextIcon,
      target: 'M&A teams handling multiple acquisitions',
      features: [
        'Deal status tracking (NDA, LOI, etc.)',
        'Document organization',
        'Communication scheduling',
        'Automated follow-ups',
        'IRR projections',
        'Synergy calculations',
        'Negotiation scoreboards',
        'AI-generated CIMs'
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <motion.div
          key={product.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card hover:shadow-medium transition-shadow cursor-pointer"
        >
          <div className="card-header">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <product.icon className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.subtitle}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{product.description}</p>
          </div>
          
          <div className="card-body">
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Best For:</h4>
              <p className="text-sm text-gray-600">{product.target}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {product.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className="h-4 w-4 text-success-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="card-footer">
            <button className="btn-primary w-full">
              Learn More
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 