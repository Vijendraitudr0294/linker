const fs = require('fs');
const path = 'src/pages/dashboard/LinkEditor.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use a more generic match for the top of the card to avoid encoding issues
const startMatch = '<Card className="bruddle-card p-8 bg-white border-2 border-emerald-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">';
const endMatch = '{/* Name input + Save */}';

const startIndex = content.indexOf(startMatch);
const endIndex = content.indexOf(endMatch);

if (startIndex !== -1 && endIndex !== -1) {
    const head = content.substring(0, startIndex + startMatch.length);
    const tail = content.substring(endIndex);
    
    // New body for the card
    const newBody = `
                         <div className="flex items-start gap-4 mb-6 flex-wrap">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-black flex items-center justify-center">
                               <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-black uppercase tracking-widest">Design DNA Extracted</p>
                                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                                  {extractedTheme._geminiRaw ? "✦ Powered by Gemini Vision AI" : "⚠ Canvas fallback (Gemini unreachable)"}
                                </p>
                              </div>
                           </div>
                         </div>

                         <div className="flex gap-8 flex-col lg:flex-row mb-8">
                           {/* Thumbnail comparison */}
                           {clonedImage && (
                             <div className="shrink-0">
                               <p className="text-[8px] font-black uppercase tracking-widest text-black/40 mb-3">Your Image</p>
                               <div className="relative group">
                                 <img src={clonedImage} className="w-24 h-32 object-cover rounded-xl border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]" alt="Reference" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <p className="text-[8px] font-black text-white uppercase tracking-tighter">Reference</p>
                                 </div>
                               </div>
                             </div>
                           )}

                           {/* Extracted swatches */}
                           <div className="flex-1">
                             <p className="text-[8px] font-black uppercase tracking-widest text-black/40 mb-4">Extracted Palette</p>
                             <div className="flex gap-4 flex-wrap">
                               {[
                                 { label: 'Background', color: extractedTheme.backgroundColor },
                                 { label: 'Card', color: extractedTheme.cardColor },
                                 { label: 'Text', color: extractedTheme.textColor },
                                 { label: 'Accent', color: extractedTheme.buttonBg },
                               ].map(swatch => (
                                 <div key={swatch.label} className="flex flex-col items-center gap-2">
                                   <div
                                     className="w-14 h-14 rounded-2xl border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform cursor-help"
                                     style={{ background: swatch.color }}
                                     title={\`\${swatch.label}: \${swatch.color}\`}
                                   />
                                   <p className="text-[9px] font-black text-black uppercase tracking-tighter mt-1">{swatch.label}</p>
                                   <p className="text-[9px] font-mono font-bold text-black/40">{swatch.color}</p>
                                 </div>
                               ))}
                             </div>
                           </div>

                           {/* LIVE DNA PREVIEW */}
                           <div className="shrink-0 p-4 rounded-2xl border-2 border-black/5 bg-black/[0.02] flex flex-col items-center">
                              <p className="text-[8px] font-black uppercase tracking-widest text-black/40 mb-4">DNA Live Preview</p>
                              <div 
                                className="w-[140px] aspect-[9/16] rounded-xl border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden scale-90 -my-2 flex flex-col p-2 gap-2"
                                style={{ background: extractedTheme.backgroundColor }}
                              >
                                <div className="w-6 h-6 rounded-full bg-black/10 self-center mb-1" />
                                <div className="w-16 h-1 bg-black/20 self-center rounded-full mb-2" />
                                
                                <div 
                                  className={\`w-full h-8 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center \${extractedTheme.buttonStyle === 'pill' ? 'rounded-full' : extractedTheme.buttonStyle === 'rounded' ? 'rounded-lg' : 'rounded-none'}\`}
                                  style={{ background: extractedTheme.buttonBg }}
                                >
                                  <div className="w-10 h-0.5" style={{ background: extractedTheme.buttonText }} />
                                </div>
                                <div 
                                  className={\`w-full h-8 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-white opacity-60 flex items-center justify-center \${extractedTheme.buttonStyle === 'pill' ? 'rounded-full' : extractedTheme.buttonStyle === 'rounded' ? 'rounded-lg' : 'rounded-none'}\`}
                                >
                                  <div className="w-10 h-0.5 bg-black/20" />
                                </div>
                              </div>
                           </div>
                         </div>

                         {/* Quick style overrides */}
                          <div className="flex gap-10 flex-wrap mb-6 p-5 border-2 border-black/5 rounded-2xl bg-black/[0.01]">
                            <div>
                               <div className="flex items-center gap-2 mb-3">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-black">Button Shape</p>
                                 <div className="h-[2px] w-8 bg-black/10" />
                               </div>
                              <div className="flex gap-2 flex-wrap">
                                {(['pill', 'rounded', 'square', 'outline'] as const).map(style => (
                                  <button key={style} onClick={() => setExtractedTheme((t: any) => ({ ...t, buttonStyle: style }))}
                                    className={\`h-8 px-4 text-[10px] font-black uppercase border-2 transition-all \${extractedTheme?.buttonStyle === style ? 'bg-black text-white border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white text-black/50 border-black/10 hover:border-black hover:text-black'} \${style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-lg' : 'rounded-none'}\`}>
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-3">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-black">Card Layout</p>
                                 <div className="h-[2px] w-8 bg-black/10" />
                               </div>
                              <div className="flex gap-2 flex-wrap">
                                {(['classic', 'glass', 'glass-premium'] as const).map(style => (
                                  <button key={style} onClick={() => setExtractedTheme((t: any) => ({ ...t, cardStyle: style }))}
                                    className={\`h-8 px-4 text-[10px] font-black uppercase rounded-lg border-2 transition-all \${extractedTheme?.cardStyle === style ? 'bg-black text-white border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white text-black/50 border-black/10 hover:border-black hover:text-black'}\`}>
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          `;
    fs.writeFileSync(path, head + newBody + tail, 'utf8');
    console.log('Successfully added live preview and fixed encoding');
} else {
    console.error('Failed to find match points for replacement');
}
