

import React, { useState, useEffect } from 'react';
import { SurveyData } from '../types';
import { submitSurvey } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

interface SurveyFormProps {
  onSuccess: (data: SurveyData, message: string) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SurveyData>({
    name: '',
    branch: '',
    hostel: '',
    campus: '',
    year: '',
    restaurant1: '',
    restaurant2: '',
    restaurant3: '',
    phoneNumber: '',
    pickupSpot: '',
    orderFrequency: '',
    currentApps: [],
    convincingFactors: [],
  });
  
  const [hostelPrefix, setHostelPrefix] = useState('QC');
  const [hostelNum, setHostelNum] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync combined hostel string whenever prefix or number changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, hostel: `${hostelPrefix}-${hostelNum}` }));
  }, [hostelPrefix, hostelNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mandatory = ['name', 'branch', 'campus', 'year', 'restaurant1', 'phoneNumber', 'pickupSpot', 'orderFrequency'];
    const isMissing = mandatory.some(field => !formData[field as keyof SurveyData]);
    
    // Custom check for combined hostel
    if (isMissing || !hostelNum || formData.currentApps.length === 0 || formData.convincingFactors.length === 0) {
      alert("Please fill in all mandatory fields and select at least one option for the multi-choice questions!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to backend with user ID
      await submitSurvey({
        ...formData,
        userId: user?.id || 'anonymous'
      });
      
      // Call success handler
      onSuccess(formData, "Thanks for joining! We'll keep you posted 🚀");
    } catch (err) {
      console.error('Error submitting survey:', err);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'currentApps' | 'convincingFactors', value: string) => {
    setFormData(prev => {
      const current = prev[name];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...current, value] };
      }
    });
  };

  const inputClass = "w-full bg-black/5 border border-transparent text-black rounded-2xl p-4 transition-all duration-300 placeholder-black/20 font-medium focus:bg-white focus:border-[#A3FF00] focus:ring-0";
  const selectClass = "w-full bg-black/5 border border-transparent text-black rounded-2xl p-4 transition-all duration-300 font-medium focus:bg-white focus:border-[#A3FF00] focus:ring-0 appearance-none";
  const labelClass = "block text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1";
  const checkboxLabelClass = "flex items-center gap-3 p-4 bg-black/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-colors border border-transparent has-[:checked]:border-[#A3FF00] has-[:checked]:bg-white";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/5 shadow-xl space-y-8">
        {/* Section 1: Identification */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-black rounded-full"></div>
            <h3 className="text-black font-black text-xl uppercase tracking-tight italic">The Basics</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Rahul Sharma" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Roll Number *</label>
              <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} placeholder="Enter your roll no." className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Branch *</label>
              <input type="text" name="branch" required value={formData.branch} onChange={handleChange} placeholder="e.g. CSE" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Year of Study *</label>
              <div className="relative">
                <select name="year" required value={formData.year} onChange={handleChange} className={selectClass}>
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post-grad">Post-grad</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/20">
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Hostel Selection *</label>
              <div className="flex gap-2">
                <div className="relative w-1/3">
                  <select 
                    value={hostelPrefix} 
                    onChange={(e) => setHostelPrefix(e.target.value)} 
                    className={selectClass}
                  >
                    <option value="QC">QC</option>
                    <option value="KP">KP</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/20">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </div>
                </div>
                <input 
                  type="text" 
                  required 
                  value={hostelNum} 
                  onChange={(e) => setHostelNum(e.target.value)} 
                  placeholder="e.g. 7a" 
                  className={`${inputClass} w-2/3`} 
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Campus *</label>
              <input type="text" name="campus" required value={formData.campus} onChange={handleChange} placeholder="Campus Location" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Delivery Pickup Spot *</label>
            <input type="text" name="pickupSpot" required value={formData.pickupSpot} onChange={handleChange} placeholder="Where do you usually collect orders?" className={inputClass} />
          </div>
        </div>

        {/* Section 2: Behavior */}
        <div className="pt-8 border-t border-black/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-[#A3FF00] rounded-full"></div>
            <h3 className="text-black font-black text-xl uppercase tracking-tight italic">Food Habits</h3>
          </div>

          <div>
            <label className={labelClass}>Order Frequency *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Daily', '2–3 times a week', 'Once a week', 'Occasionally', 'Rarely'].map((option) => (
                <label key={option} className={checkboxLabelClass}>
                  <input type="radio" name="orderFrequency" value={option} required checked={formData.orderFrequency === option} onChange={handleChange} className="w-5 h-5 accent-black" />
                  <span className="text-sm font-bold text-black/70">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Current Apps Used *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Swiggy', 'Zomato', 'Call the restaurant', 'None'].map((app) => (
                <label key={app} className={checkboxLabelClass}>
                  <input type="checkbox" checked={formData.currentApps.includes(app)} onChange={() => handleCheckboxChange('currentApps', app)} className="w-5 h-5 accent-black" />
                  <span className="text-sm font-bold text-black/70">{app}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Motivation */}
        <div className="pt-8 border-t border-black/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-black rounded-full"></div>
            <h3 className="text-black font-black text-xl uppercase tracking-tight italic">The Switch</h3>
          </div>

          <div>
            <label className={labelClass}>What would convince you to switch? *</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'prices', label: 'Lower prices' },
                { id: 'speed', label: 'Faster delivery' },
                { id: 'offers', label: 'Better offers' },
                { id: 'support', label: 'Better customer support' },
                { id: 'local', label: 'More local restaurants' }
              ].map((factor) => (
                <label key={factor.id} className={checkboxLabelClass}>
                  <input type="checkbox" checked={formData.convincingFactors.includes(factor.label)} onChange={() => handleCheckboxChange('convincingFactors', factor.label)} className="w-5 h-5 accent-black" />
                  <span className="text-sm font-bold text-black/70">{factor.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Restaurants */}
        <div className="pt-8 border-t border-black/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-[#A3FF00] rounded-full"></div>
            <h3 className="text-black font-black text-xl uppercase tracking-tight italic">The Favorites</h3>
          </div>
          
          <div>
            <label className={labelClass}>The GOAT Spot *</label>
            <input type="text" name="restaurant1" required value={formData.restaurant1} onChange={handleChange} placeholder="Mandatory choice" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Option #2</label>
              <input type="text" name="restaurant2" value={formData.restaurant2} onChange={handleChange} placeholder="Optional" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Option #3</label>
              <input type="text" name="restaurant3" value={formData.restaurant3} onChange={handleChange} placeholder="Optional" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-zinc-800 text-[#A3FF00] font-black py-5 rounded-2xl transition-all duration-300 uppercase tracking-[0.25em] text-sm flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-[#A3FF00]/30 border-t-[#A3FF00] rounded-full animate-spin"></div>
            ) : (
              <>
                Lock In Entry
                <i className="fa-solid fa-check-double text-xs"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SurveyForm;
