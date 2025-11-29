/**
 * Governance Voting - DIT token governance system
 *
 * Features:
 * - Active proposals listing
 * - Voting interface (DIT token required)
 * - Vote weight display
 * - Proposal creation (for eligible users)
 * - Results visualization
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  PlusCircle,
} from 'lucide-react';
import { useStore } from '../../store';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  endsAt: Date;
  createdAt: Date;
  category: 'ngo' | 'trading' | 'distribution' | 'governance';
}

// Mock proposals for demo
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-001',
    title: 'Add Climate Action Network as new NGO beneficiary',
    description: 'Climate Action Network has demonstrated exceptional impact in carbon offset projects across 50+ countries. They meet all Impact Oracle criteria with a score of 94/100.',
    proposer: 'rDonor1111111111111111111111111',
    status: 'active',
    votesFor: 12500,
    votesAgainst: 2300,
    totalVotes: 14800,
    quorum: 10000,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'ngo',
  },
  {
    id: 'prop-002',
    title: 'Increase AI trading risk threshold to 15%',
    description: 'Based on 6 months of performance data, increasing the risk threshold from 10% to 15% could generate 23% more profits while maintaining acceptable safety margins.',
    proposer: 'rDonor2222222222222222222222222',
    status: 'active',
    votesFor: 8900,
    votesAgainst: 9100,
    totalVotes: 18000,
    quorum: 10000,
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: 'trading',
  },
  {
    id: 'prop-003',
    title: 'Change profit distribution to monthly instead of weekly',
    description: 'Monthly distributions would reduce transaction costs by 75% and allow more profit accumulation before distribution.',
    proposer: 'rDonor3333333333333333333333333',
    status: 'passed',
    votesFor: 15600,
    votesAgainst: 4200,
    totalVotes: 19800,
    quorum: 10000,
    endsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    category: 'distribution',
  },
];

const CATEGORY_COLORS = {
  ngo: 'bg-green-100 text-green-700 border-green-300',
  trading: 'bg-blue-100 text-blue-700 border-blue-300',
  distribution: 'bg-purple-100 text-purple-700 border-purple-300',
  governance: 'bg-orange-100 text-orange-700 border-orange-300',
};

const STATUS_CONFIG = {
  active: {
    icon: Clock,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    label: 'Active',
  },
  passed: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50 border-green-200',
    label: 'Passed',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
    label: 'Rejected',
  },
  pending: {
    icon: AlertCircle,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    label: 'Pending',
  },
};

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: string, vote: 'for' | 'against') => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVote }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'for' | 'against' | null>(null);

  const statusConfig = STATUS_CONFIG[proposal.status];
  const StatusIcon = statusConfig.icon;

  const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100;
  const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100;
  const quorumPercentage = (proposal.totalVotes / proposal.quorum) * 100;

  const timeLeft = proposal.endsAt.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const handleVote = (vote: 'for' | 'against') => {
    if (!hasVoted && proposal.status === 'active') {
      setHasVoted(true);
      setUserVote(vote);
      onVote(proposal.id, vote);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[proposal.category]}`}>
              {proposal.category.toUpperCase()}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {proposal.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Voting Stats */}
      <div className="space-y-4 mb-6">
        {/* For/Against Bars */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-600">For</span>
            <span className="text-sm font-bold text-gray-900">
              {proposal.votesFor.toLocaleString()} ({forPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              initial={{ width: 0 }}
              animate={{ width: `${forPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-600">Against</span>
            <span className="text-sm font-bold text-gray-900">
              {proposal.votesAgainst.toLocaleString()} ({againstPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              initial={{ width: 0 }}
              animate={{ width: `${againstPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Quorum Progress */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Quorum Progress</span>
            <span className="text-sm font-bold text-gray-900">
              {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full ${quorumPercentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(quorumPercentage, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {proposal.status === 'active' ? (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {daysLeft} days left
            </span>
          ) : (
            <span>Ended {new Date(proposal.endsAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* Voting Buttons */}
        {proposal.status === 'active' && (
          <div className="flex items-center gap-2">
            {hasVoted ? (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Voted {userVote === 'for' ? 'For' : 'Against'}</span>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={() => handleVote('for')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Vote For
                </motion.button>

                <motion.button
                  onClick={() => handleVote('against')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Vote Against
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const GovernanceVoting: React.FC = () => {
  const { donor } = useStore();
  const [proposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    console.log(`Voting ${vote} on proposal ${proposalId}`);
    // In real app, this would call the API
  };

  const filteredProposals = filter === 'all'
    ? proposals
    : proposals.filter(p => p.status === filter);

  const hasDIT = donor && donor.ditTokenId;
  const votingPower = donor?.totalDonated || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Governance Portal
            </h2>
            <p className="text-gray-600">
              Shape the future of the Impact Fund with your DIT tokens
            </p>
          </div>
        </div>
      </div>

      {/* User Voting Power Card */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">DIT Token Status</div>
              <div className={`text-lg font-bold ${hasDIT ? 'text-green-600' : 'text-gray-400'}`}>
                {hasDIT ? 'Active' : 'No DIT Token'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Voting Power</div>
              <div className="text-lg font-bold text-gray-900">
                {votingPower.toLocaleString()} XRP
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Proposals Voted</div>
              <div className="text-lg font-bold text-gray-900">0</div>
            </div>
          </div>
        </div>

        {!hasDIT && (
          <div className="mt-4 flex items-center gap-2 text-sm text-orange-700 bg-orange-100 rounded-lg p-3 border border-orange-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              Make your first donation to receive a DIT (Donor Impact Token) and participate in governance.
            </span>
          </div>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          {(['all', 'active', 'passed', 'rejected'] as const).map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all capitalize
                ${filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status}
              <span className="ml-2 text-sm">
                ({status === 'all' ? proposals.length : proposals.filter(p => p.status === status).length})
              </span>
            </motion.button>
          ))}
        </div>

        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!hasDIT}
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Proposal</span>
        </motion.button>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No proposals found</h3>
          <p className="text-gray-600">Try selecting a different filter or create a new proposal.</p>
        </div>
      )}
    </div>
  );
};
