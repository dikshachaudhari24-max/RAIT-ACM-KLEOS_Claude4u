"""Server-side PDF generation for the Annual ITC Report (reportlab)."""

import io
from datetime import datetime


def format_inr(value) -> str:
    """Indian number system: ₹940 / ₹1,687 / ₹4.2L / ₹1.2Cr."""
    try:
        v = float(value or 0)
    except (TypeError, ValueError):
        v = 0.0
    if v >= 1_00_00_000:
        return f"Rs. {v / 1_00_00_000:.1f}Cr"
    if v >= 1_00_000:
        return f"Rs. {v / 1_00_000:.1f}L"
    # Indian grouping for the sub-lakh range.
    return f"Rs. {_indian_group(int(round(v)))}"


def _indian_group(n: int) -> str:
    s = str(abs(n))
    if len(s) <= 3:
        grouped = s
    else:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        grouped = ",".join(parts) + "," + tail
    return ("-" if n < 0 else "") + grouped


def generate_annual_report_pdf(report: dict, user: dict) -> bytes:
    from reportlab.lib import colors as rl_colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import inch
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable,
    )

    DARK_GREEN = rl_colors.HexColor("#1B4332")
    LIGHT_GREEN = rl_colors.HexColor("#F0F7F0")
    RED = rl_colors.HexColor("#C62828")
    GREY = rl_colors.HexColor("#455A64")

    fy = report.get("financial_year", "")
    summary = report.get("summary", {})
    monthly = report.get("monthly_data", [])
    leaderboard = report.get("supplier_leaderboard", [])

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4, rightMargin=0.6 * inch, leftMargin=0.6 * inch,
        topMargin=0.7 * inch, bottomMargin=0.7 * inch,
    )

    title_style = ParagraphStyle("Title", fontSize=22, textColor=DARK_GREEN,
                                 fontName="Helvetica-Bold", alignment=TA_CENTER, spaceAfter=4)
    subtitle_style = ParagraphStyle("Subtitle", fontSize=11, textColor=rl_colors.gray,
                                    alignment=TA_CENTER, spaceAfter=2)
    section_style = ParagraphStyle("Section", fontSize=13, textColor=DARK_GREEN,
                                   fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=8)
    footer_style = ParagraphStyle("Footer", fontSize=8, textColor=rl_colors.grey,
                                  alignment=TA_CENTER, spaceBefore=4)

    story = []
    story.append(Paragraph("HISABLY", title_style))
    story.append(Paragraph("Annual ITC Report", subtitle_style))
    story.append(Paragraph(f"Financial Year {fy}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=DARK_GREEN, spaceAfter=10))

    # Account block
    info_data = [
        ["Account:", user.get("name", "N/A"), "GSTIN:", user.get("gstin", "N/A")],
        ["Financial Year:", f"FY {fy}", "Generated:", datetime.now().strftime("%d %b %Y %H:%M")],
    ]
    info_table = Table(info_data, colWidths=[1.4 * inch, 2.4 * inch, 1.2 * inch, 2.4 * inch])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), DARK_GREEN),
        ("TEXTCOLOR", (2, 0), (2, -1), DARK_GREEN),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, rl_colors.lightgrey),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_GREEN, rl_colors.white]),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.15 * inch))

    # Summary numbers
    story.append(Paragraph("Yearly Summary", section_style))
    recovery = summary.get("recovery_rate", 0)
    summary_data = [
        ["ITC Entitled", "ITC Claimed", "ITC Missed", "Recovery Rate"],
        [
            format_inr(summary.get("total_entitled")),
            format_inr(summary.get("total_claimed")),
            format_inr(summary.get("total_missed")),
            f"{recovery}%",
        ],
    ]
    summary_table = Table(summary_data, colWidths=[1.7 * inch] * 4)
    summary_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, 1), 12),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TEXTCOLOR", (0, 0), (-1, 0), rl_colors.white),
        ("BACKGROUND", (0, 0), (-1, 0), DARK_GREEN),
        ("TEXTCOLOR", (1, 1), (1, 1), DARK_GREEN),
        ("TEXTCOLOR", (2, 1), (2, 1), RED),
        ("TEXTCOLOR", (0, 1), (0, 1), GREY),
        ("GRID", (0, 0), (-1, -1), 0.5, rl_colors.lightgrey),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)

    # Month-wise table
    story.append(Paragraph("Month-wise Summary", section_style))
    table_data = [["Month", "Invoices", "Entitled", "Claimed", "Missed"]]
    for d in monthly:
        if d.get("has_data"):
            table_data.append([
                f"{d['month']} {d['year']}",
                str(d["invoices_count"]),
                format_inr(d["itc_entitled"]),
                format_inr(d["itc_claimed"]),
                format_inr(d["itc_missed"]),
            ])
        else:
            table_data.append([f"{d['month']} {d['year']}", "-", "-", "-", "-"])

    table_data.append([
        "Total", "",
        format_inr(summary.get("total_entitled")),
        format_inr(summary.get("total_claimed")),
        format_inr(summary.get("total_missed")),
    ])

    month_table = Table(table_data, colWidths=[1.6 * inch, 1.0 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch], repeatRows=1)
    month_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), rl_colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [rl_colors.white, LIGHT_GREEN]),
        ("BACKGROUND", (0, -1), (-1, -1), rl_colors.HexColor("#E8F0E8")),
        ("GRID", (0, 0), (-1, -1), 0.3, rl_colors.lightgrey),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(month_table)

    # Top mismatch suppliers
    story.append(Paragraph("Top Mismatch Suppliers", section_style))
    if leaderboard:
        lb_data = [["#", "Supplier", "GSTIN", "Mismatches", "ITC Blocked", "Type"]]
        for i, s in enumerate(leaderboard, 1):
            lb_data.append([
                str(i),
                (s.get("supplier_name") or "")[:22],
                s.get("supplier_gstin") or "-",
                str(s.get("mismatch_count", 0)),
                format_inr(s.get("total_itc_blocked")),
                (s.get("most_common_mismatch_type") or "").replace("_", " "),
            ])
        lb_table = Table(lb_data, colWidths=[0.4 * inch, 1.8 * inch, 1.7 * inch, 1.0 * inch, 1.2 * inch, 1.2 * inch], repeatRows=1)
        lb_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK_GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), rl_colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [rl_colors.white, LIGHT_GREEN]),
            ("GRID", (0, 0), (-1, -1), 0.3, rl_colors.lightgrey),
            ("ALIGN", (4, 1), (4, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(lb_table)
    else:
        story.append(Paragraph("No supplier mismatches recorded this year.", subtitle_style))

    # Footer
    story.append(Spacer(1, 0.3 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=rl_colors.lightgrey))
    story.append(Paragraph("Generated by Hisably - GST Compliance App", footer_style))
    story.append(Paragraph(
        "This report is for informational purposes only. Consult your CA before filing.",
        footer_style,
    ))

    doc.build(story)
    buf.seek(0)
    return buf.getvalue()
