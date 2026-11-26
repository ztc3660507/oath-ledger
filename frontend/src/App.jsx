import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Coins,
  ExternalLink,
  FileCode2,
  Lock,
  RefreshCw,
  Scale,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import deployment from "./deployment.json";

const INITIAL_PACTS = [
  {
    id: 1,
    title: "Zero-Knowledge Merkle Proof Verifier Package",
    sponsor: "g1tavern...sponsor01",
    builder: "g1craft...builder07",
    totalGnot: 120,
    releasedGnot: 48,
    quorum: "2 / 3",
    status: "Active",
    milestones: [
      { id: 1, name: "M1: Spec & Pure Package Math", pct: 40, status: "Paid", votes: "2/2" },
      { id: 2, name: "M2: Realm Verifier & Gas Bench", pct: 35, status: "Submitted", votes: "1/2" },
      { id: 3, name: "M3: Security Audit & gnoweb Docs", pct: 25, status: "Pending", votes: "0/2" },
    ],
  },
  {
    id: 2,
    title: "IBC Relay Health & Alerting Indexer Realm",
    sponsor: "g1core...grantdao",
    builder: "g1forge...dev19",
    totalGnot: 85,
    releasedGnot: 85,
    quorum: "2 / 2",
    status: "Completed",
    milestones: [
      { id: 1, name: "M1: State Schema & AVL Indexes", pct: 50, status: "Paid", votes: "2/2" },
      { id: 2, name: "M2: Render Views & txlink Actions", pct: 50, status: "Paid", votes: "2/2" },
    ],
  },
  {
    id: 3,
    title: "Multi-Asset DAO Payroll Splitter (GRC20 + GNOT)",
    sponsor: "g1guild...treasury",
    builder: "Open to Claim",
    totalGnot: 60,
    releasedGnot: 0,
    quorum: "2 / 3",
    status: "Open",
    milestones: [
      { id: 1, name: "M1: Pure Split Calculator", pct: 40, status: "Pending", votes: "0/2" },
      { id: 2, name: "M2: Banker Execution + Tests", pct: 60, status: "Pending", votes: "0/2" },
    ],
  },
];

const INITIAL_LEADERS = [
  { addr: "g1forge...dev19", tier: "Master", xp: 1420, earned: 185, milestones: 6 },
  { addr: "g1craft...builder07", tier: "Craftsman", xp: 890, earned: 98, milestones: 4 },
  { addr: "g1spark...auditor4", tier: "Apprentice", xp: 410, earned: 45, milestones: 2 },
];

