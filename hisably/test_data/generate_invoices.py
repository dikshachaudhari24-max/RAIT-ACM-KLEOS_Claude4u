"""Generate realistic Indian GST invoice images from invoices_20.json.

Usage:
    cd D:\RAIT\hisably\test_data
    python generate_invoices.py

Creates an 'invoices/' folder with 20 invoice images (PNG).
"""

import json
import os
import random
import textwrap
from datetime import datetime

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "invoices")
os.makedirs(OUT_DIR, exist_ok=True)

SUPPLIER_DETAILS = {
    "Patel Hardware & Tools": {
        "address": "Shop 12, Industrial Estate\nAndheri East, Mumbai - 400069\nMaharashtra",
        "phone": "022-2836 4521",
    },
    "Desai Textiles Pvt Ltd": {
        "address": "Plot 45, GIDC Naroda\nAhmedabad - 382330\nGujarat",
        "phone": "079-2583 1290",
    },
    "Joshi Electricals": {
        "address": "No. 8, Peenya Industrial Area\n2nd Phase, Bengaluru - 560058\nKarnataka",
        "phone": "080-2839 7654",
    },
    "Kumar Food Products": {
        "address": "42, Ambattur Industrial Estate\nChennai - 600058\nTamil Nadu",
        "phone": "044-2625 8843",
    },
    "Reddy Auto Parts": {
        "address": "D-Block, Balanagar Industrial Area\nHyderabad - 500037\nTelangana",
        "phone": "040-2340 6678",
    },
    "Singh Transport Services": {
        "address": "NH-48 Warehouse Complex\nManesar, Gurugram - 122051\nHaryana",
        "phone": "0124-435 2290",
    },
}

BUYER = {
    "name": "Hisably Test Store",
    "gstin": "27AALPD5432Q1Z3",
    "address": "Shop 5, Market Yard\nDadar West, Mumbai - 400028\nMaharashtra",
}

W, H = 800, 1100


