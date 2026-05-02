/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, 
  Share2, 
  ArrowLeft, 
  RefreshCw, 
  Check, 
  ExternalLink,
  MessageCircle,
  Heart,
  Zap,
  Smile,
  Frown,
  BookOpen
} from 'lucide-react';
import { Category, Quote, CATEGORIES, INITIAL_QUOTES } from './types';
import { generateQuotes } from './services/geminiService';

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Set a random daily quote on mount
    const randomQuote = INITIAL_QUOTES[Math.floor(Math.random() * INITIAL_QUOTES.length)];
    setDailyQuote(randomQuote);

    // Initialize AdMob if on native platform
    if (Capacitor.isNativePlatform()) {
      initializeAdMob();
    }
  }, []);

  const initializeAdMob = async () => {
    try {
      console.log('Initializing AdMob...');
      await AdMob.initialize();
      
      const [trackingInfo] = await Promise.all([
        AdMob.trackingAuthorizationStatus(),
      ]);

      console.log('Tracking status:', trackingInfo.status);

      // Prepare Interstitial early
      // Ad Unit IDs can be changed in .env or modified here
      const interstitialId = process.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-2044603074826844/7772005466';
      const bannerId = process.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-2044603074826844/3668941057';

      try {
        await AdMob.prepareInterstitial({
          adId: interstitialId,
          isTesting: false
        });
        console.log('Interstitial prepared');
      } catch (e) {
        console.error('Initial interstitial prep error', e);
      }

      // Show Banner after a short delay
      setTimeout(async () => {
        try {
          await AdMob.showBanner({
            adId: bannerId,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false 
          });
          console.log('Banner displayed successfully');
        } catch (bannerError) {
          console.error('Banner display error:', bannerError);
        }
      }, 2000);

    } catch (e) {
      console.error('AdMob init error', e);
    }
  };

  const showInterstitial = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    const adId = process.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-2044603074826844/7772005466';

    try {
      // First try to show
      await AdMob.showInterstitial();
      
      // After showing, prepare the next one
      await AdMob.prepareInterstitial({
        adId,
        isTesting: false
      });
    } catch (e) {
      console.log('Interstitial not ready or failed, trying to prepare...', e);
      try {
        await AdMob.prepareInterstitial({
          adId,
          isTesting: false
        });
        await AdMob.showInterstitial();
      } catch (innerError) {
        console.error('Interstitial full failure', innerError);
      }
    }
  };

  // Filter quotes based on category
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    const count = quotes.filter(q => q.category === category).length;
    if (count < 5) {
      fetchMoreQuotes(category);
    }
  };

  const fetchMoreQuotes = async (category: Category) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching more quotes for category: ${category}`);
      const newQuotes = await generateQuotes(category);
      
      if (newQuotes.length > 0) {
        let addedCount = 0;
        setQuotes(prev => {
          const existingTexts = new Set(prev.map(q => q.text.trim()));
          const uniqueNewQuotes = newQuotes.filter(q => !existingTexts.has(q.text.trim()));
          addedCount = uniqueNewQuotes.length;
          return [...prev, ...uniqueNewQuotes];
        });

        if (addedCount === 0) {
          setError("সবগুলো উক্তি ইতিমধ্যে যোগ করা আছে। আবার চেষ্টা করুন।");
        } else {
          // Show ad after successfully loading new content
          showInterstitial();
        }
      } else {
        setError("দুঃখিত, কোনো নতুন উক্তি পাওয়া যায়নি। আবার চেষ্টা করুন।");
      }
    } catch (error: any) {
      console.error("Failed to fetch quotes:", error);
      const msg = error.message || "";
      if (msg.includes("API_KEY_INVALID")) {
        setError("আপনার এপিআই কি (API Key) সঠিক নয়। অনুগ্রহ করে নতুন কি তৈরি করুন।");
      } else if (msg.includes("location not supported")) {
        setError("আপনার এলাকা থেকে এই সার্ভিসটি সাপোর্ট করছে না। ভিপিএন (VPN) ব্যবহার করে দেখুন।");
      } else {
        setError(`ত্রুটি: ${msg || "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    
    // Trigger Interstitial Ad occasionally
    if (Math.random() > 0.6) {
      showInterstitial();
    }
  };

  const shareQuote = async (text: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: 'সেরা বাংলা স্ট্যাটাস',
          text: text,
          dialogTitle: 'শেয়ার করুন',
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'সেরা বাংলা স্ট্যাটাস',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }

    // Trigger Interstitial Ad
    showInterstitial();
  };

  const getIcon = (category: Category) => {
    switch (category) {
      case 'Love': return <Heart className="w-6 h-6" />;
      case 'Motivation': return <Zap className="w-6 h-6" />;
      case 'Life': return <BookOpen className="w-6 h-6" />;
      case 'Funny': return <Smile className="w-6 h-6" />;
      case 'Sad': return <Frown className="w-6 h-6" />;
      default: return <MessageCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[140px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[140px] rounded-full animate-float" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute inset-0 bg-noise opacity-[0.03] z-[1]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-2.5 hover:bg-white/10 rounded-full transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-300" />
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-0.5">
                {selectedCategory ? CATEGORIES.find(c => c.name === selectedCategory)?.label : <span className="text-gradient">সেরা বাংলা স্ট্যাটাস</span>}
              </h1>
              {!selectedCategory && <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">অনুপ্রেরণা প্রতিদিন</p>}
            </div>
          </div>
          <div className="w-10 h-10 glass flex items-center justify-center rounded-xl text-indigo-400 shadow-xl shadow-indigo-500/10 ring-1 ring-white/10">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 pb-32 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Daily Quote Hero */}
              {dailyQuote && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-rose-500/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative glass-card p-10 rounded-[2.5rem] overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <BookOpen className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">আজকের বিশেষ উক্তি</span>
                    </div>
                    <p className="text-2xl md:text-4xl font-medium leading-[1.6] mb-10 text-white selection:bg-rose-500/30">
                      “{dailyQuote.text}”
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${CATEGORIES.find(c => c.name === dailyQuote.category)?.color.replace('bg-', 'bg-opacity-20 text-') || 'text-indigo-300'} ring-1 ring-white/10 backdrop-blur-md`}>
                          {CATEGORIES.find(c => c.name === dailyQuote.category)?.label}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => copyToClipboard(dailyQuote.text, 'daily')}
                          className="flex items-center gap-2 px-5 py-3 glass hover:bg-white/10 rounded-2xl transition-all text-slate-300 hover:text-white active:scale-95 group/btn"
                        >
                          {copiedId === 'daily' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />}
                          <span className="text-xs font-bold">{copiedId === 'daily' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                        <button 
                          onClick={() => shareQuote(dailyQuote.text)}
                          className="p-4 glass hover:bg-white/10 rounded-2xl transition-all text-slate-300 hover:text-white active:scale-95"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Categories Grid */}
              <section>
                <div className="flex items-center gap-3 mb-8 px-2">
                  <div className="h-0.5 w-8 bg-indigo-500 rounded-full" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">বিভাগসমূহ</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {CATEGORIES.map((cat, idx) => (
                    <motion.button
                      key={cat.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="group relative glass p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all text-left overflow-hidden active:scale-[0.98] hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity scale-150 rotate-12">
                        {getIcon(cat.name)}
                      </div>
                      <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-white mb-5 shadow-xl shadow-black/40 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ring-1 ring-white/20`}>
                        {getIcon(cat.name)}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">{cat.label}</h3>
                      <p className="text-slate-500 text-xs font-medium tracking-wide">সেরা কালেকশন দেখুন</p>
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="quotes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {filteredQuotes.length === 0 && !loading && (
                <div className="text-center py-20 glass rounded-3xl border border-white/5">
                  <p className="text-slate-500">এই বিভাগে কোনো উক্তি পাওয়া যায়নি।</p>
                  <button 
                    onClick={() => fetchMoreQuotes(selectedCategory!)}
                    className="mt-4 text-indigo-400 font-bold hover:underline"
                  >
                    নতুন উক্তি লোড করুন
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm font-medium">
                  {error}
                </div>
              )}

              {filteredQuotes.map((quote, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: idx * 0.08 
                  }}
                  key={quote.id}
                  className="glass-dark p-10 rounded-[2.5rem] border border-white/5 group hover:border-indigo-500/20 transition-all hover:bg-indigo-500/5"
                >
                  <p className="text-2xl leading-[1.6] mb-10 text-slate-100 font-medium tracking-wide">
                    “{quote.text}”
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => copyToClipboard(quote.text, quote.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all active:scale-95 group/quote-btn ${
                        copiedId === quote.id 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'glass text-slate-400 hover:text-white border-transparent hover:border-white/10'
                      }`}
                    >
                      {copiedId === quote.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5 group-hover/quote-btn:rotate-12 transition-transform" />}
                      <span className="text-sm font-bold">{copiedId === quote.id ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                    <button
                      onClick={() => shareQuote(quote.text)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 ring-1 ring-white/10"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-bold">শেয়ার</span>
                    </button>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={() => fetchMoreQuotes(selectedCategory)}
                disabled={loading}
                className="w-full py-8 glass rounded-[2.5rem] border border-white/5 flex items-center justify-center gap-4 text-indigo-300 font-bold hover:bg-white/5 transition-all disabled:opacity-50 active:scale-[0.99] group/load"
              >
                <div className={`p-2 glass rounded-full group-hover/load:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`}>
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-lg">{loading ? 'নতুন উক্তি লোড হচ্ছে...' : 'আরো নতুন উক্তি দেখুন'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-40 pointer-events-none">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="glass-dark px-6 py-3 rounded-full border border-white/10 pointer-events-auto shadow-2xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
              Crafted with <Heart className="w-2 h-2 inline text-pink-500 mx-1" /> for you
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

