import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { MatchService, MatchHistoryEntry } from "../services";

const shortAddr = (addr?: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

export default function MatchHistoryAdmin() {
    const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                const data = await MatchService.getHistory(page, 15);
                if (cancelled) return;
                if (data.success) {
                    setHistory(data.data || []);
                    setTotalPages(data.pagination?.pages || 1);
                } else {
                    setError(data.message || "Failed to fetch match history");
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || "Network error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [page]);

    const fmt = (d: string) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";
    const duration = (start: string, end: string) => {
        if (!start || !end) return "—";
        const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
        return diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
    };

    return (
        <>
            <PageMeta title="Match History | Admin" description="All completed matches" />
            <PageBreadcrumb pageTitle="Match History" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Match History</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">All completed &amp; settled matches</p>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">←</button>
                            <span>Page {page} / {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">→</button>
                        </div>
                    )}
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-3">🏛️</p>
                        <p className="font-medium">No completed matches yet</p>
                        <p className="text-sm mt-1">Matches appear here once they are completed or settled</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((m) => (
                            <div key={m._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                {/* Row summary */}
                                <button
                                    onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                                    className="w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-center">
                                        {/* Match name */}
                                        <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{m.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${m.type === "paid" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>{m.type}</span>
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${m.status === "settled" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}>{m.status}</span>
                                            </div>
                                        </div>
                                        {/* Players */}
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-0.5">Players</p>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{m.total_participants}/{m.max_participants}</p>
                                        </div>
                                        {/* Prize pool */}
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-0.5">Prize Pool</p>
                                            <p className="text-sm font-bold text-green-600">${m.prize_pool}</p>
                                        </div>
                                        {/* Duration */}
                                        <div className="text-center hidden lg:block">
                                            <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{duration(m.start_time, m.end_time)}</p>
                                        </div>
                                        {/* Winner */}
                                        <div className="text-center hidden sm:block">
                                            <p className="text-xs text-gray-500 mb-0.5">🏆 Winner</p>
                                            {m.winner ? (
                                                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 truncate">{m.winner.username}</p>
                                            ) : (
                                                <p className="text-sm text-gray-400">—</p>
                                            )}
                                        </div>
                                        {/* Date */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">{fmt(m.end_time || m.start_time)}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{expandedId === m._id ? "▲ collapse" : "▼ details"}</p>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded detail */}
                                {expandedId === m._id && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 px-4 py-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Entry Fee</p>
                                                <p className="font-semibold text-gray-800 dark:text-white">{m.entry_fee === 0 ? "Free" : `$${m.entry_fee}`}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Distributed</p>
                                                <p className="font-semibold text-yellow-600">${m.total_prize_distributed.toFixed(2)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Started</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-200">{fmt(m.start_time)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ended</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-200">{fmt(m.end_time)}</p>
                                            </div>
                                        </div>
                                        {m.winner && (
                                            <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">1</div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800 dark:text-white">{m.winner.username}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{shortAddr(m.winner.wallet_address)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-600">+{m.winner.pnl_percentage?.toFixed(2)}%</p>
                                                    <p className="text-sm font-bold text-yellow-600">${m.winner.reward}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
