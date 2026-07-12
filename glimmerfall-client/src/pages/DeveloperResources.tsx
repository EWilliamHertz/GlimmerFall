import { Code, Server, Terminal, Key } from 'lucide-react';

export const DeveloperResources = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-6">
        <div className="p-3 bg-cyan-900/30 rounded-lg">
          <Code className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">DEVELOPER API</h2>
      </div>

      <div className="space-y-12">
        <section className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Server className="w-6 h-6 text-cyan-500" />
            RESTful API Access
          </h3>
          <p className="text-slate-400 text-lg mb-6 leading-relaxed">
            Glimmerfall TCG provides a robust, Scryfall-inspired public API. Community developers can build deck builders, market trackers, and simulators without ever needing to scrape our servers. 
            All endpoints return standard JSON and are heavily cached at the edge for instant responses.
          </p>

          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-3">
                <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded text-sm font-bold border border-green-700/50">GET</span>
                <code className="text-cyan-300 font-mono text-lg">/api/v1/cards</code>
              </div>
              <p className="text-slate-500 mb-4">Returns a paginated list of all cards currently available in the game, including their full rules text, mana cost, types, and high-resolution artwork URLs.</p>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-400 overflow-x-auto border border-slate-800">
{`{
  "object": "list",
  "total_cards": 100,
  "has_more": false,
  "data": [
    {
      "id": "gf_1a2b3c",
      "name": "Gaia, the World Soul",
      "cost": 7,
      "card_type": "Entity",
      "image_uris": {
        "small": "https://glimmerfall.com/images/small/gaia.png",
        "art_crop": "https://glimmerfall.com/images/art_crop/gaia.png"
      }
    }
  ]
}`}
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-3">
                <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded text-sm font-bold border border-green-700/50">GET</span>
                <code className="text-cyan-300 font-mono text-lg">/api/v1/cards/search?q=t:entity+c&gt;=5</code>
              </div>
              <p className="text-slate-500">Powerful full-text search syntax to filter cards by type, cost, keywords, and artist.</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Key className="w-6 h-6 text-purple-500" />
            Authentication & Rate Limits
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-400 text-lg leading-relaxed mb-4">
                No API key is required to query the public card database. However, we strictly enforce rate limits to ensure stability for the game servers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <Terminal className="w-5 h-5 text-purple-400 shrink-0" />
                  <span><strong>10 requests per second</strong> for public endpoints</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <Terminal className="w-5 h-5 text-purple-400 shrink-0" />
                  <span><strong>100 milliseconds</strong> average latency</span>
                </li>
              </ul>
            </div>
            <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Key className="w-32 h-32 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold text-purple-400 mb-2 relative z-10">Want higher limits?</h4>
              <p className="text-purple-200/70 mb-4 relative z-10">
                If you are building an official community tool (like a tournament organizer), contact us on Discord to get a dedicated Webhook and API token.
              </p>
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-colors relative z-10">
                Apply for Token
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
