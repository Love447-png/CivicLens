import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { AnalysisResult, Severity } from '../types';

const Home: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    const base64Data = selectedImage.split(',')[1]; 
    
    // Pass undefined for locationContext as feature is removed
    const analysis = await analyzeImage(base64Data, undefined);
    
    setResult(analysis);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.HIGH: 
        return 'bg-red-100 text-red-800 border-red-200';
      case Severity.MEDIUM: 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Severity.LOW: 
        return 'bg-green-100 text-green-800 border-green-200';
      default: 
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Report Civic Issues Instantly
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Use our AI-powered vision system to detect potholes, garbage, and more. 
          Help us keep your city clean and safe.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {!selectedImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
          >
            <div className="p-4 bg-blue-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-slate-700">Click to upload an image</p>
            <p className="text-sm text-slate-500 mt-2">JPG or PNG supported</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center group">
              <img src={selectedImage} alt="Upload preview" className="max-h-full max-w-full object-contain" />
              <button 
                onClick={() => { setSelectedImage(null); setResult(null); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm transition"
              >
                Change Image
              </button>
            </div>

            {!result && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" /> Analyzing with Gemini AI...
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} /> Analyze Impact
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
             <div>
               <h2 className="text-2xl font-bold text-slate-800">Analysis Report</h2>
               <p className="text-slate-500 text-sm">Ticket ID: #CIV-{Math.floor(Math.random() * 10000)}</p>
             </div>
             <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${getSeverityColor(result.severity)}`}>
               {result.severity} Severity
             </div>
          </div>
          
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Issue</h3>
              <p className="text-xl font-medium text-slate-900 flex items-center gap-2">
                {result.issue_type}
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {result.confidence}% Confidence
                </span>
              </p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Assessment</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {result.description}
              </p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Action</h3>
              <div className="flex items-start gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <CheckCircle className="mt-0.5 shrink-0" size={20} />
                <p className="font-medium">{result.recommended_action}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <button 
              onClick={() => {
                // In a real app, this would call emailService.sendCivicIssueAlert(data) via an API
                const alertMessage = `Report submitted successfully!
                
Issue: ${result.issue_type}

✓ Email notification dispatched to City Admin (simulated).`;
                alert(alertMessage);
                setSelectedImage(null);
                setResult(null);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Confirm & Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;