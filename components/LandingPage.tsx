"use client";

import React from "react";

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      
      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">S</div>
           <span className="text-xl font-bold tracking-tight">StationZero</span>
        </div>
        <button 
          onClick={onEnterApp}
          className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          Open App →
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center pt-12 pb-20 px-4">
        
        {/* Version Badge */}
        <div className="inline-block mb-6 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
          v1.0 Now Available
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Flight Safety,<br/>Simplified.
        </h1>

        {/* Subhead */}
        <p className="text-xl text-gray-500 dark:text-gray-400 text-center max-w-2xl mb-10 leading-relaxed">
          The modern, offline-first Weight & Balance calculator for General Aviation. 
          Manage your fleet, visualize your CG envelope, and fly with confidence.
        </p>
        
        {/* CTA Button (Top) */}
        <button 
          onClick={onEnterApp}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 mb-20"
        >
          Launch Calculator
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* FEATURE SHOWCASE / SCREENSHOTS */}
        <div className="w-full max-w-6xl space-y-24">
            
            {/* Feature 1: Hangar */}
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300 mx-auto md:mx-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Your Digital Hangar</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                        Manage a fleet of aircraft with unique profiles. Switch between different planes instantly without re-entering data.
                    </p>
                </div>
                <div className="flex-1">
                    <img src="/assets/screenshot-hangar.png" alt="Hangar Interface" className="rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800" />
                </div>
            </div>

            {/* Feature 2: Calculator (Reverse Layout on Desktop) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center text-green-600 dark:text-green-300 mx-auto md:mx-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Dynamic Envelope</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                        Visual Go/No-Go verification. The interactive graph updates in real-time as you load passengers and fuel, showing both Normal and Utility limits.
                    </p>
                </div>
                <div className="flex-1">
                    <img src="/assets/screenshot-calculator.png" alt="Calculator Interface" className="rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800" />
                </div>
            </div>

            {/* Feature 3: Report */}
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-300 mx-auto md:mx-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Professional Manifest</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                        Generate a clean, printable PDF report with a signature block and safety disclaimer. Perfect for flight school records or ramp checks.
                    </p>
                </div>
                <div className="flex-1">
                    <img src="/assets/screenshot-report.png" alt="Print Report" className="rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800" />
                </div>
            </div>

        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div className="mt-32 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8">
            Ready for Takeoff?
          </h2>
          <button 
            onClick={onEnterApp}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 bg-blue-600 text-xl rounded-full hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

      </main>
      
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 dark:border-gray-800">
        <p>&copy; {new Date().getFullYear()} Faiz Ahmed. All Rights Reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
            <a href="/legal" className="hover:text-blue-500 transition-colors">Terms of Use</a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/privacy-policy" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}