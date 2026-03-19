import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { CoinService, Coin } from "../services";

export default function CoinManagement() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [newCoin, setNewCoin] = useState({ symbol: "", name: "", icon: "", coingecko_id: "" });

    useEffect(() => { fetchCoins(); }, []);

    const fetchCoins = async () => {
        try {
            setLoading(true);
            const data = await CoinService.getAll();
            if (data.success) setCoins(data.data || []);
        } catch {
            setError("Failed to load coins");
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (coin: Coin) => {
        try {
            await CoinService.update(coin._id, { is_active: !coin.is_active });
            setCoins((prev) => prev.map((c) => c._id === coin._id ? { ...c, is_active: !c.is_active } : c));
            setSuccess(`${coin.symbol} ${!coin.is_active ? "activated" : "deactivated"}`);
            setTimeout(() => setSuccess(""), 2000);
        } catch {
            setError("Failed to update coin");
        }
    };

    const removeCoin = async (coin: Coin) => {
        if (!window.confirm(`Remove ${coin.symbol} (${coin.name})? This cannot be undone.`)) return;
        try {
            await CoinService.delete(coin._id);
            setCoins((prev) => prev.filter((c) => c._id !== coin._id));
            setSuccess(`${coin.symbol} removed`);
            setTimeout(() => setSuccess(""), 2000);
        } catch {
            setError("Failed to remove coin");
        }
    };

    const handleAddCoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const data = await CoinService.create(newCoin);
            if (data.success) {
                setCoins((prev) => [...prev, data.data].sort((a, b) => a.symbol.localeCompare(b.symbol)));
                setNewCoin({ symbol: "", name: "", icon: "", coingecko_id: "" });
                setShowAdd(false);
                setSuccess(`${data.data.symbol} added successfully`);
                setTimeout(() => setSuccess(""), 2000);
            } else {
                setError(data.message || "Failed to add coin");
            }
        } catch (error: any) {
            setError(error.message || "Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const activeCount = coins.filter((c) => c.is_active).length;

    return (
        <>
            <PageMeta title="Coin Management | Admin" description="Manage coins shown in matches" />
            <PageBreadcrumb pageTitle="Coin Management" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Coin Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activeCount} active · {coins.length} total
                            <span className="ml-2 text-xs text-gray-400">Active coins appear in match selection</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Coin
                    </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>}

                {/* Info box */}
                <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs text-blue-700 dark:text-blue-400">
                    🎮 <strong>Match logic:</strong> Users select 5–10 active coins and allocate their $1,000 virtual balance.
                    Score = sum of % price change × allocation weight. Highest total score wins.
                    Only <strong>active</strong> coins appear in the match lobby.
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading coins...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {coins.map((coin) => (
                            <div
                                key={coin._id}
                                className={`relative rounded-xl border p-4 transition-all ${coin.is_active
                                    ? "border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                                    : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 opacity-60"
                                    }`}
                            >
                                {/* Active indicator */}
                                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${coin.is_active ? "bg-green-500" : "bg-gray-400"}`} />

                                {/* Coin info */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700">
                                        {coin.icon?.length <= 4 ? coin.icon : coin.symbol.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{coin.symbol}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{coin.name}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mb-3 font-mono truncate">{coin.coingecko_id}</p>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleActive(coin)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${coin.is_active
                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                            }`}
                                    >
                                        {coin.is_active ? "Deactivate" : "Activate"}
                                    </button>
                                    <button
                                        onClick={() => removeCoin(coin)}
                                        className="px-2 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Coin Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add New Coin</h3>
                            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        <form onSubmit={handleAddCoin} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Symbol *</label>
                                    <input
                                        type="text"
                                        value={newCoin.symbol}
                                        onChange={(e) => setNewCoin({ ...newCoin, symbol: e.target.value.toUpperCase() })}
                                        placeholder="e.g. BTC"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icon</label>
                                    <input
                                        type="text"
                                        value={newCoin.icon}
                                        onChange={(e) => setNewCoin({ ...newCoin, icon: e.target.value })}
                                        placeholder="e.g. ₿"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={newCoin.name}
                                    onChange={(e) => setNewCoin({ ...newCoin, name: e.target.value })}
                                    placeholder="e.g. Bitcoin"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    CoinGecko ID *
                                    <span className="ml-1 text-gray-400">(from coingecko.com/en/coins/…)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCoin.coingecko_id}
                                    onChange={(e) => setNewCoin({ ...newCoin, coingecko_id: e.target.value.toLowerCase() })}
                                    placeholder="e.g. bitcoin"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 disabled:opacity-50">
                                    {submitting ? "Adding..." : "Add Coin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
