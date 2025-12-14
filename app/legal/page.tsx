// src/app/legal/page.tsx
"use client";

import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">
        
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline mb-4 inline-block">
            ← Back to Calculator
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legal Disclaimer & Terms of Use</h1>
          
          {/* --- FIX: Hardcode the date to prevent hydration errors --- */}
          <p className="text-sm text-gray-500 mt-2">Last Updated: December 14, 2025</p> 
          {/* --------------------------------------------------------- */}
          
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">1. Critical Safety Warning</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r">
              <p className="font-bold text-red-700 dark:text-red-400">
                THIS APPLICATION IS FOR EDUCATIONAL AND SITUATIONAL AWARENESS PURPOSES ONLY.
              </p>
              <p className="mt-2">
                It does <strong>NOT</strong> replace the official Pilot's Operating Handbook (POH), Flight Manual, or the specific Weight & Balance data sheet for the aircraft being flown. Data used in this application (including empty weights, arms, and envelopes) may differ from the actual aircraft configuration.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">2. Pilot In Command (PIC) Responsibility</h2>
            <p>
              The Pilot in Command (PIC) is solely responsible for the safety of the flight and for ensuring the aircraft is loaded within approved weight and center of gravity limits prior to every takeoff. Use of this software does not relieve the pilot of this responsibility. The pilot must verify all calculations against official aircraft documentation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">3. No Warranty ("As-Is")</h2>
            <p>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">4. Data Integrity</h2>
            <p>
              This application stores data locally on your device (browser LocalStorage). The developers do not have access to your saved aircraft data. You are responsible for maintaining the accuracy of any aircraft profiles you create or edit.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}