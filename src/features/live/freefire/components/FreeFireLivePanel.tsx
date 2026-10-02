import { useState } from 'react';
import {
  ExternalLink,
  Flame,
  Radio,
  Trophy,
  Globe,
  Play,
  Tv,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { GlowCard } from '@/components/shared/GlowCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  OFFICIAL_FF_LINKS,
  OFFICIAL_FF_STREAMS,
  OFFICIAL_FF_TOURNAMENTS,
  FFWS_STANDINGS,
  OFFICIAL_FF_NEWS,
} from '../freefire.data';
import type { FreeFireStream } from '../freefire.types';

function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'live_stream';
  // If it is already a video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // Match youtube URL patterns (v=..., youtu.be/...)
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match?.[1]) return match[1];
  return trimmed;
}

export function FreeFireLivePanel() {
  const [selectedStream, setSelectedStream] = useState<FreeFireStream>(OFFICIAL_FF_STREAMS[0]);
  const [customStreamInput, setCustomStreamInput] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<string>(OFFICIAL_FF_STREAMS[0].youtubeId);
  const [showWebPortal, setShowWebPortal] = useState(false);

  const handleApplyCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStreamInput.trim()) return;
    const extracted = extractYoutubeId(customStreamInput);
    setActiveVideoId(extracted);
    setSelectedStream({
      id: 'custom-stream',
      title: 'Custom Free Fire Live Stream',
      channel: 'Custom Free Fire Broadcast',
      channelUrl: customStreamInput.startsWith('http') ? customStreamInput : `https://youtube.com/watch?v=${extracted}`,
      youtubeId: extracted,
      isLive: true,
      language: 'Live Stream',
    });
  };

  const handleSelectPresetStream = (stream: FreeFireStream) => {
    setSelectedStream(stream);
    setActiveVideoId(stream.youtubeId);
  };

  return (
    <div className="space-y-6">
      {/* Official banner disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Free Fire MAX Official Live Center</span>
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">
                Official Garena Data
              </Badge>
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              Live broadcast feed and tournament data sourced directly from the official Free Fire website & esports channels. Completely isolated from BlastiX platform matches.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={OFFICIAL_FF_LINKS.esportsHub}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            Official Portal
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Main Content Grid: Live Player + Official Portal Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Player & Broadcast Controls (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <GlowCard className="overflow-hidden p-0 border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-surface/50">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="font-display text-sm font-semibold text-foreground">
                  {selectedStream.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedStream.viewerCount && (
                  <span className="text-xs text-amber-400 font-medium">
                    {selectedStream.viewerCount}
                  </span>
                )}
                <Badge variant="outline" className="text-xs border-white/10">
                  {selectedStream.language}
                </Badge>
              </div>
            </div>

            {/* Embedded YouTube Player */}
            <div className="relative aspect-video w-full bg-black">
              {activeVideoId === 'live_stream' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121620] to-[#0A0D14]">
                  <Flame className="h-14 w-14 text-amber-500 mb-3 animate-pulse" />
                  <h3 className="text-lg font-bold text-foreground">Free Fire India Official Live Broadcast</h3>
                  <p className="max-w-md text-xs text-foreground-muted mt-2">
                    Watch the official live tournaments, FFWS, and championship stream directly on the official YouTube channel or paste an active stream URL below.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <a
                      href={OFFICIAL_FF_LINKS.indiaChannel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-glow"
                    >
                      <Tv className="h-4 w-4" />
                      Open Official FF YouTube Stream
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  title="Free Fire MAX Live Stream"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&mute=0&controls=1&rel=0`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Stream Selector Bar */}
            <div className="border-t border-white/10 p-4 bg-surface/30 space-y-3">
              <div className="text-xs font-medium text-foreground-muted">Official Broadcast Channels:</div>
              <div className="flex flex-wrap gap-2">
                {OFFICIAL_FF_STREAMS.map((stream) => {
                  const isActive = selectedStream.id === stream.id;
                  return (
                    <button
                      key={stream.id}
                      type="button"
                      onClick={() => handleSelectPresetStream(stream)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'bg-surface border border-white/10 text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                      }`}
                    >
                      <Radio className={`h-3.5 w-3.5 ${isActive ? 'text-amber-400' : 'text-foreground-muted'}`} />
                      {stream.channel}
                    </button>
                  );
                })}
              </div>

              {/* Custom YouTube Stream URL Input */}
              <form onSubmit={handleApplyCustomStream} className="flex gap-2 pt-2">
                <Input
                  value={customStreamInput}
                  onChange={(e) => setCustomStreamInput(e.target.value)}
                  placeholder="Paste Free Fire YouTube Stream URL or Video ID..."
                  className="text-xs h-9"
                />
                <Button type="submit" size="sm" variant="outline" className="shrink-0 text-xs h-9">
                  <Play className="h-3.5 w-3.5 mr-1 text-primary" />
                  Load Stream
                </Button>
              </form>
            </div>
          </GlowCard>

          {/* Official Free Fire Tournaments Card */}
          <GlowCard className="p-5 border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  Official Free Fire MAX Tournaments
                </h3>
              </div>
              <Badge variant="outline" className="border-white/10 text-xs">
                Garena Circuit
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {OFFICIAL_FF_TOURNAMENTS.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-white/10 bg-surface/60 p-3.5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <Badge
                        variant="secondary"
                        className={
                          t.status === 'LIVE'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase font-bold'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold'
                        }
                      >
                        {t.status === 'LIVE' ? '● Live' : 'Upcoming'}
                      </Badge>
                      <span className="text-[11px] text-foreground-muted">{t.region}</span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground leading-snug">{t.name}</h4>
                    <p className="text-[11px] text-foreground-muted mt-0.5">{t.edition}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between text-foreground-muted text-[11px]">
                      <span>Prize Pool:</span>
                      <span className="font-semibold text-amber-400">{t.prizePool}</span>
                    </div>
                    <div className="flex justify-between text-foreground-muted text-[11px]">
                      <span>Stage:</span>
                      <span className="text-foreground-soft truncate max-w-[120px]">{t.stage}</span>
                    </div>
                  </div>

                  <a
                    href={t.officialSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded bg-surface-elevated py-1.5 text-[11px] font-medium text-foreground hover:bg-surface-elevated/80 transition-colors w-full border border-white/5"
                  >
                    View Official Bracket
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Right Column: Official Web Hub, Live Standings & Garena News */}
        <div className="space-y-4">
          {/* Official Free Fire Web Portals Quick Access */}
          <GlowCard className="p-5 border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-400" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Official Free Fire Web Portals
              </h3>
            </div>
            <p className="text-xs text-foreground-muted">
              Direct access to Free Fire official servers, player redemption, and tournament verification tools.
            </p>

            <div className="space-y-2">
              <a
                href={OFFICIAL_FF_LINKS.esportsHub}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-surface/60 hover:bg-surface-elevated transition-colors group"
              >
                <div>
                  <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                    Garena FF Esports Portal
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-foreground-muted">Live brackets, official rosters & schedules</div>
                </div>
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                  esports.ff
                </Badge>
              </a>

              <a
                href={OFFICIAL_FF_LINKS.mainSite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-surface/60 hover:bg-surface-elevated transition-colors group"
              >
                <div>
                  <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                    Official Free Fire Website
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-foreground-muted">Game downloads, news & character updates</div>
                </div>
                <Badge variant="outline" className="text-[10px] border-white/10 text-foreground-muted">
                  ff.garena.com
                </Badge>
              </a>

              <a
                href={OFFICIAL_FF_LINKS.rewardSite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-surface/60 hover:bg-surface-elevated transition-colors group"
              >
                <div>
                  <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                    Rewards Redemption Site
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-foreground-muted">Garena official code redemption system</div>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  reward.ff
                </Badge>
              </a>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowWebPortal(!showWebPortal)}
            >
              <Globe className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
              {showWebPortal ? 'Hide Embedded Portal' : 'Show Embedded Garena Web Viewer'}
            </Button>
          </GlowCard>

          {/* Embedded Garena Web Viewer Modal/Frame */}
          {showWebPortal && (
            <GlowCard className="p-0 border-white/10 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-surface">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-amber-400" />
                  esports.ff.garena.com
                </span>
                <a
                  href={OFFICIAL_FF_LINKS.esportsHub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Open in New Tab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative h-96 w-full bg-surface-elevated">
                <iframe
                  title="Garena Free Fire Esports Portal"
                  src={OFFICIAL_FF_LINKS.esportsHub}
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  className="h-full w-full border-0"
                />
              </div>
            </GlowCard>
          )}

          {/* Official FFWS Live Standings Table */}
          <GlowCard className="p-5 border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  FFWS Official Points Table
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
                Official Rules
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-foreground-muted">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Team</th>
                    <th className="py-2 pr-2 text-center">Booyah</th>
                    <th className="py-2 pr-2 text-center">Kills</th>
                    <th className="py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {FFWS_STANDINGS.slice(0, 7).map((s) => (
                    <tr key={s.team} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-2 text-foreground-muted font-sans">{s.rank}</td>
                      <td className="py-2 pr-2 font-sans font-medium text-foreground">
                        <span className="text-amber-400 mr-1.5 font-bold">[{s.tag}]</span>
                        {s.team}
                      </td>
                      <td className="py-2 pr-2 text-center text-amber-400 font-bold">{s.booyahs}</td>
                      <td className="py-2 pr-2 text-center text-foreground-soft">{s.kills}</td>
                      <td className="py-2 text-right font-bold text-primary">{s.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Scoring Matrix Summary */}
            <div className="rounded-lg bg-surface/50 border border-white/5 p-3 text-[11px] text-foreground-muted space-y-1">
              <div className="font-semibold text-foreground text-xs flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Garena Standard Scoring Rule:
              </div>
              <div>#1 Booyah: 12 pts | #2: 9 pts | #3: 8 pts | #4: 7 pts</div>
              <div>#5: 6 pts | #6: 5 pts | Elimination: +1 pt per kill</div>
            </div>
          </GlowCard>

          {/* Official Free Fire News & Notices */}
          <GlowCard className="p-5 border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Official FF MAX Updates & Notices
              </h3>
            </div>

            <div className="space-y-2.5">
              {OFFICIAL_FF_NEWS.map((news) => (
                <div key={news.id} className="rounded-md border border-white/5 bg-surface/40 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-semibold">{news.category}</span>
                    <span className="text-foreground-muted">{news.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground leading-snug">{news.title}</h4>
                  <p className="text-[11px] text-foreground-muted leading-relaxed">{news.summary}</p>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
