import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, ShoppingBag, ExternalLink, RefreshCw, Camera, MapPin, Thermometer, Palette, Scissors, ArrowRight, ArrowLeft, Check, Undo2, Shirt } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { cn } from '@/lib/utils';

interface OutfitResult {
  outfitName: string;
  description: string;
  items: {
    name: string;
    description: string;
    priceRange: string;
    searchQuery: string;
  }[];
  stylingTips: string[];
  colorPalette: string[];
}

const OCCASIONS = [
  { 
    id: 'casual', 
    label: 'Casual', 
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
    desc: 'Coffee runs & hangouts'
  },
  { 
    id: 'office', 
    label: 'Office', 
    emoji: '💼',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&q=80',
    desc: 'Professional & sharp'
  },
  { 
    id: 'party', 
    label: 'Party', 
    emoji: '🎉',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=500&q=80',
    desc: 'Night out & events'
  },
  { 
    id: 'date', 
    label: 'Date Night', 
    emoji: '🌹',
    image: 'https://images.unsplash.com/photo-1621786030484-4c855eed6974?w=500&q=80',
    desc: 'Romantic & stylish'
  },
  { 
    id: 'vacation', 
    label: 'Vacation', 
    emoji: '🌴',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
    desc: 'Relaxed & breezy'
  },
  { 
    id: 'gym', 
    label: 'Active', 
    emoji: '💪',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500&q=80',
    desc: 'Workout & sport'
  },
];

const STYLES = [
  'Minimalist', 'Streetwear', 'Bohemian', 'Classic', 'Edgy', 'Preppy', 'Y2K', 'Old Money', 'Avant-Garde'
];

