import React from "react";
import Navbar from "../components/Navbar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { API_BASE } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";
import { useToast } from "../components/ToastProvider.jsx";

const demoCatalog = [
    {
        id: "existentialism-humanism",
        title: "Existentialism Is a Humanism",
        author: "Jean-Paul Sartre",
        price: 149,
        description: "Sartre's accessible summary of existentialist freedom and responsibility.",
    },
    {
        id: "aristotle-for-everybody",
        title: "Aristotle for Everybody",
        author: "Mortimer J. Adler",
        price: 135,
        description: "A lively tour through Aristotle's essential ideas for modern readers.",
    },
    {
        id: "stoicism-vsi",
        title: "Stoicism: A Very Short Introduction",
        author: "Brad Inwood",
        price: 119,
        description: "Compact guide to Stoic philosophy from its origins to lasting legacy.",
    },
    {
        id: "elements-moral-philosophy",
        title: "The Elements of Moral Philosophy",
        author: "James Rachels",
        price: 142,
        description: "Clear overview of ethical theories with memorable thought experiments.",
    },
    {
        id: "irrational-man",
        title: "Irrational Man",
        author: "William Barrett",
        price: 156,
        description: "An exploration of existentialism's roots in art, philosophy, and culture.",
    },
    {
        id: "eros-and-civilization",
        title: "Eros and Civilization",
        author: "Herbert Marcuse",
        price: 168,
        description: "Marcuse blends Freud and Marx to imagine a liberated future society.",
    },
    {
        id: "passion-essay-personality",
        title: "Passion: An Essay on Personality",
        author: "Roberto Mangabeira Unger",
        price: 174,
        description: "A bold argument for reinventing social life around individual empowerment.",
    },
];

const PAYMENT_ENDPOINT = `${API_BASE}/payments/checkout`;

