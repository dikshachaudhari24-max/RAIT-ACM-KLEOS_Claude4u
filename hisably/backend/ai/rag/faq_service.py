"""In-memory GST FAQ retrieval using multilingual sentence embeddings.

Provides a lightweight RAG layer over a curated GST knowledge base so the
voice assistant can ground answers in correct GST facts. Reuses the same
embedding model as ai/rag/embedder.py (paraphrase-multilingual-MiniLM-L12-v2),
which supports English + Hindi + Marathi + Tamil + Telugu + Gujarati.
"""

from __future__ import annotations

import numpy as np

# Curated GST FAQ knowledge base (question, answer) pairs.
GST_FAQS: list[tuple[str, str]] = [
    ("What is ITC?", "ITC (Input Tax Credit) is the GST you paid on purchases that you can deduct from the GST you owe on sales. It reduces your tax burden."),
    ("ITC kya hota hai?", "ITC yaani Input Tax Credit — jo GST aapne kharidari pe diya, woh aap apne bechne wale GST se kaat sakte hain. Isse aapka tax kam hota hai."),
    ("When is GSTR-1 filing date?", "GSTR-1 is filed by the 11th of every month for the previous month's outward supplies (sales)."),
    ("GSTR-1 kab bharte hain?", "GSTR-1 har mahine ki 11 tareekh tak bharna hota hai — pichhle mahine ki sales ke liye."),
    ("When is GSTR-3B due?", "GSTR-3B is due by the 20th of every month. It is the summary return with your tax payment."),
    ("GSTR-3B kab bharna hai?", "GSTR-3B har mahine ki 20 tareekh tak bharna hota hai. Isme tax payment ka summary hota hai."),
    ("What is GSTR-2B?", "GSTR-2B is an auto-generated statement showing the ITC available to you based on your suppliers' filings. It is static and generated on the 14th of each month."),
    ("GSTR-2B kya hota hai?", "GSTR-2B ek auto-generated statement hai jo dikhata hai ki aapke suppliers ne jo file kiya uske hisaab se aapko kitna ITC milega. Yeh har mahine 14 tareekh ko banta hai."),
    ("How do I find the HSN code?", "HSN codes classify goods for GST. You can search the official GST portal's HSN lookup, or check your supplier's invoice. Most products have a 4, 6, or 8 digit HSN."),
    ("HSN code kaise milega?", "HSN code saaman ko GST ke liye classify karta hai. Aap GST portal pe HSN search kar sakte hain, ya supplier ke invoice pe dekh sakte hain. Zyadatar products ka 4, 6 ya 8 digit HSN hota hai."),
    ("What is blocked ITC?", "Blocked ITC is input tax credit you cannot claim — for example, on motor vehicles for personal use, food and beverages, or when your supplier did not file their return."),
    ("Blocked ITC kya hota hai?", "Blocked ITC woh credit hai jo aap claim nahi kar sakte — jaise personal gaadi, khane-peene ki cheezein, ya jab supplier ne return file nahi kiya."),
    ("What is the GSTIN format?", "GSTIN is a 15-character number: 2 digit state code + 10 character PAN + 1 entity number + letter Z + 1 check digit."),
    ("GSTIN format kya hai?", "GSTIN 15 character ka hota hai: 2 digit state code + 10 character PAN + 1 entity number + Z + 1 check digit."),
    ("What is the penalty for late GST filing?", "Late filing attracts a late fee of Rs 50 per day (Rs 20 for nil returns), plus 18 percent annual interest on unpaid tax."),
    ("Late filing penalty kitni hai?", "Late filing pe Rs 50 prati din late fee lagti hai (nil return pe Rs 20), aur unpaid tax pe 18 percent saalaana interest."),
    ("What is CGST and SGST?", "CGST is Central GST and SGST is State GST. For sales within your state, GST is split equally between CGST and SGST."),
    ("CGST aur SGST kya hai?", "CGST Central GST hai aur SGST State GST hai. Apne state ke andar sale pe GST CGST aur SGST mein barabar bant jaata hai."),
    ("What is IGST?", "IGST is Integrated GST charged on inter-state sales (sales to another state). It goes to the central government and is later shared."),
    ("IGST kya hai?", "IGST inter-state sale pe lagta hai — jab aap dusre state mein bechte hain. Yeh central government ko jaata hai."),
    ("What is reverse charge?", "Under reverse charge, the buyer pays GST directly to the government instead of the supplier, for certain notified goods and services."),
    ("Reverse charge kya hai?", "Reverse charge mein buyer khud GST government ko deta hai, supplier ke bajaye — kuch khaas goods aur services pe."),
    ("How is ITC matched?", "ITC is matched by comparing your purchase invoices against GSTR-2B. The GSTIN, invoice number, and tax amount must match for the credit to be allowed."),
    ("ITC kaise match hota hai?", "ITC aapke purchase invoices ko GSTR-2B se compare karke match hota hai. GSTIN, invoice number aur tax amount match hone chahiye."),
    ("What if my supplier did not file GSTR-1?", "If your supplier did not file GSTR-1, the invoice will not appear in your GSTR-2B and you cannot claim that ITC. Contact the supplier to file."),
    ("Supplier ne GSTR-1 file nahi kiya to?", "Agar supplier ne GSTR-1 file nahi kiya, to invoice aapke GSTR-2B mein nahi aayega aur aap woh ITC claim nahi kar sakte. Supplier se file karne ko kahein."),
    ("What is a GST mismatch?", "A GST mismatch happens when your invoice details do not match the supplier's GSTR-2B entry — like a different amount, wrong GSTIN, or a missing invoice."),
    ("GST mismatch kya hota hai?", "GST mismatch tab hota hai jab aapke invoice ki details supplier ke GSTR-2B se match nahi karti — jaise alag amount, galat GSTIN, ya missing invoice."),
    ("What GST rate applies to my goods?", "GST rates are 0, 5, 12, 18, or 28 percent depending on the product's HSN code. Essential goods are lower, luxury goods are higher."),
    ("Mere saaman pe kitna GST lagega?", "GST rate HSN code pe depend karta hai — 0, 5, 12, 18 ya 28 percent. Zaroori cheezein kam, luxury cheezein zyada."),
    ("Can I claim ITC on a handwritten bill?", "ITC can only be claimed on a proper tax invoice with the supplier's GSTIN. A plain handwritten chit without GSTIN does not qualify for ITC."),
    ("Handwritten bill pe ITC mil sakta hai?", "ITC sirf proper tax invoice pe milta hai jisme supplier ka GSTIN ho. Bina GSTIN wali handwritten parchi pe ITC nahi milta."),
    ("What is the composition scheme?", "The composition scheme lets small businesses with turnover up to Rs 1.5 crore pay a flat low GST rate, but they cannot claim ITC or sell inter-state."),
    ("Composition scheme kya hai?", "Composition scheme chhote vyaparon ke liye hai jinka turnover Rs 1.5 crore tak ho — woh flat kam GST dete hain, lekin ITC claim nahi kar sakte."),
    ("When do I need GST registration?", "GST registration is mandatory if your annual turnover exceeds Rs 40 lakh for goods (Rs 20 lakh for services), or for inter-state sales."),
    ("GST registration kab zaroori hai?", "GST registration tab zaroori hai jab saalaana turnover Rs 40 lakh (goods) ya Rs 20 lakh (services) se zyada ho, ya inter-state sale ho."),
    ("What is an e-way bill?", "An e-way bill is required to transport goods worth more than Rs 50,000. It is generated on the GST portal before moving the goods."),
    ("E-way bill kya hai?", "E-way bill Rs 50,000 se zyada ke saaman ko le jaane ke liye chahiye. Yeh GST portal pe banaya jaata hai saaman bhejne se pehle."),
    ("How do I correct a wrong invoice?", "To correct a wrong invoice, issue a debit note or credit note, or ask the supplier to amend it in their next GSTR-1 filing."),
    ("Galat invoice kaise theek karein?", "Galat invoice theek karne ke liye debit note ya credit note jaari karein, ya supplier se agle GSTR-1 mein sudhaar karne ko kahein."),
    ("What is taxable value?", "Taxable value is the price of goods or services before GST is added. GST is calculated as a percentage of this taxable value."),
    ("Taxable value kya hai?", "Taxable value woh keemat hai GST jodne se pehle. GST isi taxable value ka percentage hota hai."),
    ("Can I revise a filed GST return?", "GST returns cannot be revised once filed. Corrections are made by adjusting in the next month's return through amendments."),
    ("Filed GST return revise kar sakte hain?", "GST return ek baar file hone ke baad revise nahi hoti. Sudhaar agle mahine ki return mein amendment se hota hai."),
    ("What is the difference between GSTR-2A and GSTR-2B?", "GSTR-2A is dynamic and updates continuously as suppliers file. GSTR-2B is static, generated once on the 14th, and is used for claiming ITC."),
    ("GSTR-2A aur GSTR-2B mein farak kya hai?", "GSTR-2A dynamic hai aur supplier ke file karne pe badalta rehta hai. GSTR-2B static hai, 14 tareekh ko ek baar banta hai, aur ITC claim ke liye use hota hai."),
    ("How long must I keep GST records?", "GST records and invoices must be kept for at least 6 years from the due date of the annual return for that year."),
    ("GST records kitne saal rakhein?", "GST records aur invoices kam se kam 6 saal tak rakhne chahiye, us saal ki annual return ki due date se."),
    ("What is a nil return?", "A nil return is a GST return filed when you had no sales or purchases in that period. It must still be filed to avoid penalties."),
    ("Nil return kya hai?", "Nil return woh return hai jab us period mein koi sale ya purchase nahi hui. Phir bhi file karna zaroori hai warna penalty lagti hai."),
    ("What happens if I miss the ITC claim deadline?", "ITC for an invoice must be claimed by November 30th following the financial year, or the annual return date, whichever is earlier. After that the credit lapses."),
    ("ITC claim ki deadline miss ho gayi to?", "Kisi invoice ka ITC financial year ke baad 30 November tak ya annual return tak claim karna hota hai. Uske baad credit khatam ho jaata hai."),
]

_model = None
_embeddings: np.ndarray | None = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model


def _ensure_embeddings() -> np.ndarray:
    """Embed all FAQ questions once and cache them."""
    global _embeddings
    if _embeddings is None:
        model = _get_model()
        questions = [q for q, _ in GST_FAQS]
        _embeddings = np.array(model.encode(questions))
    return _embeddings


def get_relevant_context(query: str, top_k: int = 3) -> str:
    """Return the top_k most relevant FAQ answers for a query as a combined string."""
    try:
        model = _get_model()
        embeddings = _ensure_embeddings()
        q_vec = np.array(model.encode([query]))[0]

        # Cosine similarity
        norms = np.linalg.norm(embeddings, axis=1) * np.linalg.norm(q_vec)
        norms[norms == 0] = 1e-9
        sims = embeddings @ q_vec / norms
        top_idx = np.argsort(sims)[::-1][:top_k]

        chunks = []
        for i in top_idx:
            if sims[i] > 0.3:  # relevance floor
                q, a = GST_FAQS[i]
                chunks.append(f"Q: {q}\nA: {a}")
        return "\n\n".join(chunks)
    except Exception:
        return ""