export function OutfitGenerator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [result, setResult] = useState<OutfitResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    occasion: '',
    style: '',
    fabric: '',
    color: '',
    details: '',
    bodyType: '',
    location: '',
    weather: '',
    image: null as string | null
  });

  const totalSteps = 5;

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    setResult(null);
    setGeneratedImage(null);
    
    try {
      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to generate');
      
      const data = await response.json();
      setResult(data);
      
      // Trigger image generation in background
      generateVisual(data.description);
      
    } catch (error) {
      console.error(error);
      setError('Something went wrong. Please try again.');
      setLoading(false); // Only stop loading on error, otherwise we show result view
    }
  };

  const generateVisual = async (description: string) => {
    setGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.imageUrl);
      }
    } catch (error) {
      console.error("Image generation failed", error);
    } finally {
      setGeneratingImage(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && !formData.occasion) {
      setError("Please select an occasion");
      return;
    }
    setError(null);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(c => c + 1);
    } else {
      handleGenerate();
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setResult(null);
    setGeneratedImage(null);
    setLoading(false);
    setError(null);
    setFormData({
      occasion: '',
      style: '',
      fabric: '',
      color: '',
      details: '',
      bodyType: '',
      location: '',
      weather: '',
      image: null
    });
  };

  // Result View
  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600 mb-2">
              {result.outfitName}
            </h2>
            <p className="text-neutral-500 font-medium">Curated just for you</p>
          </div>
          <button onClick={reset} className="px-4 py-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-medium flex items-center gap-2 transition-colors">
            <RefreshCw size={16} /> Create New Look
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Visual Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden relative shadow-2xl shadow-indigo-500/10 border border-white/50 group">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated Outfit" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                  {generatingImage ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20 animate-pulse"></div>
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-fuchsia-600 relative z-10" />
                      </div>
                      <p className="font-medium text-neutral-500 animate-pulse">Rendering your look...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 mb-4 opacity-50" />
                      <p>Visualizing outfit...</p>
                    </>
                  )}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 text-white">
                <p className="text-sm font-medium leading-relaxed opacity-90">{result.description}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50">
              <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-fuchsia-500" /> Styling Tips
              </h3>
              <ul className="space-y-3">
                {result.stylingTips.map((tip, i) => (
                  <li key={i} className="text-sm text-neutral-700 flex items-start gap-3 bg-white/50 p-3 rounded-xl border border-white/50">
                    <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Items Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
              <h3 className="font-bold text-2xl text-neutral-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="text-indigo-600" /> Shop the Look
              </h3>
              <div className="grid gap-4">
                {result.items.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="group relative p-4 rounded-2xl bg-white border border-neutral-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-neutral-900 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                      <span className="text-xs font-bold bg-neutral-900 text-white px-3 py-1 rounded-full">
                        {item.priceRange}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-4">{item.description}</p>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(item.searchQuery)}&tbm=shop`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline decoration-2 underline-offset-2 transition-all"
                    >
                      Find best price <ExternalLink size={14} />
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-neutral-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500 rounded-full blur-[60px] opacity-20"></div>
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Palette size={18} /> Color Palette
                </h3>
                <div className="flex gap-4">
                  {result.colorPalette.map((color, i) => (
                    <div key={i} className="group relative">
                      <div 
                        className="w-14 h-14 rounded-2xl border-2 border-white/10 shadow-lg transition-transform hover:scale-110 hover:rotate-3 cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black px-2 py-1 rounded">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Vibe Check</h3>
                  <p className="text-white/80 text-sm">This look is perfect for {formData.occasion} with a {formData.style || 'trendy'} twist.</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {formData.weather && (
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Thermometer size={12} /> {formData.weather}
                    </span>
                  )}
                  {formData.location && (
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <MapPin size={12} /> {formData.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading View
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 animate-spin text-fuchsia-600 relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-neutral-900 mb-4">Curating Your Look</h2>
        <p className="text-neutral-500 max-w-md mx-auto animate-pulse">
          Analyzing trends, checking the weather in {formData.location || 'your area'}, and matching your vibe...
        </p>
      </div>
    );
  }

  // Wizard Steps
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-fuchsia-600 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-white/50 min-h-[500px] flex flex-col"
        >
          {/* Step 1: Occasion */}
          {currentStep === 0 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">What's the Occasion?</h2>
                <p className="text-neutral-500">Where are you headed today?</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 content-start">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => {
                      setFormData({ ...formData, occasion: occ.label });
                      // Auto advance after short delay for better UX
                      setTimeout(() => {
                        if (currentStep === 0) setCurrentStep(1);
                      }, 200);
                    }}
                    className={cn(
                      "group relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left",
                      formData.occasion === occ.label
                        ? "border-fuchsia-600 ring-4 ring-fuchsia-100 scale-105 shadow-xl"
                        : "border-transparent hover:border-neutral-200 hover:scale-[1.02]"
                    )}
                  >
                    <img src={occ.image} alt={occ.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 transition-opacity",
                      formData.occasion === occ.label ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                    )}>
                      <span className="text-2xl mb-1">{occ.emoji}</span>
                      <span className="text-white font-bold text-sm leading-tight">{occ.label}</span>
                    </div>
                    {formData.occasion === occ.label && (
                      <div className="absolute top-2 right-2 bg-fuchsia-600 text-white p-1 rounded-full">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Style */}
          {currentStep === 1 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">Pick Your Vibe</h2>
                <p className="text-neutral-500">What style are you feeling right now?</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center content-center flex-1">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFormData({ ...formData, style: s })}
                    className={cn(
                      "px-6 py-3 rounded-full text-base font-bold border-2 transition-all duration-200",
                      formData.style === s
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-lg transform -translate-y-1"
                        : "border-neutral-100 bg-white hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Details */}
          {currentStep === 2 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">The Details</h2>
                <p className="text-neutral-500">Any specific preferences?</p>
              </div>
              <div className="space-y-6 max-w-md mx-auto w-full flex-1">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <Scissors size={16} /> Fabric & Texture
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Silk, Denim, Linen"
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all font-medium"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <Palette size={16} /> Color Palette
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pastels, Earth Tones, All Black"
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all font-medium"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Context */}
          {currentStep === 3 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">Context</h2>
                <p className="text-neutral-500">Help us match the environment.</p>
              </div>
              <div className="space-y-6 max-w-md mx-auto w-full flex-1">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Location & Weather
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NYC, Rainy 60°F"
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all font-medium"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <Shirt size={16} /> Body Type (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Athletic, Curvy, Tall"
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all font-medium"
                    value={formData.bodyType}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Image */}
          {currentStep === 4 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2">Visual Reference</h2>
                <p className="text-neutral-500">Got an inspiration pic? (Optional)</p>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <ImageUpload
                  value={formData.image}
                  onChange={(val) => setFormData({ ...formData, image: val })}
                  className="bg-neutral-50 border-neutral-200 hover:bg-neutral-100 h-64"
                />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 px-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors",
            currentStep === 0 
              ? "text-neutral-300 cursor-not-allowed" 
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          )}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <button
          onClick={nextStep}
          className="bg-neutral-900 text-white px-8 py-3 rounded-full font-bold hover:bg-neutral-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
        >
          {currentStep === totalSteps - 1 ? (
            <>Generate <Sparkles size={18} className="text-yellow-300" /></>
          ) : (
            <>Next <ArrowRight size={18} /></>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-center">
          <span className="inline-block bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-sm font-bold animate-shake">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
