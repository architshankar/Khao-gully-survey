
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import SurveyForm from './components/SurveyForm';
import AuthModal from './components/AuthModal';
import { SurveyData, ProgressState } from './types';
import { getSurveyProgress } from './services/apiService';
import { useAuth } from './contexts/AuthContext';

const STORAGE_KEY = 'khaoo_gully_progress_v3';
const GOAL_COUNT = 500;

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [progress, setProgress] = useState<ProgressState>({
    currentCount: 0,
    goal: GOAL_COUNT,
    hasSubmitted: false
  });
  const [thankYouMessage, setThankYouMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fetch progress from backend on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await getSurveyProgress();
        const stored = localStorage.getItem(STORAGE_KEY);
        const hasSubmitted = stored ? JSON.parse(stored).hasSubmitted : false;
        
        setProgress({
          currentCount: progressData.currentCount,
          goal: progressData.goal,
          hasSubmitted
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Show auth modal if user is not authenticated and hasn't submitted
  useEffect(() => {
    if (!authLoading && !user && !progress.hasSubmitted) {
      setShowAuthModal(true);
    }
  }, [authLoading, user, progress.hasSubmitted]);

  const handleFormSuccess = (data: SurveyData, message: string) => {
    // Update local state immediately for better UX
    const newState = {
      ...progress,
      currentCount: Math.min(progress.currentCount + 1, GOAL_COUNT),
      hasSubmitted: true
    };
    setProgress(newState);
    setThankYouMessage(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const handleReset = () => {
    const newState = { ...progress, hasSubmitted: false };
    setProgress(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black/40 font-bold uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#A3FF00] selection:text-black">
      <Header />
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <main className="flex-grow container mx-auto px-4 mt-12 pb-20">
        {/* User Info Banner */}
        {user && !progress.hasSubmitted && (
          <div className="max-w-xl mx-auto mb-6 bg-black text-[#A3FF00] px-6 py-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata?.name || 'User'} 
                  className="w-10 h-10 rounded-full border-2 border-[#A3FF00]"
                />
              )}
              <div>
                <p className="font-black text-sm uppercase tracking-wide">
                  {user.user_metadata?.name || user.email}
                </p>
                <p className="text-[#A3FF00]/60 text-[10px] font-bold uppercase tracking-wider">
                  Verified User
                </p>
              </div>
            </div>
            <button 
              onClick={signOut}
              className="text-[#A3FF00]/60 hover:text-[#A3FF00] text-xs font-black uppercase tracking-wider transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
        
        {!progress.hasSubmitted ? (
          <>
            <ProgressBar current={progress.currentCount} goal={progress.goal} />
            <div className="mb-12 text-center px-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4 uppercase italic tracking-tighter leading-none">
                MUNCHIES <span className="text-[#89D500]">MISSION</span>
              </h2>
              <p className="text-black/40 text-lg font-bold leading-relaxed uppercase tracking-tight">
                Unlock the reward by filling out a quick survery now!
              </p>
            </div>
            {user ? (
              <SurveyForm onSuccess={handleFormSuccess} />
            ) : (
              <div className="max-w-xl mx-auto text-center">
                <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-xl">
                  <div className="w-20 h-20 bg-black rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                    <i className="fa-solid fa-lock text-3xl text-[#A3FF00]"></i>
                  </div>
                  <h3 className="text-2xl font-black text-black mb-3 uppercase italic tracking-tight">
                    Authentication Required
                  </h3>
                  <p className="text-black/40 mb-6 font-medium">
                    Please sign in with college mail id to participate in the survey
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-black text-[#A3FF00] font-black py-4 px-8 rounded-2xl hover:bg-zinc-800 transition-all uppercase tracking-[0.2em] text-sm shadow-lg"
                  >
                    Sign In Now
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-xl mx-auto mt-6 text-center animate-in zoom-in-95 fade-in duration-700">
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-black/5 shadow-2xl">
              <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl relative rotate-6">
                <i className="fa-solid fa-trophy text-4xl text-[#A3FF00]"></i>
              </div>
              
              <h2 className="text-4xl font-black text-black mb-6 uppercase italic tracking-tighter">Verified Legend!</h2>
              
              <div className="bg-black text-[#A3FF00] p-8 rounded-3xl mb-10 relative shadow-inner">
                <p className="text-[#A3FF00]/50 font-black text-[10px] uppercase tracking-[0.3em] mb-4">The Verdict</p>
                <p className="text-white italic text-xl md:text-2xl leading-relaxed font-bold">
                  "{thankYouMessage}"
                </p>
              </div>
              
              <ProgressBar current={progress.currentCount} goal={progress.goal} />

              <div className="space-y-4 pt-8">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-black text-[#A3FF00] font-black py-5 rounded-2xl transition-all hover:scale-[1.02] uppercase tracking-[0.2em] shadow-lg active:scale-95"
                >
                  Back to Hub
                </button>
                <button 
                  onClick={handleReset}
                  className="text-black/30 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors pt-2"
                >
                  Add another response?
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center border-t border-black/5 bg-white">
        <div className="flex justify-center gap-10 mb-8">
          <a href="https://www.instagram.com/khaoo.gully?igsh=MmkxenhxaTJ4djBr" className="text-black/20 hover:text-black transition-all transform hover:-translate-y-1"><i className="fa-brands fa-instagram text-2xl"></i></a>
          
          <a href="#" className="text-black/20 hover:text-black transition-all transform hover:-translate-y-1"><i className="fa-brands fa-whatsapp text-2xl"></i></a>
        </div>
        <p className="text-black/20 text-[10px] font-black uppercase tracking-[0.5em]">
          Khaoo Gully Logistics • Campus Network 2026
        </p>
      </footer>
    </div>
  );
};

export default App;
