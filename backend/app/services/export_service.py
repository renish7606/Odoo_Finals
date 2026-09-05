import csv
from io import StringIO
from typing import List, Dict, Any

def export_to_xls(data: List[Dict[str, Any]]) -> str:
    """
    Mock XLS export: returns a CSV string that masquerades as an Excel-compatible format.
    """
    if not data:
        return ""
        
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    
    return output.getvalue()


def export_to_pdf(data: List[Dict[str, Any]]) -> str:
    """
    Mock PDF export: returns a simple string representation.
    """
    if not data:
        return "No data for PDF"
        
    lines = ["--- REPORT PDF MOCK ---"]
    for row in data:
        lines.append(str(row))
    lines.append("-----------------------")
    return "\n".join(lines)
