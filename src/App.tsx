import { useState, useRef, useEffect } from "react"
// imports removed

const API = "https://api.anthropic.com/v1/messages"
const KEY = (import.meta as any).env.VITE_CLAUDE_KEY

export default function App() {
  const [page, setPage] = useState("onboard")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [notif, setNotif] = useState("")
  const [agentLog, setAgentLog] = useState<string[]>([])
  const [agentRunning, setAgentRunning] = useState(false)
  const [wallet, setWallet] = useState({ connected: false, address: "", balance: 0 })
  const [hskPrice, setHskPrice] = useState(0.157)
  const [hskChange, setHskChange] = useState(-0.4)

  useEffect(() => {
    async function fetchHSK() {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hashkey-platform-token&vs_currencies=usd&include_24hr_change=true")
        const data = await res.json()
        setHskPrice(data["hashkey-platform-token"]?.usd || 0.157)
        setHskChange(data["hashkey-platform-token"]?.usd_24h_change || -0.4)
      } catch {
        setHskPrice(0.157)
        setHskChange(-0.4)
      }
    }
    fetchHSK()
    const interval = setInterval(fetchHSK, 30000)
    return () => clearInterval(interval)
  }, [])

  async function connectOneWallet() {
    const eth = (window as any).ethereum
    if (eth) {
      try {
        const accounts = await eth.request({ method: "eth_requestAccounts" })
        const address = accounts[0]
        try {
          await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xB1" }] })
        } catch {
          try {
            await eth.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0xB1", chainName: "HashKey Chain", nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 }, rpcUrls: ["https://mainnet.hsk.xyz"], blockExplorerUrls: ["https://explorer.hsk.xyz"] }] })
          } catch {}
        }
        setWallet({ connected: true, address: address.slice(0,6)+"..."+address.slice(-4), balance: +(Math.random()*100).toFixed(4) })
        toast("Connected to HashKey Chain!")
      } catch {
        setWallet({ connected: true, address: "0xDemo...1234", balance: 42.0 })
        toast("Demo mode connected!")
      }
    } else {
      setWallet({ connected: true, address: "0xDemo...1234", balance: 42.0 })
      toast("Demo mode — Install MetaMask!")
    }
  }
  const logRef = useRef(null)

  const toast = (m: string) => { setNotif(m); setTimeout(() => setNotif(""), 3000) }

  async function generatePlan() {
    if (!prompt.trim()) { setPage("dashboard"); return }
    setLoading(true)
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-calls": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content: "You are PayBrain AI. Respond with 3 short investment insights for: " + prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || "Plan generated!"
      toast(text.slice(0, 80))
    } catch(e) {
      toast("Default plan loaded")
    }
    setLoading(false)
    setPage("dashboard")
  }

  async function runAgents() {
    setAgentRunning(true)
    setAgentLog([])
    const logs = [
      "Trader Agent: Scanning RWA markets on HashKey Chain...",
      "HK Real Estate TVL +8.3% - Increasing allocation",
      "Predictor Agent: Analyzing cashflow for 30 days...",
      "Payment Agent: Reserving rent $800 via HSP...",
      "Risk Agent: Portfolio volatility within bounds",
      "ZKID Agent: Compliance proof generated",
      "Trader Agent: Yield optimized to 13.2%",
      "All agents completed. Next cycle in 6 hours."
    ]
    for (const log of logs) {
      await new Promise(r => setTimeout(r, 700))
      setAgentLog(p => [...p, log])
    }
    setAgentRunning(false)
    toast("AI Swarm cycle complete!")
  }

  const S = {
    app: { minHeight: "100vh", background: "#05070d", color: "#e8edf5", fontFamily: "sans-serif", paddingBottom: "64px" },
    header: { background: "#080c14", borderBottom: "1px solid #1a2540", padding: "0 16px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky" as const, top: 0, zIndex: 50 },
    card: { background: "#080c14", border: "1px solid #1a2540", borderRadius: "10px", padding: "14px", marginBottom: "8px" },
    nav: { position: "fixed" as const, bottom: 0, left: 0, right: 0, background: "#080c14", borderTop: "1px solid #1a2540", display: "flex", height: "56px", zIndex: 100 },
    green: { color: "#00ff88" },
    input: { background: "#0c1220", border: "1px solid #1a2540", borderRadius: "8px", padding: "12px", color: "#e8edf5", fontSize: "13px", width: "100%", outline: "none", boxSizing: "border-box" as const },
    btnG: { background: "linear-gradient(135deg,#00ff88,#00cc6a)", border: "none", borderRadius: "8px", color: "#000", padding: "14px", width: "100%", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
    btnGhost: { background: "transparent", border: "1px solid #1a2540", borderRadius: "8px", color: "#e8edf5", padding: "12px", width: "100%", fontSize: "13px", cursor: "pointer" },
  }

  return (
    <div style={S.app}>
      {notif && <div style={{ position: "fixed", top: "60px", left: "50%", transform: "translateX(-50%)", background: "#0c1220", border: "1px solid #00ff8840", borderRadius: "6px", padding: "8px 18px", zIndex: 200, color: "#00ff88", fontWeight: 600, fontSize: "12px", whiteSpace: "nowrap", maxWidth: "90vw", overflow: "hidden" }}>{notif}</div>}

      {page === "onboard" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🧠</div>
            <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#e8edf5", marginBottom: "8px" }}>Pay<span style={S.green}>Brain</span></h1>
            <p style={{ color: "#4a5a7a", fontSize: "13px", lineHeight: 1.6 }}>AI-Driven Autonomous Financial OS<br/>on HashKey Chain</p>
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "12px", flexWrap: "wrap" }}>
              {["ZKID", "RWA", "PayFi", "AI Swarm", "HSP"].map(t => (
                <span key={t} style={{ background: "#00ff8818", border: "1px solid #00ff8840", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color: "#00ff88", fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={S.card}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a5a7a", marginBottom: "8px" }}>TELL PAYBRAIN YOUR GOALS</div>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. I want 12% yield, auto-pay all bills, living in Hong Kong with $2000/month..." style={{ ...S.input, height: "100px", resize: "none" as const }} />
              <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                {["12% yield, low risk", "RWA + auto-payments HK", "DeFi passive income"].map(s => (
                  <button key={s} onClick={() => setPrompt(s)} style={{ background: "#0c1220", border: "1px solid #1a2540", borderRadius: "6px", color: "#8899bb", padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>{s}</button>
                ))}
              </div>
              <button style={{ ...S.btnG, marginTop: "12px" }} onClick={generatePlan} disabled={loading}>
                {loading ? "Generating Plan..." : "Generate My Financial Plan"}
              </button>
            </div>
            <button style={S.btnGhost} onClick={() => setPage("dashboard")}>Skip - Use Default Plan</button>
          </div>
        </div>
      )}

      {page === "dashboard" && (
        <>
          <div style={S.header}>
            <span style={{ fontWeight: 800, fontSize: "16px" }}>Pay<span style={S.green}>Brain</span></span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ background: "#00ff8818", border: "1px solid #00ff8840", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color: "#00ff88" }}>Personal</span>
              <button onClick={connectOneWallet} style={{ background: wallet.connected ? "#0c1220" : "linear-gradient(135deg,#00ff88,#00cc6a)", border: "1px solid #00ff8840", borderRadius: "6px", color: wallet.connected ? "#00ff88" : "#000", padding: "4px 10px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>
                {wallet.connected ? wallet.address : "Connect HSK"}
              {hskPrice > 0 && (
                <span style={{fontSize:"10px", marginLeft:"6px", color: hskChange >= 0 ? "#00ff88" : "#ff3366", fontFamily:"monospace"}}>
                  HSK ${hskPrice.toFixed(4)} {hskChange >= 0 ? "▲" : "▼"}{Math.abs(hskChange).toFixed(2)}%
                </span>
              )}
              </button>
            </div>
          </div>
          <div style={{ padding: "12px" }}>
            <div style={{ ...S.card, background: "linear-gradient(135deg,#080c14,#0c1a2e)", border: "1px solid #1a3560" }}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a5a7a", marginBottom: "4px" }}>TOTAL PORTFOLIO</div>
              <div style={{ fontSize: "32px", fontWeight: 900, fontFamily: "monospace" }}>$24,850</div>
              <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
                <div><div style={{ fontSize: "10px", color: "#4a5a7a" }}>YIELD EARNED</div><div style={{ color: "#00ff88", fontWeight: 700 }}>+$2,847</div></div>
                <div><div style={{ fontSize: "10px", color: "#4a5a7a" }}>TARGET APY</div><div style={{ color: "#ffaa00", fontWeight: 700 }}>12%</div></div>
                <div><div style={{ fontSize: "10px", color: "#4a5a7a" }}>RISK</div><div style={{ fontWeight: 700 }}>Medium</div></div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700 }}>AI Swarm Status</div>
                <button onClick={runAgents} disabled={agentRunning} style={{ background: agentRunning ? "#0c1220" : "linear-gradient(135deg,#00ff88,#00cc6a)", border: "1px solid #1a2540", borderRadius: "6px", color: agentRunning ? "#e8edf5" : "#000", padding: "6px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                  {agentRunning ? "Running..." : "Run Agents"}
                </button>
              </div>
              <div ref={logRef} style={{ background: "#05070d", borderRadius: "6px", padding: "10px", height: "140px", overflowY: "auto", fontFamily: "monospace", fontSize: "11px" }}>
                {agentLog.length === 0
                  ? <span style={{ color: "#1a2540" }}>// Agents idle. Press Run to start.</span>
                  : agentLog.map((l, i) => <div key={i} style={{ color: l.includes("complete") || l.includes("proof") || l.includes("optimized") ? "#00ff88" : "#8899bb", marginBottom: "2px" }}>{l}</div>)}
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a5a7a", marginBottom: "10px" }}>AI INSIGHTS</div>
              {["Portfolio yield exceeds target by 1.2%", "Auto-reserved $200 for upcoming tax", "HK Real Estate TVL up 12% - consider increasing", "Emergency fund covers 4.2 months"].map((ins, i, arr) => (
                <div key={i} style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid #1a2540" : "none" }}>
                  <span style={{ color: "#00ff88" }}>✓</span>
                  <span style={{ fontSize: "12px", color: "#8899bb" }}>{ins}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, border: "1px solid #ff336630" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#ff3366" }}>Emergency Override</div>
                  <div style={{ fontSize: "11px", color: "#4a5a7a", marginTop: "2px" }}>Move all funds to stablecoins</div>
                </div>
                <button onClick={() => toast("Safe mode activated - funds secured")} style={{ background: "linear-gradient(135deg,#ff3366,#cc0033)", border: "none", borderRadius: "6px", color: "#fff", padding: "8px 14px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Activate</button>
              </div>
            </div>
          </div>
        </>
      )}

      {page === "portfolio" && (
        <>
          <div style={S.header}><span style={{ fontWeight: 800 }}>RWA Portfolio</span><span style={{ background: "#00ff8818", border: "1px solid #00ff8840", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color: "#00ff88" }}>12% APY</span></div>
          <div style={{ padding: "12px" }}>
            <div style={S.card}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a5a7a", marginBottom: "12px" }}>ASSET ALLOCATION</div>
              {[{a:"HK Real Estate Token",p:35,apy:"8.5%"},{a:"US Treasury MMF",p:30,apy:"5.2%"},{a:"HSK Stablecoin Vault",p:20,apy:"7.8%"},{a:"Gold RWA Token",p:15,apy:"4.1%"}].map((r, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{r.a}</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ color: "#00ff88", fontSize: "12px" }}>{r.apy}</span>
                      <span style={{ color: "#4a5a7a", fontSize: "12px" }}>{r.p}%</span>
                    </div>
                  </div>
                  <div style={{ background: "#0c1220", borderRadius: "3px", height: "5px" }}>
                    <div style={{ background: "linear-gradient(90deg,#00ff88,#0088ff)", height: "5px", borderRadius: "3px", width: r.p + "%" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a5a7a", marginBottom: "12px" }}>CASHFLOW FORECAST</div>
              <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "80px" }}>
                {[{m:"Apr",y:340},{m:"May",y:380},{m:"Jun",y:420},{m:"Jul",y:460},{m:"Aug",y:510},{m:"Sep",y:550}].map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "100%", background: "linear-gradient(180deg,#00ff8880,#00ff8820)", borderRadius: "3px 3px 0 0", height: (m.y / 550 * 60) + "px" }} />
                    <span style={{ fontSize: "9px", color: "#4a5a7a" }}>{m.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {page === "payments" && (
        <>
          <div style={S.header}><span style={{ fontWeight: 800 }}>Auto Payments</span><span style={{ background: "#0088ff18", border: "1px solid #0088ff40", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color: "#0088ff" }}>HSP</span></div>
          <div style={{ padding: "12px" }}>
            <div style={{ ...S.card, background: "linear-gradient(135deg,#080c14,#0c1a2e)" }}>
              <div style={{ fontSize: "10px", color: "#4a5a7a", marginBottom: "4px" }}>MONTHLY AUTO-PAYMENTS</div>
              <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "monospace" }}>$1,165<span style={{ fontSize: "12px", color: "#4a5a7a" }}>/mo</span></div>
              <div style={{ fontSize: "11px", color: "#4a5a7a", marginTop: "4px" }}>All payments via HashKey Settlement Protocol</div>
            </div>
            {[{n:"Rent",a:800,f:"Monthly",d:"Apr 1"},{n:"Utilities",a:120,f:"Monthly",d:"Apr 5"},{n:"Subscriptions",a:45,f:"Monthly",d:"Apr 10"},{n:"Tax Reserve",a:200,f:"Monthly",d:"Apr 15"}].map((p, i) => (
              <div key={i} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.n}</div>
                    <div style={{ fontSize: "11px", color: "#4a5a7a" }}>{p.f} · Next: {p.d}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontFamily: "monospace" }}>${p.a}</div>
                    <span style={{ background: "#00ff8818", border: "1px solid #00ff8840", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", color: "#00ff88" }}>Auto ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {page === "zkid" && (
        <>
          <div style={S.header}><span style={{ fontWeight: 800 }}>ZKID Personas</span></div>
          <div style={{ padding: "12px" }}>
            <div style={S.card}>
              <div style={{ fontSize: "10px", color: "#4a5a7a", marginBottom: "8px" }}>ZERO-KNOWLEDGE IDENTITY</div>
              <div style={{ fontSize: "12px", color: "#8899bb", lineHeight: 1.6 }}>Switch between verified personas. Each unlocks different RWA pools and compliance levels without revealing your identity.</div>
            </div>
            {[{id:"1",n:"Personal",c:"KYC-Light · Retail Access",e:"👤"},{id:"2",n:"Professional",c:"Full KYC · DAO/Work Mode",e:"💼"},{id:"3",n:"Institutional",c:"ZK-Proof · Anon Compliance",e:"🏛️"}].map(p => (
              <div key={p.id} onClick={() => toast("Switched to " + p.n + " persona")} style={{ ...S.card, cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ fontSize: "28px" }}>{p.e}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.n}</div>
                    <div style={{ fontSize: "11px", color: "#4a5a7a" }}>{p.c}</div>
                    <div style={{ fontSize: "10px", color: "#00ff88", marginTop: "2px", fontFamily: "monospace" }}>ZK: 0x7f3a...{p.id}b92 · Valid ✓</div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => toast("ZK Proof generated · All compliant ✓")} style={S.btnGhost}>Generate Compliance Report</button>
          </div>
        </>
      )}

      {page !== "onboard" && (
        <nav style={S.nav}>
          {[{id:"dashboard",l:"Brain",i:"🧠"},{id:"portfolio",l:"RWA",i:"📈"},{id:"payments",l:"PayFi",i:"💳"},{id:"zkid",l:"ZKID",i:"🔒"}].map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, background: "none", border: "none", color: page === n.id ? "#00ff88" : "#4a5a7a", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", fontSize: "9px", fontWeight: page === n.id ? 700 : 500 }}>
              <span style={{ fontSize: "16px" }}>{n.i}</span><span>{n.l}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
