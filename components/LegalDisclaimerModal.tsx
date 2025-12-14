"use client";

interface LegalModalProps {
  onAccept: () => void;
}

export default function LegalDisclaimerModal({ onAccept }: LegalModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* CARD CONTAINER: Added max-h-[85vh] and flex-col to handle small screens */}
      <div className="bg-white dark:bg-gray-900 max-w-lg w-full max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-red-500/30">
        
        {/* HEADER (Stays Pinned) */}
        <div className="bg-red-600 p-6 text-center flex-shrink-0">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            Critical Safety Notice
          </h2>
        </div>

        {/* CONTENT (Scrolls independently) */}
        <div className="p-6 space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed overflow-y-auto">
          <p className="font-bold text-lg text-gray-900 dark:text-white">
            By using this software, you acknowledge and agree to the following:
          </p>

          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Pilot in Command Responsibility:</strong> You are solely responsible for the safety of the flight and complying with all applicable regulations. This tool is for <em>educational and situational awareness purposes only</em>.
            </li>
            <li>
              <strong>Not a Substitute for POH:</strong> This data does not replace the official Pilot's Operating Handbook (POH) or the specific Weight & Balance data sheet for your individual aircraft.
            </li>
            <li>
              <strong>"As-Is" Software:</strong> This application is provided "as is", without warranty of any kind. The developers are not liable for any errors, bugs, or inaccuracies in the calculations or aircraft templates.
            </li>
            <li>
              <strong>Verification Required:</strong> You must verify all inputs, arms, and moments against your aircraft's official documentation before every flight.
            </li>
          </ul>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            LIMITATION OF LIABILITY: IN NO EVENT SHALL THE CREATORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
          </div>
        </div>

        {/* FOOTER (Stays Pinned) */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button 
            onClick={onAccept}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            I UNDERSTAND & AGREE
          </button>
        </div>
      </div>
    </div>
  );
}