/**
 * Green Governance Voting - Eco-themed DIT token governance
 *
 * Features:
 * - Green gradient design
 * - Active proposals
 * - Animated voting interface
 * - Vote weight display
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
  Sparkles,
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
  ngo: 'bg-lime-400/20 text-lime-200 border-lime-400/40',
  trading: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/40',
  distribution: 'bg-purple-400/20 text-purple-200 border-purple-400/40',
  governance: 'bg-orange-400/20 text-orange-200 border-orange-400/40',
};

const STATUS_CONFIG = {
  active: {
    icon: Clock,
    color: 'text-cyan-200 bg-cyan-400/20 border-cyan-400/40',
    label: 'Active',
  },
  passed: {
    icon: CheckCircle,
    color: 'text-lime-200 bg-lime-400/20 border-lime-400/40',
    label: 'Passed',
  },
  rejected: {
    icon: XCircle,
    color: 'text-rose-200 bg-rose-400/20 border-rose-400/40',
    label: 'Rejected',
  },
  pending: {
    icon: AlertCircle,
    color: 'text-yellow-200 bg-yellow-400/20 border-yellow-400/40',
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
      className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl border-2 border-emerald-500/30 p-6 hover:shadow-2xl hover:shadow-lime-400/20 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${CATEGORY_COLORS[proposal.category]}`}>
              {proposal.category.toUpperCase()}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {proposal.title}
          </h3>

          <p className="text-sm text-emerald-200 mb-4">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Voting Stats */}
      <div className="space-y-4 mb-6">
        {/* For Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-lime-200">✓ For</span>
            <span className="text-sm font-bold text-white">
              {proposal.votesFor.toLocaleString()} ({forPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-green-950/50 rounded-full h-3 overflow-hidden border border-emerald-500/30">
            <motion.div
              className="h-full bg-gradient-to-r from-lime-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${forPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Against Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-rose-200">✗ Against</span>
            <span className="text-sm font-bold text-white">
              {proposal.votesAgainst.toLocaleString()} ({againstPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-green-950/50 rounded-full h-3 overflow-hidden border border-emerald-500/30">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-red-600"
              initial={{ width: 0 }}
              animate={{ width: `${againstPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Quorum Progress */}
        <div className="pt-2 border-t border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-emerald-200">Quorum Progress</span>
            <span className="text-sm font-bold text-white">
              {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-green-950/50 rounded-full h-2.5 overflow-hidden border border-emerald-500/30">
            <motion.div
              className={`h-full ${quorumPercentage >= 100 ? 'bg-gradient-to-r from-lime-400 to-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(quorumPercentage, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-emerald-500/30">
        <div className="text-sm text-emerald-200 font-medium">
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
              <div className="flex items-center gap-2 text-sm font-bold text-lime-200 bg-lime-400/20 px-4 py-2 rounded-xl border border-lime-400/40">
                <CheckCircle className="w-4 h-4" />
                <span>Voted {userVote === 'for' ? 'For' : 'Against'}</span>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={() => handleVote('for')}
                  className="px-5 py-2.5 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-lime-400/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Vote For
                </motion.button>

                <motion.button
                  onClick={() => handleVote('against')}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-rose-400/30 transition-all"
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

export const GreenGovernanceVoting: React.FC = () => {
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg"
          >
            <Vote className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              🗳️ Governance Portal
            </h2>
            <p className="text-emerald-200 text-lg">
              Shape the future of the Impact Fund with your DIT tokens
            </p>
          </div>
        </motion.div>
      </div>

      {/* User Voting Power Card */}
      <motion.div
        className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-6 mb-8 border-2 border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <div className="text-sm text-emerald-200 mb-1 font-medium">DIT Token Status</div>
              <div className={`text-lg font-bold ${hasDIT ? 'text-lime-400' : 'text-emerald-400'}`}>
                {hasDIT ? '✓ Active' : '✗ No DIT Token'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: -10 }}
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <div className="text-sm text-emerald-200 mb-1 font-medium">Voting Power</div>
              <div className="text-lg font-bold text-white">
                {votingPower.toLocaleString()} XRP
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <div className="text-sm text-emerald-200 mb-1 font-medium">Proposals Voted</div>
              <div className="text-lg font-bold text-white">0</div>
            </div>
          </div>
        </div>

        {!hasDIT && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-200 bg-yellow-400/20 rounded-xl p-4 border-2 border-yellow-400/30">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">
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
                px-5 py-2.5 rounded-2xl font-bold transition-all capitalize border-2
                ${filter === status
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-white border-lime-400 shadow-lg shadow-lime-400/30'
                  : 'bg-emerald-800/50 text-emerald-200 border-emerald-500/30 hover:border-lime-400/50'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status}
              <span className={`ml-2 text-sm ${filter === status ? 'text-white/80' : 'text-emerald-300'}`}>
                ({status === 'all' ? proposals.length : proposals.filter(p => p.status === status).length})
              </span>
            </motion.button>
          ))}
        </div>

        <motion.button
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-lime-400/30 transition-all border-2 border-lime-400/30"
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
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Vote className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No proposals found</h3>
          <p className="text-emerald-200">Try selecting a different filter or create a new proposal.</p>
        </motion.div>
      )}
    </div>
  );
};