export default function App() {
  const [pacts, setPacts] = useState(INITIAL_PACTS);
  const [leaders, setLeaders] = useState(INITIAL_LEADERS);
  const [blockHeight, setBlockHeight] = useState("...");
  const [liveRender, setLiveRender] = useState("");
  const [renderRoute, setRenderRoute] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function syncOnyx() {
    setSyncing(true);
    try {
      const res = await fetch(`${deployment.rpcUrl}/status`);
      const json = await res.json();
      const h = json?.result?.sync_info?.latest_block_height;
      if (h) setBlockHeight(Number(h).toLocaleString());

      if (deployment.realmPath) {
        const q = `${deployment.realmPath}:${renderRoute}`;
        const hexData =
          "0x" +
          Array.from(new TextEncoder().encode(q))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        const abci = await fetch(
          `${deployment.rpcUrl}/abci_query?path="vm/qrender"&data=${hexData}`
        );
        const abciJson = await abci.json();
        const b64 = abciJson?.result?.response?.ResponseBase?.Data;
        if (b64) {
          setLiveRender(atob(b64));
        }
      }
    } catch (_) {
      // fallback preview remains active offline
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    syncOnyx();
  }, [renderRoute]);

  function approveNextVote(pactId, msId) {
    setPacts((prev) =>
      prev.map((p) => {
        if (p.id !== pactId) return p;
        let releasedDelta = 0;
        const milestones = p.milestones.map((m) => {
          if (m.id !== msId || m.status === "Paid") return m;
          releasedDelta = Math.round((p.totalGnot * m.pct) / 100);
          return { ...m, status: "Paid", votes: "2/2" };
        });
        const newReleased = Math.min(p.totalGnot, p.releasedGnot + releasedDelta);
        const allPaid = milestones.every((m) => m.status === "Paid");
        return {
          ...p,
          releasedGnot: newReleased,
          status: allPaid ? "Completed" : "Active",
          milestones,
        };
      })
    );
    setLeaders((prev) =>
      prev.map((l, idx) =>
        idx === 1 ? { ...l, xp: l.xp + 350, earned: l.earned + 42, milestones: l.milestones + 1, tier: "Master" } : l
      )
    );
  }

  const totalEscrowed = pacts.reduce((a, p) => a + p.totalGnot, 0);
  const totalReleased = pacts.reduce((a, p) => a + p.releasedGnot, 0);
  const lockedNow = totalEscrowed - totalReleased;

  const fallbackMarkdown = `# OathLedger — Trustless Milestone Escrow & PoC Board

> Native Gno.land Realm (\`chain/banker\` + \`p/nt/avl/v0\` + \`p/moul/txlink\`)
> Chain: \`${deployment.chainId}\` · Latest Block: #${blockHeight}

## Protocol Telemetry
- **Total Pacts Created**: ${pacts.length}
- **Active Escrow Locked**: ${lockedNow} GNOT (${lockedNow * 1_000_000} ugnot)
- **Cumulative Paid Out**: ${totalReleased} GNOT
- **Dispute Rate**: 0.0%

## Active & Completed Pacts
| ID | Title | Locked / Total | Quorum | Status |
|---|---|---|---|---|
${pacts.map((p) => `| #${p.id} | ${p.title} | ${p.releasedGnot}/${p.totalGnot} GNOT | ${p.quorum} | **${p.status}** |`).join("\n")}

## Quick On-Chain Actions (txlink)
- [Create New Escrow Pact](${deployment.gnowebBase}${deployment.realmPath ? "/" + deployment.realmPath.replace("gno.land/", "") : "/r/oathledger"})
- [View Builder PoC Leaderboard](/r/oathledger:leaderboard)`;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Scale size={22} color="#090b10" />
          </div>
          <div>
            <h1>OathLedger</h1>
            <p>Trustless Milestone Escrow, M-of-N Reviewer Quorum &amp; Proof-of-Contribution on Gno.land</p>
          </div>
        </div>
        <div className="pills">
          <span className="pill mono">
            <span className="dot" /> {deployment.chainId} · Block #{blockHeight}
          </span>
          <button className="btn" onClick={syncOnyx} disabled={syncing}>
            <RefreshCw size={14} /> Sync RPC
          </button>
          {deployment.realmPath && (
            <a
              className="btn btn-gold"
              href={`${deployment.gnowebBase}/${deployment.realmPath.replace("gno.land/", "")}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on gnoweb <ExternalLink size={14} />
            </a>
          )}
        </div>
      </header>

      <section className="kpis">
        <div className="card">
          <div className="kpi-top">
            <span>Escrow Locked (Banker)</span>
            <Lock size={15} color="#f59e0b" />
          </div>
          <div className="kpi-val mono" style={{ color: "#fbbf24" }}>
            {lockedNow} GNOT
          </div>
          <div className="kpi-sub mono">{(lockedNow * 1_000_000).toLocaleString()} ugnot custody</div>
        </div>
        <div className="card">
          <div className="kpi-top">
            <span>Atomic Payouts Released</span>
            <Coins size={15} color="#10b981" />
          </div>
          <div className="kpi-val mono" style={{ color: "#34d399" }}>
            {totalReleased} GNOT
          </div>
          <div className="kpi-sub">Direct realm → builder settlement</div>
        </div>
        <div className="card">
          <div className="kpi-top">
            <span>M-of-N Quorum Security</span>
            <ShieldCheck size={15} color="#38bdf8" />
          </div>
          <div className="kpi-val mono">100% On-Chain</div>
          <div className="kpi-sub">Deterministic Go · Zero off-chain servers</div>
        </div>
        <div className="card">
          <div className="kpi-top">
            <span>PoC Reputation Builders</span>
            <Award size={15} color="#a78bfa" />
          </div>
          <div className="kpi-val mono">{leaders.length} Verified</div>
          <div className="kpi-sub">Immutable on-chain work resume</div>
        </div>
      </section>

      <section className="grid-main">
        <div className="card">
          <div className="sec-head">
            <h2>
              <FileCode2 size={16} color="#f59e0b" />
              Active Escrow Pacts &amp; Milestone Quorum Releases
            </h2>
            <span className="badge b-gold">Interactive Quorum Demo</span>
          </div>

          <div className="pact-list">
            {pacts.map((p) => {
              const pct = Math.round((p.releasedGnot / p.totalGnot) * 100);
              return (
                <div className="pact" key={p.id}>
                  <div className="pact-head">
                    <div>
                      <h3>
                        #{p.id} · {p.title}
                      </h3>
                      <div className="pact-sub mono">
                        Sponsor: {p.sponsor} · Builder: {p.builder} · Quorum: {p.quorum}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        p.status === "Completed"
                          ? "b-emerald"
                          : p.status === "Active"
                          ? "b-sky"
                          : "b-gold"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="bar-wrap">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div
                    className="mono"
                    style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}
                  >
                    <span>
                      Released: {p.releasedGnot} / {p.totalGnot} GNOT ({pct}%)
                    </span>
                    <span>Native chain/banker escrow</span>
                  </div>

                  <div className="ms-grid">
                    {p.milestones.map((m) => (
                      <div className="ms-chip" key={m.id}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.name}</div>
                        <div
                          className="mono"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: m.status === "Paid" ? "#34d399" : "#94a3b8",
                            marginBottom: 6,
                          }}
                        >
                          <span>{m.pct}% split</span>
                          <span>
                            {m.status} ({m.votes})
                          </span>
                        </div>
                        {m.status === "Submitted" && (
                          <button
                            className="btn btn-emerald"
                            style={{ width: "100%", justifyContent: "center", padding: "5px 8px", fontSize: 11 }}
                            onClick={() => approveNextVote(p.id, m.id)}
                          >
                            <CheckCircle2 size={12} /> Cast Final Quorum Vote
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="sec-head">
              <h2>
                <Users size={16} color="#a78bfa" />
                Proof-of-Contribution Leaderboard
              </h2>
              <span className="badge b-violet">AVL Indexed</span>
            </div>
            {leaders.map((l, idx) => (
              <div className="lb-item" key={idx}>
                <div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                    #{idx + 1} {l.addr}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#7c8aa5", marginTop: 2 }}>
                    {l.milestones} verified milestones · {l.xp} PoC XP
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${l.tier === "Master" ? "b-emerald" : "b-sky"}`}>{l.tier}</span>
                  <div className="mono" style={{ fontSize: 12, color: "#fbbf24", marginTop: 4 }}>
                    {l.earned} GNOT
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-head">
              <h2>
                <Terminal size={16} color="#34d399" />
                Live Realm Render(path) Output
              </h2>
              <span className="badge b-emerald">vm/qrender</span>
            </div>
            <div className="gnoweb-box">{liveRender || fallbackMarkdown}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
