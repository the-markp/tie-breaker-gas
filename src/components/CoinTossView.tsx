import React, { useState } from 'react';
import { RotateCw, Heart, Sparkles, AlertCircle, Compass, HelpCircle } from 'lucide-react';

interface CoinTossViewProps {
  options: string[];
  winnerOption?: string;
}

export const CoinTossView: React.FC<CoinTossViewProps> = ({ options, winnerOption }) => {
  const optA = options[0] || 'Option A';
  const optB = options[1] || 'Option B';

  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'A' | 'B' | null>(null);
  const [rotation, setRotation] = useState(0);
  const [userGutReaction, setUserGutReaction] = useState<string | null>(null);
  const [flipCount, setFlipCount] = useState(0);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setUserGutReaction(null);

    // Random outcome: 0 = A, 1 = B
    const outcome = Math.random() > 0.5 ? 'A' : 'B';
    const turns = 5 + Math.floor(Math.random() * 4); // 5 to 8 full rotations
    const extra = outcome === 'A' ? 0 : 180;
    const newRot = rotation + turns * 360 + extra;

    setRotation(newRot);

    setTimeout(() => {
      setResult(outcome);
      setIsFlipping(false);
      setFlipCount((prev) => prev + 1);
    }, 1800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          The Subconscious Intuition Test
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          The Coin Toss Paradox
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          When you flip a coin, it's not about letting chance decide. It's about how you feel in the brief second the coin is in the air. That visceral flash of hope or dread reveals what your subconscious already chose.
        </p>
      </div>

      {/* Coin Stage */}
      <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-center gap-8 mb-6 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span className="text-slate-700 dark:text-slate-300">Heads: <strong className="text-indigo-600 dark:text-indigo-400">{optA}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Tails: <strong className="text-amber-600 dark:text-amber-400">{optB}</strong></span>
          </div>
        </div>

        {/* 3D Coin Object */}
        <div className="relative w-36 h-36 perspective-1000 mb-6 select-none">
          <div
            className={`w-full h-full rounded-full relative transition-transform duration-[1800ms] ease-out preserve-3d shadow-2xl ${
              isFlipping ? 'animate-pulse' : ''
            }`}
            style={{
              transform: `rotateY(${rotation}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front: Heads (Indigo) */}
            <div
              className="absolute inset-0 rounded-full border-4 border-indigo-300 dark:border-indigo-400 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 text-white flex flex-col items-center justify-center backface-hidden shadow-inner"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-28 h-28 rounded-full border border-dashed border-indigo-200/40 flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Side A</span>
                <span className="font-extrabold text-sm line-clamp-2 px-1">{optA}</span>
                <span className="text-[9px] text-indigo-300 mt-0.5">HEADS</span>
              </div>
            </div>

            {/* Back: Tails (Amber) */}
            <div
              className="absolute inset-0 rounded-full border-4 border-amber-300 dark:border-amber-400 bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-white flex flex-col items-center justify-center shadow-inner"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-28 h-28 rounded-full border border-dashed border-amber-200/40 flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100">Side B</span>
                <span className="font-extrabold text-sm line-clamp-2 px-1">{optB}</span>
                <span className="text-[9px] text-amber-200 mt-0.5">TAILS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Action Button */}
        <button
          type="button"
          onClick={flipCoin}
          disabled={isFlipping}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-lg shadow-slate-900/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>{isFlipping ? 'Spinning in mid-air...' : flipCount === 0 ? 'Toss the Tiebreaker Coin' : 'Flip Again'}</span>
        </button>

        {/* Prompt during flip */}
        {isFlipping && (
          <p className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse text-center max-w-sm">
            Watch the spin. Which side are you secretly rooting for right this millisecond?
          </p>
        )}

        {/* Result reflection */}
        {result && !isFlipping && (
          <div className="mt-6 w-full max-w-md p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              The Coin Landed On:
            </p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {result === 'A' ? `Heads: ${optA}` : `Tails: ${optB}`}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                What was your honest immediate emotional reaction?
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'relieved', label: 'Relief / Excited 😌', val: 'relieved' },
                  { id: 'disappointed', label: 'Disappointment 😕', val: 'disappointed' },
                  { id: 'neutral', label: 'Indifferent 😐', val: 'neutral' },
                ].map((reaction) => (
                  <button
                    key={reaction.id}
                    type="button"
                    onClick={() => setUserGutReaction(reaction.val)}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                      userGutReaction === reaction.val
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {reaction.label}
                  </button>
                ))}
              </div>

              {userGutReaction && (
                <div className="mt-3 p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 text-left text-xs text-indigo-900 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-800/50">
                  {userGutReaction === 'relieved' && (
                    <p>
                      ✨ <strong>Intuition Signal:</strong> You felt relief when it landed on <strong>{result === 'A' ? optA : optB}</strong>. That strongly suggests your subconscious leans toward this choice!
                    </p>
                  )}
                  {userGutReaction === 'disappointed' && (
                    <p>
                      💡 <strong>Intuition Signal:</strong> You felt disappointed! That means deep down, you actually prefer <strong>{result === 'A' ? optB : optA}</strong>. The coin did its job by exposing your true desire!
                    </p>
                  )}
                  {userGutReaction === 'neutral' && (
                    <p>
                      ⚖️ <strong>Analytical Signal:</strong> Indifference suggests these options are indeed close in emotional valence. Let the weighted comparison table and SWOT criteria guide your analytical decision.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Regret Minimization Framework */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              The 80-Year-Old Regret Minimization Framework
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fast-forward to age 80 looking back on your life. Which of these two paths would you regret <em>not having tried</em>? Most people on their deathbeds rarely regret the bold experiments that failed; they regret the paths left entirely unexplored out of temporary fear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
