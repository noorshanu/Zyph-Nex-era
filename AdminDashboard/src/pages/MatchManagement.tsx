import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { MatchService, Match } from "../services";

interface Participant {
    _id: string;
    firstName?: string;
    lastName?: string;
    wallet_address?: string;
    email?: string;
    skill_rating?: number;
    createdAt?: string;
    selected_tokens?: string[];
}

interface RankingEntry {
    rank: number;
    username: string;
    wallet_address?: string;
    pnl_percentage: number;
    pnl?: number;
    reward: number;
    is_winner: boolean;
    selected_tokens?: string[];
}

export default function MatchManagement() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMatch, setNewMatch] = useState<any>({
        title: "",
        type: "paid" as "free" | "paid",
        entry_fee: 5,
        prize_pool: 100,
        virtual_balance: 1000,
        join_window_minutes: 30,
        match_duration_minutes: 4,
        max_participants: 50,
        start_time: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // View modal
    const [viewMatch, setViewMatch] = useState<Match | null>(null);
    const [viewTab, setViewTab] = useState<"participants" | "leaderboard">("participants");
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [leaderboard, setLeaderboard] = useState<RankingEntry[]>([]);
    const [leaderboardFinal, setLeaderboardFinal] = useState(false);
    const [loadingView, setLoadingView] = useState(false);
    const [viewError, setViewError] = useState("");

    useEffect(() => { fetchMatches(); }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const data = await MatchService.getAll();
            if (data.success) {
                setMatches(data.data || []);
            } else {
                setError(data.message || "Failed to fetch matches");
            }
        } catch (err: any) {
            setError(err.message || "Network error - could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const payload = { ...newMatch };
            // Ensure IST parsing if no timezone is provided
            if (payload.start_time && !payload.start_time.includes('+') && !payload.start_time.endsWith('Z')) {
                payload.start_time = `${payload.start_time}+05:30`;
            }
            const data = await MatchService.create(payload);
            if (data.success) {
                setShowCreateModal(false);
                setNewMatch({ title: "", type: "paid", entry_fee: 5, prize_pool: 100, virtual_balance: 1000, join_window_minutes: 30, match_duration_minutes: 4, max_participants: 50, start_time: "" });
                fetchMatches();
            } else {
                setError(data.message || "Failed to create match");
            }
        } catch (err: any) {
            setError(err.message || "Network error - could not connect to server");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMatch = async (matchId: string) => {
        if (!window.confirm("Are you sure you want to delete this match?")) return;
        try {
            const data = await MatchService.delete(matchId);
            if (data.success) {
                setMatches(matches.filter(m => m._id !== matchId));
            } else {
                alert(data.message || "Failed to delete match");
            }
        } catch (err: any) {
            alert(err.message || "Network error - could not connect to server");
        }
    };

    const handleViewMatch = async (match: Match) => {
        setViewMatch(match);
        setViewTab("participants");
        setLoadingView(true);
        setViewError("");
        setParticipants([]);
        setLeaderboard([]);
        try {
            const [partData, lbData] = await Promise.all([
                MatchService.getParticipants(match._id),
                MatchService.getLeaderboard(match._id),
            ]);

            if (partData.success) {
                const rawParticipants: Participant[] = partData.data?.participants || [];
                setParticipants(rawParticipants); // will be enriched after lb loads
            } else {
                setViewError(partData.message || "Failed to load participants");
            }

            if (lbData.success) {
                const rankings: RankingEntry[] = lbData.data?.rankings || [];
                setLeaderboard(rankings);
                setLeaderboardFinal(lbData.data?.is_final ?? false);

                // Enrich participants with selected_tokens from leaderboard rankings
                setParticipants((prev) =>
                    prev.map((p) => {
                        if (!p.wallet_address) return p;
                        const match = rankings.find(
                            (r) => r.wallet_address?.toLowerCase() === p.wallet_address?.toLowerCase()
                        );
                        return match ? { ...p, selected_tokens: match.selected_tokens } : p;
                    })
                );
            }
        } catch {
            setViewError("Network error — could not load match data");
        } finally {
            setLoadingView(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
            case "live": return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
            case "scheduled":
            case "upcoming": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
            case "completed":
            case "settled": return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    };

    const shortAddress = (addr?: string) => {
        if (!addr) return "—";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <>
            <PageMeta title="Match Management | Admin" description="Create and manage matches" />
            <PageBreadcrumb pageTitle="Match Management" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">All Matches</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{matches.length} total matches</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Match
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading matches...</div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No matches found. Create your first match!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Fee</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize Pool</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timing</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {matches.map((match) => (
                                    <tr key={match._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="font-medium text-gray-800 dark:text-white">{match.title}</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${match.type === "paid" ? "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400" : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"}`}>
                                                {match.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {match.entry_fee === 0 ? "Free" : `$${match.entry_fee}`}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">${match.prize_pool}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {match.current_participants || 0}/{match.max_participants}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="text-xs text-gray-500">Join: {match.join_window_minutes || match.duration || 30}m</p>
                                            <p className="text-xs text-gray-500">Match: {match.match_duration_minutes || 4}m</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                                                {match.status === "live" && <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500 animate-pulse" />}
                                                {match.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {formatDateTime(match.start_time)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleViewMatch(match)}
                                                    className="text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMatch(match._id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Match Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create New Match</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateMatch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Match Title</label>
                                <input
                                    type="text"
                                    value={newMatch.title}
                                    onChange={(e) => setNewMatch({ ...newMatch, title: e.target.value })}
                                    placeholder="e.g., Crypto Classic"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={newMatch.type}
                                        onChange={(e) => {
                                            const t = e.target.value as "free" | "paid";
                                            setNewMatch({ ...newMatch, type: t, entry_fee: t === "free" ? 0 : newMatch.entry_fee });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        required
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="free">Free</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Players</label>
                                    <input
                                        type="number"
                                        value={newMatch.max_participants}
                                        onChange={(e) => setNewMatch({ ...newMatch, max_participants: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        min={2}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Timing Section */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wide">⏱ Match Timing</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Join Window (min)
                                            <span className="ml-1 text-xs text-gray-400">— how long users can join</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={newMatch.join_window_minutes}
                                            onChange={(e) => setNewMatch({ ...newMatch, join_window_minutes: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Match Duration (min)
                                            <span className="ml-1 text-xs text-gray-400">— trading time</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={newMatch.match_duration_minutes}
                                            onChange={(e) => setNewMatch({ ...newMatch, match_duration_minutes: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            min={1}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {newMatch.type === "paid" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Fee ($)</label>
                                        <input
                                            type="number"
                                            value={newMatch.entry_fee}
                                            onChange={(e) => setNewMatch({ ...newMatch, entry_fee: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            min={1}
                                            required
                                        />
                                    </div>
                                )}
                                <div className={newMatch.type === "free" ? "col-span-2" : ""}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prize Pool ($)</label>
                                    <input
                                        type="number"
                                        value={newMatch.prize_pool}
                                        onChange={(e) => setNewMatch({ ...newMatch, prize_pool: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        min={0}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time (Join Window Opens)</label>
                                <input
                                    type="datetime-local"
                                    value={newMatch.start_time}
                                    onChange={(e) => setNewMatch({ ...newMatch, start_time: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Create Match"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Match Modal */}
            {viewMatch && (
                <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{viewMatch.title}</h3>
                                <p className="text-sm text-gray-500">{viewMatch.current_participants}/{viewMatch.max_participants} players · {viewMatch.status}</p>
                            </div>
                            <button onClick={() => setViewMatch(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <button
                                onClick={() => setViewTab("participants")}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${viewTab === "participants" ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                            >
                                All Participants ({participants.length})
                            </button>
                            <button
                                onClick={() => setViewTab("leaderboard")}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${viewTab === "leaderboard" ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                            >
                                🏆 Top Performers ({leaderboard.length})
                                {!leaderboardFinal && leaderboard.length > 0 && (
                                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-500/10 text-red-500">
                                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                        LIVE
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className="overflow-y-auto flex-1 p-4">
                            {viewError && (
                                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                    {viewError}
                                </div>
                            )}
                            {loadingView ? (
                                <div className="text-center py-10 text-gray-500">Loading...</div>
                            ) : viewTab === "participants" ? (
                                participants.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        <p>No participants have joined yet</p>
                                        <p className="text-sm mt-1 text-gray-300">Participants appear once users join and confirm a token portfolio</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selected Tokens</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {participants.map((p, i) => (
                                                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-3 py-3 text-sm text-gray-500">{i + 1}</td>
                                                    <td className="px-3 py-3">
                                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{p.firstName} {p.lastName}</p>
                                                        <p className="text-xs text-gray-400">{p.email}</p>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                                            {p.wallet_address ? shortAddress(p.wallet_address) : "—"}
                                                        </span>
                                                        {p.wallet_address && (
                                                            <button
                                                                className="ml-2 text-xs text-blue-500 hover:underline"
                                                                onClick={() => navigator.clipboard.writeText(p.wallet_address || "")}
                                                            >
                                                                copy
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {p.selected_tokens && p.selected_tokens.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {p.selected_tokens.map((t) => (
                                                                    <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Not selected</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{p.skill_rating || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                leaderboard.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        <p>No rankings yet</p>
                                        <p className="text-sm mt-1">Rankings appear once the match goes live and users lock their token portfolios</p>
                                    </div>
                                ) : (
                                    <>
                                        {!leaderboardFinal && (
                                            <div className="mb-3 flex items-center gap-2 text-xs text-red-500 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                Live ranking — updates as token prices change. Final rewards calculated on match end.
                                            </div>
                                        )}
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Token Combo</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PnL %</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {leaderboard.map((entry) => (
                                                    <tr key={entry.rank} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${entry.is_winner ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}>
                                                        <td className="px-3 py-3">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${entry.rank === 1 ? "bg-yellow-400 text-black" : entry.rank === 2 ? "bg-gray-300 text-black" : entry.rank === 3 ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                                                                {entry.rank}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm font-medium text-gray-800 dark:text-white">{entry.username}</td>
                                                        <td className="px-3 py-3">
                                                            <span className="font-mono text-xs text-gray-500">{shortAddress(entry.wallet_address)}</span>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {entry.selected_tokens && entry.selected_tokens.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {entry.selected_tokens.map((t) => (
                                                                        <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : <span className="text-xs text-gray-400">—</span>}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm font-semibold">
                                                            <span className={entry.pnl_percentage >= 0 ? "text-green-600" : "text-red-500"}>
                                                                {entry.pnl_percentage > 0 ? "+" : ""}{entry.pnl_percentage?.toFixed(2)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm font-bold text-yellow-600">
                                                            {leaderboardFinal ? `$${entry.reward}` : "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