export default function Buy() {
    const token = React.useMemo(
        () => localStorage.getItem("token") || sessionStorage.getItem("token"),
        []
    );
    const { notify } = useToast();
    const [basket, setBasket] = React.useState(() => Object.create(null));
    const [notes, setNotes] = React.useState("");
    const [processing, setProcessing] = React.useState(false);
    const [status, setStatus] = React.useState("");
    const [error, setError] = React.useState("");

    const selectedItems = React.useMemo(() => (
        demoCatalog
            .filter((item) => basket[item.id])
            .map((item) => ({
                ...item,
                quantity: basket[item.id],
            }))
    ), [basket]);

    const subtotal = React.useMemo(() => (
        selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    ), [selectedItems]);

    const fees = React.useMemo(() => (
        selectedItems.length === 0 ? 0 : Math.max(subtotal * 0.05, 7.5)
    ), [selectedItems.length, subtotal]);

    const totalDue = subtotal + fees;

    const formatAmount = React.useCallback(
        (value) => `${Number(value || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH`,
        []
    );

    const toggleBook = (bookId) => {
        setBasket((prev) => {
            const next = { ...prev };
            if (next[bookId]) {
                delete next[bookId];
            } else {
                next[bookId] = 1;
            }
            return next;
        });
    };

    const adjustQuantity = (bookId, delta) => {
        setBasket((prev) => {
            if (!prev[bookId] && delta > 0) {
                return { ...prev, [bookId]: 1 };
            }
            const current = prev[bookId];
            if (!current) return prev;
            const nextQty = current + delta;
            if (nextQty <= 0) {
                const next = { ...prev };
                delete next[bookId];
                return next;
            }
            return { ...prev, [bookId]: Math.min(nextQty, 10) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setStatus("");

        if (selectedItems.length === 0) {
            setError("Please select at least one book to purchase.");
            return;
        }

        if (!token) {
            setError("You must be signed in to complete a purchase.");
            return;
        }

        setProcessing(true);

        const items = selectedItems.map((item) => ({
            bookId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
        }));

        const payload = {
            items,
            subtotal,
            fees,
            totalAmount: totalDue,
            currency: "DH",
            notes: notes.trim(),
            description: `Purchase of ${items.length} ${items.length === 1 ? 'book' : 'books'}`,
        };

        let simulated = false;

        try {
            const response = await fetchJson(PAYMENT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const message = response?.message || "Payment processed successfully.";
            setStatus(message);
            setBasket(Object.create(null));
            setNotes("");
            notify("Payment processed successfully");
        } catch (err) {
            console.error(err);
            simulated = true;
            setError("Payment service unavailable. Running local simulation instead.");
            setTimeout(() => {
                setStatus("Simulated payment completed — enjoy your new books!");
                setProcessing(false);
                notify("Payment simulated");
            }, 1200);
            return;
        } finally {
            if (!simulated) {
                setProcessing(false);
            }
        }
    };

    return (
        <>
            <Navbar />
            <Breadcrumbs />
            <main className="page-container pattern-bg section centered" style={{ paddingTop: "1.5rem" }}>
                <div className="wrap">
                    <div className="vintage-card vintage-card--padded">
                        <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                            <h1 className="brand-title brand-title--lg" style={{ marginBottom: ".35rem" }}>
                                Get Your Copy
                            </h1>
                            <p className="tagline" style={{ maxWidth: 560, margin: "0 auto" }}>
                                Hook this flow to the optional payment-service, or run the built-in simulation to test end-to-end purchases without an external processor.
                            </p>
                        </header>

                        <section>
                            <h2 className="brand-title" style={{ fontSize: "1.25rem", marginBottom: ".75rem" }}>
                                Featured titles
                            </h2>
                            <div className="grid grid--cards" style={{ marginBottom: "1.5rem" }}>
                                {demoCatalog.map((book) => {
                                    const isActive = Boolean(basket[book.id]);
                                    return (
                                        <label
                                            key={book.id}
                                            className="vintage-card"
                                            style={{
                                                cursor: "pointer",
                                                borderWidth: isActive ? 2 : 1,
                                                borderColor: isActive ? "var(--accent)" : "var(--border)",
                                                boxShadow: isActive
                                                    ? "0 18px 32px rgba(60,27,19,0.18)"
                                                    : "var(--shadow-card)",
                                                transition: "border-color .2s ease, box-shadow .2s ease",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                value={book.id}
                                                checked={isActive}
                                                onChange={() => toggleBook(book.id)}
                                                style={{ display: "none" }}
                                            />
                                            <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
                                                <span className="brand-title" style={{ fontSize: "1.1rem" }}>
                                                    {book.title}
                                                </span>
                                                <span className="tagline">by {book.author}</span>
                                                <p className="tagline" style={{ margin: 0 }}>{book.description}</p>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        marginLeft: 0,
                                                        fontSize: ".85rem",
                                                        background: "#fdf2e9",
                                                        color: "var(--wood)",
                                                    }}
                                                >
                                                    {formatAmount(book.price)}
                                                </span>
                                                {isActive && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginTop: ".4rem" }}>
                                                        <button
                                                            type="button"
                                                            className="vintage-button vintage-button--ghost"
                                                            style={{ padding: ".3rem .6rem", minWidth: 32 }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                adjustQuantity(book.id, -1);
                                                            }}
                                                            aria-label={`Decrease quantity of ${book.title}`}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="brand-title" style={{ fontSize: "1rem" }}>{basket[book.id]}</span>
                                                        <button
                                                            type="button"
                                                            className="vintage-button vintage-button--ghost"
                                                            style={{ padding: ".3rem .6rem", minWidth: 32 }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                adjustQuantity(book.id, 1);
                                                            }}
                                                            aria-label={`Increase quantity of ${book.title}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        <form className="form" onSubmit={handleSubmit}>
                            <div className="form-row" style={{ alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <label className="tagline" htmlFor="note">
                                        Order notes (optional)
                                    </label>
                                    <textarea
                                        id="note"
                                        className="input"
                                        rows={3}
                                        placeholder="Add any notes you would send to the bookseller..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        style={{ marginTop: ".35rem" }}
                                    ></textarea>
                                </div>
                                {selectedItems.length > 0 && (
                                    <div
                                        className="vintage-card"
                                        style={{
                                            flex: "0 0 240px",
                                            padding: "1rem",
                                            background: "linear-gradient(180deg, rgba(255,253,249,0.92), rgba(251,243,229,0.95))",
                                        }}
                                    >
                                        <p className="tagline" style={{ marginBottom: ".25rem" }}>Order summary</p>
                                        <div style={{ display: "grid", gap: ".45rem", marginBottom: ".5rem" }}>
                                            {selectedItems.map((item) => (
                                                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".45rem" }}>
                                                    <div style={{ display: "grid" }}>
                                                        <span className="brand-title" style={{ fontSize: "1rem" }}>{item.title}</span>
                                                        <span className="tagline">Qty {item.quantity}</span>
                                                    </div>
                                                    <span className="brand-title" style={{ fontSize: "1rem" }}>
                                                        {formatAmount(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".25rem" }}>
                                            <span className="tagline">Subtotal</span>
                                            <span className="brand-title" style={{ fontSize: "1rem" }}>
                                                {formatAmount(subtotal)}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".25rem" }}>
                                            <span className="tagline">Fees (simulated)</span>
                                            <span className="brand-title" style={{ fontSize: "1rem" }}>
                                                {formatAmount(fees)}
                                            </span>
                                        </div>
                                        <div style={{ height: 1, background: "var(--border)", margin: ".45rem 0" }}></div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span className="tagline" style={{ fontWeight: 600 }}>Total due</span>
                                            <span className="brand-title" style={{ fontSize: "1.1rem" }}>
                                                {formatAmount(totalDue)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p className="form-meta" style={{ color: "#b91c1c" }}>
                                    {error}
                                </p>
                            )}
                            {status && (
                                <p className="form-meta" style={{ color: "#166534" }}>
                                    {status}
                                </p>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: ".75rem" }}>
                                <button
                                    type="button"
                                    className="vintage-button vintage-button--ghost"
                                    onClick={() => {
                                        setStatus("");
                                        setError("");
                                        setNotes("");
                                        setBasket(Object.create(null));
                                    }}
                                >
                                    Clear
                                </button>
                                <button type="submit" className="vintage-button" disabled={processing}>
                                    {processing ? "Processing..." : selectedItems.length ? `Proceed • ${formatAmount(totalDue)}` : "Get Your Copy"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