def _try_font(size):
    for name in ("consola.ttf", "cour.ttf", "arial.ttf", "DejaVuSansMono.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def _draw_invoice(inv, idx):
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    font_title = _try_font(22)
    font_heading = _try_font(16)
    font_body = _try_font(13)
    font_small = _try_font(11)
    font_bold = _try_font(14)

    supplier = inv["supplier_name"]
    details = SUPPLIER_DETAILS.get(supplier, {"address": "Mumbai, Maharashtra", "phone": "022-0000 0000"})

    y = 30

    # Border
    draw.rectangle([20, 20, W - 20, H - 20], outline="#333333", width=2)
    draw.rectangle([22, 22, W - 22, H - 22], outline="#333333", width=1)

    # Header - TAX INVOICE
    draw.text((W // 2 - 80, y), "TAX INVOICE", fill="#1B5E20", font=font_title)
    y += 35

    draw.line([(30, y), (W - 30, y)], fill="#1B5E20", width=2)
    y += 15

    # Supplier info (left side)
    draw.text((40, y), supplier.upper(), fill="#000000", font=font_heading)
    y += 25
    draw.text((40, y), f"GSTIN: {inv['supplier_gstin']}", fill="#333333", font=font_bold)
    y += 20
    for line in details["address"].split("\n"):
        draw.text((40, y), line, fill="#555555", font=font_body)
        y += 17
    draw.text((40, y), f"Phone: {details['phone']}", fill="#555555", font=font_body)
    y += 25

    # Invoice details (right-aligned box)
    box_x = 450
    box_y = 95
    draw.rectangle([box_x, box_y, W - 35, box_y + 75], outline="#CCCCCC", width=1)
    draw.text((box_x + 10, box_y + 8), f"Invoice No: {inv['invoice_number']}", fill="#000000", font=font_bold)
    draw.text((box_x + 10, box_y + 28), f"Date: {inv['date']}", fill="#333333", font=font_body)
    draw.text((box_x + 10, box_y + 48), f"HSN Code: {inv['hsn_code']}", fill="#333333", font=font_body)

    y += 5
    draw.line([(30, y), (W - 30, y)], fill="#999999", width=1)
    y += 15

    # Bill To
    draw.text((40, y), "Bill To:", fill="#666666", font=font_small)
    y += 18
    draw.text((40, y), BUYER["name"], fill="#000000", font=font_bold)
    y += 20
    draw.text((40, y), f"GSTIN: {BUYER['gstin']}", fill="#333333", font=font_body)
    y += 18
    for line in BUYER["address"].split("\n"):
        draw.text((40, y), line, fill="#555555", font=font_body)
        y += 17
    y += 15

    draw.line([(30, y), (W - 30, y)], fill="#999999", width=1)
    y += 5

    # Table header
    cols = [40, 350, 480, 600, 720]
    headers = ["Description", "HSN", "Qty", "Rate", "Amount"]
    draw.rectangle([30, y, W - 30, y + 28], fill="#E8F5E9")
    for c, h in zip(cols, headers):
        draw.text((c, y + 6), h, fill="#1B5E20", font=font_bold)
    y += 30

    draw.line([(30, y), (W - 30, y)], fill="#CCCCCC", width=1)
    y += 5

    # Item row
    desc = inv["product_description"]
    wrapped = textwrap.wrap(desc, width=35)
    qty = random.randint(1, 50)
    rate = inv["taxable_value"] / qty

    draw.text((cols[0], y), wrapped[0] if wrapped else desc, fill="#000000", font=font_body)
    if len(wrapped) > 1:
        draw.text((cols[0], y + 16), wrapped[1], fill="#000000", font=font_body)
    draw.text((cols[1], y), inv["hsn_code"], fill="#333333", font=font_body)
    draw.text((cols[2], y), str(qty), fill="#333333", font=font_body)
    draw.text((cols[3], y), f"{rate:,.2f}", fill="#333333", font=font_body)
    draw.text((cols[4], y), f"{inv['taxable_value']:,.2f}", fill="#000000", font=font_body)

    y += 40 if len(wrapped) > 1 else 25
    draw.line([(30, y), (W - 30, y)], fill="#CCCCCC", width=1)
    y += 15

    # Totals section
    totals_x = 450
    label_x = totals_x
    val_x = 680

    taxable = inv["taxable_value"]
    gst_pct = inv["gst_percent"]
    gst_amt = inv["gst_amount"] if inv["gst_amount"] else taxable * gst_pct / 100
    total = inv["total_amount"]

    draw.text((label_x, y), "Taxable Value:", fill="#555555", font=font_body)
    draw.text((val_x, y), f"{taxable:>10,.2f}", fill="#000000", font=font_body)
    y += 22

    if gst_pct and inv["supplier_gstin"][:2] == BUYER["gstin"][:2]:
        cgst = gst_amt / 2
        sgst = gst_amt / 2
        draw.text((label_x, y), f"CGST @ {gst_pct/2:.1f}%:", fill="#555555", font=font_body)
        draw.text((val_x, y), f"{cgst:>10,.2f}", fill="#000000", font=font_body)
        y += 20
        draw.text((label_x, y), f"SGST @ {gst_pct/2:.1f}%:", fill="#555555", font=font_body)
        draw.text((val_x, y), f"{sgst:>10,.2f}", fill="#000000", font=font_body)
        y += 20
    else:
        draw.text((label_x, y), f"IGST @ {gst_pct}%:", fill="#555555", font=font_body)
        draw.text((val_x, y), f"{gst_amt:>10,.2f}", fill="#000000", font=font_body)
        y += 20

    y += 5
    draw.line([(totals_x, y), (W - 35, y)], fill="#1B5E20", width=2)
    y += 8
    draw.text((label_x, y), "TOTAL:", fill="#1B5E20", font=font_heading)
    draw.text((val_x - 20, y), f"Rs.{total:>10,.2f}", fill="#1B5E20", font=font_heading)
    y += 30

    draw.line([(totals_x, y), (W - 35, y)], fill="#1B5E20", width=2)
    y += 20

    # Amount in words (approximate)
    draw.text((40, y), f"Amount in Words: Rupees {_amount_words(total)} Only", fill="#555555", font=font_small)
    y += 30

    # Bank details
    draw.line([(30, y), (W - 30, y)], fill="#999999", width=1)
    y += 10
    draw.text((40, y), "Bank Details:", fill="#666666", font=font_small)
    y += 16
    draw.text((40, y), f"Bank: State Bank of India  |  A/C: {random.randint(10000000000, 99999999999)}  |  IFSC: SBIN00{random.randint(10000, 99999)}", fill="#555555", font=font_small)
    y += 25

    # Footer
    draw.line([(30, H - 120), (W - 30, H - 120)], fill="#999999", width=1)
    draw.text((40, H - 105), "Terms: Payment due within 30 days. Interest @ 18% p.a. on overdue.", fill="#888888", font=font_small)
    draw.text((40, H - 88), "E. & O.E.  |  Subject to jurisdiction of local courts.", fill="#888888", font=font_small)

    # Signature area
    draw.text((W - 220, H - 100), "Authorised Signatory", fill="#555555", font=font_small)
    draw.line([(W - 240, H - 65), (W - 50, H - 65)], fill="#999999", width=1)
    draw.text((W - 200, H - 58), f"For {supplier}", fill="#333333", font=font_small)

    # Computer generated note
    draw.text((W // 2 - 120, H - 40), "This is a computer generated invoice", fill="#AAAAAA", font=font_small)

    filename = f"invoice_{idx+1:02d}_{inv['invoice_number'].replace('-', '_')}.png"
    filepath = os.path.join(OUT_DIR, filename)
    img.save(filepath, "PNG", quality=95)
    return filename


def _amount_words(amount):
    amt = int(amount)
    if amt >= 100000:
        lakhs = amt // 100000
        remainder = amt % 100000
        if remainder > 0:
            thousands = remainder // 1000
            return f"{lakhs} Lakh {thousands} Thousand {remainder % 1000}"
        return f"{lakhs} Lakh"
    elif amt >= 1000:
        thousands = amt // 1000
        remainder = amt % 1000
        if remainder > 0:
            return f"{thousands} Thousand {remainder}"
        return f"{thousands} Thousand"
    return str(amt)


def main():
    with open(os.path.join(HERE, "invoices_20.json"), encoding="utf-8") as f:
        invoices = json.load(f)

    print(f"Generating {len(invoices)} invoice images...")
    for i, inv in enumerate(invoices):
        fname = _draw_invoice(inv, i)
        print(f"  [{i+1:2d}/20] {fname}")

    print(f"\nDone! {len(invoices)} invoice PNGs saved to: {OUT_DIR}")


if __name__ == "__main__":
    main()
