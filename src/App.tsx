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

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Filter quotes based on category
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    // If we don't have many quotes for this category, maybe fetch more?
    const count = quotes.filter(q => q.category === category).length;
    if (count < 3) {
      fetchMoreQuotes(category);
    }
  };

  const fetchMoreQuotes = async (category: Category) => {
    setLoading(true);
    const newQuotes = await generateQuotes(category);
    if (newQuotes.length > 0) {
      setQuotes(prev => [...prev, ...newQuotes]);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    
    // Simulate Interstitial Ad trigger
    if (Math.random() > 0.7) {
      setShowInterstitial(true);
    }
  };

  const shareQuote = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Status & Quotes',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: WhatsApp share link
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }

    // Simulate Interstitial Ad trigger
    if (Math.random() > 0.7) {
      setShowInterstitial(true);
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-bottom border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight">
            {selectedCategory ? CATEGORIES.find(c => c.name === selectedCategory)?.label : 'বাংলা স্ট্যাটাস ও উক্তি'}
          </h1>
        </div>
        {!selectedCategory && (
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <MessageCircle className="w-6 h-6" />
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-32">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left"
                >
                  <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {getIcon(cat.name)}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{cat.label}</h3>
                  <p className="text-slate-500 text-sm">সেরা {cat.label} স্ট্যাটাস দেখুন</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="quotes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filteredQuotes.map((quote) => (
                <motion.div
                  layout
                  key={quote.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <p className="text-lg leading-relaxed mb-6 font-medium text-slate-800">
                    "{quote.text}"
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => copyToClipboard(quote.text, quote.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        copiedId === quote.id 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      {copiedId === quote.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="text-sm font-semibold">{copiedId === quote.id ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                    <button
                      onClick={() => shareQuote(quote.text)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">শেয়ার</span>
                    </button>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={() => fetchMoreQuotes(selectedCategory)}
                disabled={loading}
                className="w-full py-4 flex items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'লোড হচ্ছে...' : 'আরো দেখুন'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Banner Ad Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-40">
        <div className="max-w-2xl mx-auto h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative group">
          <div className="absolute top-1 left-1 bg-slate-400 text-[8px] text-white px-1 rounded">AD</div>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Banner Ad Placeholder</p>
          <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-indigo-600 text-[10px] font-bold">AdMob Banner Integrated</span>
          </div>
        </div>
      </div>

      {/* Interstitial Ad Simulation */}
      <AnimatePresence>
        {showInterstitial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          >
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden relative">
              <button 
                onClick={() => setShowInterstitial(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Interstitial Ad</h2>
                <p className="text-slate-500 mb-8">This is where a full-screen advertisement would appear in a real mobile app.</p>
                <button 
                  onClick={() => setShowInterstitial(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Close Ad
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
