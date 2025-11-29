/**
 * Project Form Component
 *
 * Allows users to create new humanitarian projects
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { createProject } from '../../services/api';

interface ProjectFormProps {
  onSuccess?: (project: any) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Water',
    country: '',
    region: '',
    lat: '',
    lng: '',
    amount: '',
    photosRequired: '3',
    validatorsRequired: '3',
    deadlineDays: '90',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Water', 'Education', 'Health', 'Climate', 'Infrastructure'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.country || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(formData.deadlineDays));

      const projectData = {
        title: formData.title,
        category: formData.category,
        location: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0,
          country: formData.country,
          region: formData.region || formData.country,
        },
        amount,
        status: 'PENDING',
        conditions: {
          photosRequired: parseInt(formData.photosRequired),
          photosReceived: 0,
          validatorsRequired: parseInt(formData.validatorsRequired),
          validatorsApproved: 0,
          deadline,
        },
      };

      const project = await createProject(projectData);

      setSuccess(`Project "${formData.title}" created successfully!`);
      setFormData({
        title: '',
        category: 'Water',
        country: '',
        region: '',
        lat: '',
        lng: '',
        amount: '',
        photosRequired: '3',
        validatorsRequired: '3',
        deadlineDays: '90',
      });

      if (onSuccess) {
        onSuccess(project);
      }
    } catch (err: any) {
      console.error('[ProjectForm] Failed:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-emerald-500/30"
    >
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-8 h-8 text-cyan-400" />
        <h2 className="text-3xl font-bold text-white">🌍 Create New Project</h2>
      </div>

      <p className="text-emerald-200 mb-6">
        Submit a new humanitarian project to receive funding from the pool
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-emerald-200 font-bold mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Clean Water Well in Senegal"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Funding Amount (XRP) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g., 5000"
              step="1"
              min="1"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., Senegal"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Region
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="e.g., Dakar"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Latitude
            </label>
            <input
              type="number"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              placeholder="e.g., 14.4974"
              step="0.0001"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Longitude
            </label>
            <input
              type="number"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              placeholder="e.g., -14.4524"
              step="0.0001"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Photos Required */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Photos Required
            </label>
            <input
              type="number"
              name="photosRequired"
              value={formData.photosRequired}
              onChange={handleChange}
              min="1"
              max="10"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Validators Required */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Validators Required
            </label>
            <input
              type="number"
              name="validatorsRequired"
              value={formData.validatorsRequired}
              onChange={handleChange}
              min="1"
              max="10"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Deadline Days */}
          <div>
            <label className="block text-emerald-200 font-bold mb-2">
              Deadline (days)
            </label>
            <input
              type="number"
              name="deadlineDays"
              value={formData.deadlineDays}
              onChange={handleChange}
              min="1"
              max="365"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-green-950/50 border-2 border-emerald-500/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            className="flex items-center gap-3 bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white font-bold">{success}</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="flex items-center gap-3 bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-white font-bold">{error}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Creating Project...
            </>
          ) : (
            <>
              <MapPin className="w-6 h-6" />
              Create Project
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};
