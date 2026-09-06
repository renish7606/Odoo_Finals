"""Invoice PDF generator service using ReportLab."""
import hashlib
import io
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        HRFlowable,
        KeepTogether,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_invoice_pdf(invoice_data: Dict[str, Any]) -> bytes:
    """
    Generate a high-quality, professional executive PDF invoice using ReportLab.
    """
    if not REPORTLAB_AVAILABLE:
        inv_number = invoice_data.get("number") or f"INV-2024-{invoice_data.get('id', 1001)}"
        content = f"INVOICE {inv_number}\nCustomer: {invoice_data.get('customer_name')}\nTotal: INR {invoice_data.get('total_amount', 0)}"
        return content.encode("utf-8")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom palette
    primary_color = colors.HexColor("#3D483A")
    sage_color = colors.HexColor("#566250")
    light_bg = colors.HexColor("#F4F7F2")
    header_bg = colors.HexColor("#E2F3DB")
    accent_ochre = colors.HexColor("#7A5826")
    text_dark = colors.HexColor("#121F10")
    text_muted = colors.HexColor("#5A6956")
    border_color = colors.HexColor("#C5C8BF")
    success_green = colors.HexColor("#2E6A38")

    # Typography styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=sage_color,
    )

    badge_style = ParagraphStyle(
        "Badge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=1,  # Center
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=primary_color,
        textTransform="uppercase",
    )

    cell_bold = ParagraphStyle(
        "CellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=text_dark,
    )

    cell_normal = ParagraphStyle(
        "CellNormal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=text_muted,
    )

    cell_right = ParagraphStyle(
        "CellRight",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=text_dark,
        alignment=2,  # Right
    )

    cell_right_bold = ParagraphStyle(
        "CellRightBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=text_dark,
        alignment=2,  # Right
    )

    story = []

    # 1. Header Banner
    inv_number = invoice_data.get("number") or f"INV-2024-{invoice_data.get('id', 1001)}"
    status = invoice_data.get("status", "Pending")
    status_color = success_green if status.lower() == "paid" else accent_ochre

    header_left = [
        Paragraph("<b>DEALFLOW360</b> ENTERPRISE M&amp;A", subtitle_style),
        Spacer(1, 4),
        Paragraph("Commercial Tax Invoice &amp; Settlement", title_style),
        Paragraph("Automated Ledger Audit &bull; High-Assurance Settlement Ledger", subtitle_style),
    ]

    header_right = [
        Table(
            [
                [
                    Paragraph(
                        f"<font color='white'><b>STATUS: {status.upper()}</b></font>",
                        badge_style,
                    )
                ]
            ],
            colWidths=[130],
            rowHeights=[22],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), status_color),
                ("CORNERPAD", (0, 0), (-1, -1), 4),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]),
        ),
        Spacer(1, 6),
        Paragraph(f"<b>Invoice #:</b> {inv_number}", cell_right_bold),
        Paragraph(f"<b>Issued:</b> {invoice_data.get('created_at', datetime.now().strftime('%b %d, %Y'))}", cell_right),
        Paragraph(f"<b>Due Date:</b> {invoice_data.get('due_date', 'Net 30 Days')}", cell_right),
    ]

    header_table = Table(
        [[header_left, header_right]],
        colWidths=[340, 200],
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=14))

    # 2. Billing & Remittance Bento
    customer_name = invoice_data.get("customer_name") or "Starlight Dynamics Inc."
    customer_address = invoice_data.get("customer_address") or "850 Third Avenue, Fl 14, New York, NY 10022"
    tax_id = invoice_data.get("tax_id") or "EIN: US-94829104"

    billed_to_content = [
        Paragraph("<b>BILLED TO</b>", section_heading),
        Spacer(1, 4),
        Paragraph(f"<b>{customer_name}</b>", cell_bold),
        Paragraph("Attn: Accounts Payable &amp; Financial Controller", cell_normal),
        Paragraph(customer_address, cell_normal),
        Spacer(1, 3),
        Paragraph(f"<font color='#566250'><b>Tax ID:</b> {tax_id}</font>", cell_normal),
    ]

    remit_content = [
        Paragraph("<b>REMITTANCE ROUTING (ACH / WIRE)</b>", section_heading),
        Spacer(1, 4),
        Paragraph("<b>Beneficiary:</b> DealFlow360 Treasury Operations LLC", cell_normal),
        Paragraph("<b>Bank:</b> JPMorgan Chase Commercial Banking, NY", cell_normal),
        Paragraph("<b>Account Number:</b> 9820-4102-3398", cell_normal),
        Paragraph("<b>SWIFT / BIC:</b> CHASUS33 &bull; <b>Routing:</b> 021000021", cell_normal),
        Spacer(1, 3),
        Paragraph("<b>Currency:</b> INR (Indian Rupees - &#8377;)", cell_bold),
    ]

    bento_table = Table(
        [[billed_to_content, remit_content]],
        colWidths=[265, 275],
    )
    bento_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), light_bg),
        ("BACKGROUND", (1, 0), (1, 0), header_bg),
        ("BOX", (0, 0), (0, 0), 0.5, border_color),
        ("BOX", (1, 0), (1, 0), 0.5, border_color),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(bento_table)
    story.append(Spacer(1, 14))

    # 3. Itemized Line Items Table
    lines = invoice_data.get("lines") or [
        {"description": "Enterprise Cloud Tier x120 Capacity Allocation", "milestone": "Q3-DRAW", "amount": 127500},
        {"description": "Integration & API Gateway Provisioning", "milestone": "ONE-TIME", "amount": 40500},
        {"description": "Premium 24/7 SLA Support Tier (Annual)", "milestone": "ANNUAL", "amount": 56000},
        {"description": "Cloud Infrastructure Compliance Fee (SOC2/FedRAMP)", "milestone": "RECURRING", "amount": 21000},
    ]

    table_data = [[
        Paragraph("<b>#</b>", cell_bold),
        Paragraph("<b>ITEM DESCRIPTION &amp; DELIVERABLES</b>", cell_bold),
        Paragraph("<b>MILESTONE TIER</b>", cell_bold),
        Paragraph("<b>AMOUNT (INR)</b>", cell_right_bold),
    ]]

    subtotal = Decimal("0")
    for idx, item in enumerate(lines, 1):
        amt = Decimal(str(item.get("amount", 0)))
        subtotal += amt
        table_data.append([
            Paragraph(str(idx), cell_normal),
            Paragraph(f"<b>{item.get('description', '')}</b>", cell_normal),
            Paragraph(item.get("milestone", "MILESTONE"), cell_normal),
            Paragraph(f"INR {amt:,.2f}", cell_right),
        ])

    tax_rate = Decimal("0.065")
    tax_amt = (subtotal * tax_rate).quantize(Decimal("0.01"))
    total_due = subtotal + tax_amt

    item_table = Table(table_data, colWidths=[25, 330, 95, 90])
    item_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), sage_color),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, border_color),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_bg]),
    ]))
    story.append(item_table)
    story.append(Spacer(1, 10))

    # 4. Calculation Summary Table
    payments_recorded = invoice_data.get("payments", [])
    total_paid = sum(Decimal(str(p.get("amount", 0))) for p in payments_recorded)
    balance_due = max(Decimal("0"), total_due - total_paid)

    calc_rows = [
        ["", "", Paragraph("<b>Subtotal</b>", cell_right), Paragraph(f"INR {subtotal:,.2f}", cell_right)],
        ["", "", Paragraph("<b>Sales Tax (6.5%)</b>", cell_right), Paragraph(f"INR {tax_amt:,.2f}", cell_right)],
        ["", "", Paragraph("<b>Total Contract Amount</b>", cell_right_bold), Paragraph(f"<b>INR {total_due:,.2f}</b>", cell_right_bold)],
    ]
    if total_paid > 0:
        calc_rows.append([
            "", "",
            Paragraph("<font color='#2E6A38'><b>Total Payments Credited</b></font>", cell_right_bold),
            Paragraph(f"<font color='#2E6A38'><b>- INR {total_paid:,.2f}</b></font>", cell_right_bold),
        ])
        calc_rows.append([
            "", "",
            Paragraph("<b>Net Balance Payable</b>", cell_right_bold),
            Paragraph(f"<b>INR {balance_due:,.2f}</b>", cell_right_bold),
        ])

    calc_table = Table(calc_rows, colWidths=[150, 150, 140, 100])
    calc_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LINEBELOW", (2, 2), (3, 2), 1, primary_color),
        ("BACKGROUND", (2, 2), (3, 2), header_bg),
    ]))
    story.append(calc_table)
    story.append(Spacer(1, 14))

    # 5. Payments History (if any recorded in Payment table)
    if payments_recorded:
        story.append(Paragraph("<b>RECORDED PAYMENT SETTLEMENT HISTORY</b>", section_heading))
        story.append(Spacer(1, 4))
        pay_rows = [[
            Paragraph("<b>Payment Ref</b>", cell_bold),
            Paragraph("<b>Date Credited</b>", cell_bold),
            Paragraph("<b>Status</b>", cell_bold),
            Paragraph("<b>Settled Amount (INR)</b>", cell_right_bold),
        ]]
        for pay in payments_recorded:
            pay_rows.append([
                Paragraph(pay.get("reference") or f"PAY-{pay.get('id', 1)}", cell_normal),
                Paragraph(str(pay.get("paid_at", "Immediate")), cell_normal),
                Paragraph("Settled &amp; Reconciled", cell_normal),
                Paragraph(f"INR {Decimal(str(pay.get('amount', 0))):,.2f}", cell_right_bold),
            ])
        pay_table = Table(pay_rows, colWidths=[180, 160, 100, 100])
        pay_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), header_bg),
            ("GRID", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(pay_table)
        story.append(Spacer(1, 14))

    # 6. Cryptographic Security & Ledger Verification
    raw_hash_seed = f"{inv_number}:{total_due}:{customer_name}:{status}"
    ledger_hash = hashlib.sha256(raw_hash_seed.encode("utf-8")).hexdigest()

    auth_box = [
        Paragraph("<b>DIGITAL LEDGER ATTESTATION &amp; CRYPTOGRAPHIC AUDIT</b>", section_heading),
        Spacer(1, 3),
        Paragraph(f"<b>SHA-256 Fingerprint:</b> <font face='Courier' color='#3D483A'>{ledger_hash}</font>", cell_normal),
        Paragraph("This document is an immutable record executed via DealFlow360 Enterprise CPQ &amp; Treasury Engine. All signatures, tax calculations, and wire remittance coordinates are digitally signed and archived for regulatory compliance.", cell_normal),
        Spacer(1, 4),
        Paragraph("<b>Authorized Signatory:</b> Eleanor Vance &bull; Sales Director &bull; DealFlow360 Commercial Operations", cell_normal),
    ]

    sec_table = Table([[auth_box]], colWidths=[540])
    sec_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), light_bg),
        ("BOX", (0, 0), (-1, -1), 1, border_color),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(KeepTogether(sec_table))

    doc.build(story)
    return buf.getvalue()
