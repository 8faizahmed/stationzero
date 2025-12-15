// src/app/privacy-policy/page.tsx
"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">

        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline mb-4 inline-block">
            ← Back to Calculator
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">Last Updated: October 26, 2023</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">1. Overview</h2>
            <p>
              StationZero respects your privacy. This policy describes how we handle your data.
              In short: <strong>We do not collect, store, or share your personal information.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">2. Data Collection & Storage</h2>
            <p>
              StationZero operates as a "local-first" application.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>No Server Database:</strong> We do not have a backend server that stores user accounts, flight data, or aircraft profiles.</li>
              <li><strong>Local Storage:</strong> Any data you enter (such as aircraft profiles or manifest details) is saved directly to your device's internal memory using browser LocalStorage technology.</li>
              <li><strong>Offline Capability:</strong> Since data lives on your device, the app functions completely offline.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">3. Third-Party Services</h2>
            <p>
              This application does not integrate with third-party analytics, advertising networks, or tracking services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact the developer via the support channel listed on the app store page.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
