"""Generate a GSTR-2B PDF report from gstr2b_20.csv.

Usage:
    cd D:\RAIT\hisably\test_data
    python generate_gstr2b_pdf.py

Creates gstr2b_report.pdf — looks like a real GSTR-2B government download.
"""

import csv
import os

from reportlab.lib import colors as rl_colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = os.path.dirname(os.path.abspath(__file__))

GOV_GREEN = rl_colors.HexColor("#1B5E20")
HEADER_BG = rl_colors.HexColor("#E8F5E9")
ALT_ROW = rl_colors.HexColor("#F5F5F5")


def main():
    csv_path = os.path.join(HERE, "gstr2b_20.csv")
    pdf_path = os.path.join(HERE, "gstr2b_report.pdf")

    with open(csv_path, encoding="utf-8") as f:
        records = list(csv.DictReader(f))

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "GSTTitle",
        parent=styles["Title"],
        fontSize=18,
        textColor=GOV_GREEN,
        spaceAfter=4 * mm,
    )
    subtitle_style = ParagraphStyle(
        "GSTSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=rl_colors.HexColor("#333333"),
        spaceAfter=2 * mm,
    )
    info_style = ParagraphStyle(
        "Info",
        parent=styles["Normal"],
        fontSize=9,
        textColor=rl_colors.HexColor("#555555"),
        spaceAfter=1.5 * mm,
    )
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=rl_colors.HexColor("#999999"),
    )

    elements = []

    # Header
    elements.append(Paragraph("GSTR-2B — Auto-Drafted ITC Statement", title_style))
    elements.append(Paragraph("Goods and Services Tax | Government of India", subtitle_style))
    elements.append(Spacer(1, 3 * mm))

    # Business details
    info_data = [
        ["GSTIN of Recipient:", "27AALPD5432Q1Z3", "Financial Year:", "2026-27"],
        ["Legal Name:", "Hisably Test Store", "Tax Period:", "June 2026"],
        ["Trade Name:", "Hisably Test Store", "Date Generated:", "20-06-2026"],
    ]
    info_table = Table(info_data, colWidths=[100, 160, 100, 120])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 0), (0, -1), rl_colors.HexColor("#555555")),
        ("TEXTCOLOR", (2, 0), (2, -1), rl_colors.HexColor("#555555")),
        ("TEXTCOLOR", (1, 0), (1, -1), rl_colors.black),
        ("TEXTCOLOR", (3, 0), (3, -1), rl_colors.black),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 6 * mm))

    # Section heading
    elements.append(Paragraph(
        "<b>Part A — ITC Available (as per GSTR-1/IFF/GSTR-5 of suppliers)</b>",
        ParagraphStyle("SectionHead", parent=styles["Normal"], fontSize=11,
                        textColor=GOV_GREEN, spaceAfter=3 * mm),
    ))

    # Summary
    total_itc = sum(float(r["itc_amount"]) for r in records)
    matched = sum(1 for r in records if r["status"] == "matched")
    mismatched = len(records) - matched
    elements.append(Paragraph(
        f"Total Records: <b>{len(records)}</b> &nbsp;|&nbsp; "
        f"Matched: <b>{matched}</b> &nbsp;|&nbsp; "
        f"Action Required: <b>{mismatched}</b> &nbsp;|&nbsp; "
        f"Total ITC: <b>₹{total_itc:,.2f}</b>",
        ParagraphStyle("Summary", parent=styles["Normal"], fontSize=10, spaceAfter=4 * mm),
    ))

    # Main table
    header = ["Sr.", "GSTIN of Supplier", "Invoice No.", "ITC Amount (₹)", "Upload Date", "Status"]
    table_data = [header]

    for i, r in enumerate(records, 1):
        status = r["status"].replace("_", " ").title()
        table_data.append([
            str(i),
            r["supplier_gstin"],
            r["invoice_number"],
            f"₹{float(r['itc_amount']):,.2f}",
            r["upload_date"],
            status,
        ])

    # Totals row
    table_data.append(["", "", "TOTAL", f"₹{total_itc:,.2f}", "", ""])

    col_widths = [30, 130, 100, 90, 80, 100]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)

    style_cmds = [
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 8.5),
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), GOV_GREEN),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (3, 0), (3, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, rl_colors.HexColor("#CCCCCC")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), HEADER_BG),
        ("LINEABOVE", (0, -1), (-1, -1), 1.5, GOV_GREEN),
    ]

    for i in range(2, len(table_data) - 1, 2):
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), ALT_ROW))

    for i, r in enumerate(records, 1):
        if r["status"] != "matched":
            style_cmds.append(("TEXTCOLOR", (5, i), (5, i), rl_colors.HexColor("#D32F2F")))
            style_cmds.append(("FONTNAME", (5, i), (5, i), "Helvetica-Bold"))

    table.setStyle(TableStyle(style_cmds))
    elements.append(table)
    elements.append(Spacer(1, 8 * mm))

    # Notes
    elements.append(Paragraph("<b>Notes:</b>", info_style))
    notes = [
        "1. This statement has been auto-generated from GSTR-1/IFF filed by your suppliers.",
        "2. 'Amount Mismatch' — ITC amount in GSTR-2B differs from your purchase records.",
        "3. 'GSTIN Mismatch' — Supplier GSTIN in GSTR-2B does not match your purchase invoice.",
        "4. Invoices not listed here are 'Missing' — supplier has not reported them in GSTR-1.",
        "5. Please reconcile mismatches before filing GSTR-3B to avoid ITC reversals.",
    ]
    for n in notes:
        elements.append(Paragraph(n, footer_style))
        elements.append(Spacer(1, 1 * mm))

    elements.append(Spacer(1, 10 * mm))
    elements.append(Paragraph(
        "This is a system-generated document. No signature required.",
        ParagraphStyle("Disclaimer", parent=styles["Normal"], fontSize=8,
                        textColor=rl_colors.HexColor("#AAAAAA"), alignment=1),
    ))

    doc.build(elements)
    print(f"GSTR-2B PDF generated: {pdf_path}")


if __name__ == "__main__":
    main()
