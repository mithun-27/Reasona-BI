import pandas as pd
import numpy as np
from core.db import get_db_connection


def analyze_table(table_name: str) -> dict:
    """
    Auto-analyzes an uploaded table and returns Power BI-style dashboard configs:
    - kpis: key metrics with trends and goals
    - charts: bar, line, pie/donut, scatter, gauge, area, stacked bar
    - filters: slicer options for categorical columns
    - data_preview: first 10 rows
    """
    conn = get_db_connection()

    try:
        df = conn.execute(f"SELECT * FROM {table_name}").df()
    except Exception as e:
        return {"error": f"Could not read table: {str(e)}"}

    rows, cols = df.shape

    # ── Column type detection ──
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    datetime_cols = df.select_dtypes(include=["datetime", "datetimetz"]).columns.tolist()

    # Try to parse potential date columns stored as strings
    for col in categorical_cols[:]:
        try:
            parsed = pd.to_datetime(df[col], infer_datetime_format=True, errors="coerce")
            if parsed.notna().sum() > len(df) * 0.7:
                df[col] = parsed
                datetime_cols.append(col)
                categorical_cols.remove(col)
        except Exception:
            pass

    # ── KPIs (Premium) ──
    missing_pct = round(df.isnull().sum().sum() / (rows * cols) * 100, 1) if rows * cols > 0 else 0
    duplicate_rows = int(df.duplicated().sum())

    kpis = [
        {"label": "Total Records", "value": f"{rows:,}", "icon": "rows", "trend": "neutral", "subtitle": f"{cols} columns"},
        {"label": "Data Quality", "value": f"{100 - missing_pct:.1f}%", "icon": "quality", "trend": "up" if missing_pct < 5 else "down", "subtitle": f"{missing_pct}% missing"},
        {"label": "Unique Rows", "value": f"{rows - duplicate_rows:,}", "icon": "unique", "trend": "up" if duplicate_rows == 0 else "down", "subtitle": f"{duplicate_rows} duplicates"},
    ]

    # Add top numeric KPIs with computed stats
    for nc in numeric_cols[:4]:
        mean_val = df[nc].mean()
        max_val = df[nc].max()
        min_val = df[nc].min()
        if pd.notna(mean_val):
            if abs(mean_val) >= 1000000:
                display = f"{mean_val/1000000:.2f}M"
            elif abs(mean_val) >= 1000:
                display = f"{mean_val/1000:.1f}K"
            else:
                display = f"{mean_val:,.2f}"
            
            # Determine trend based on data distribution
            q1 = df[nc].quantile(0.25)
            q3 = df[nc].quantile(0.75)
            median = df[nc].median()
            trend = "up" if mean_val > median else "down" if mean_val < median else "neutral"
            
            kpis.append({
                "label": f"Avg {nc}",
                "value": display,
                "icon": "metric",
                "trend": trend,
                "subtitle": f"Range: {_format_number(min_val)} – {_format_number(max_val)}",
                "goal": _format_number(max_val)
            })

    # ── Filters (Slicers) ──
    filters = []
    for cat_col in categorical_cols[:5]:
        unique_vals = df[cat_col].dropna().unique().tolist()
        if 2 <= len(unique_vals) <= 50:
            filters.append({
                "column": cat_col,
                "values": sorted([str(v) for v in unique_vals[:30]]),
                "type": "multi-select"
            })

    # ── Chart Recommendations ──
    charts = []

    # 1. Gauge chart — first numeric column
    if numeric_cols:
        nc = numeric_cols[0]
        avg = float(df[nc].mean()) if pd.notna(df[nc].mean()) else 0
        mn = float(df[nc].min()) if pd.notna(df[nc].min()) else 0
        mx = float(df[nc].max()) if pd.notna(df[nc].max()) else 100
        charts.append({
            "title": f"Average {nc}",
            "type": "gauge",
            "value": round(avg, 2),
            "min": round(mn, 2),
            "max": round(mx, 2),
            "color": "#6d28d9"
        })

    # 2. Bar chart: categorical + numeric (top 10)
    for i, cat_col in enumerate(categorical_cols[:2]):
        if numeric_cols:
            num_col = numeric_cols[min(i, len(numeric_cols) - 1)]
            grouped = df.groupby(cat_col)[num_col].sum().nlargest(10).reset_index()
            colors = ["#6d28d9", "#0ea5e9"]
            charts.append({
                "title": f"{num_col} by {cat_col}",
                "type": "bar",
                "xKey": cat_col,
                "yKey": num_col,
                "data": _clean_records(grouped),
                "color": colors[i % len(colors)]
            })

    # 3. Donut chart: value distribution
    for cat_col in categorical_cols[:1]:
        value_counts = df[cat_col].value_counts().nlargest(8).reset_index()
        value_counts.columns = ["name", "value"]
        charts.append({
            "title": f"Distribution of {cat_col}",
            "type": "donut",
            "data": _clean_records(value_counts),
            "colors": ["#6d28d9", "#0ea5e9", "#34d399", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]
        })

    # 4. Line/Area chart: datetime + numeric
    for dt_col in datetime_cols[:1]:
        if numeric_cols:
            num_col = numeric_cols[0]
            temp = df[[dt_col, num_col]].dropna().sort_values(dt_col)
            if len(temp) > 50:
                temp = temp.set_index(dt_col).resample("W").mean().reset_index()
            temp[dt_col] = temp[dt_col].dt.strftime("%b %Y")
            
            charts.append({
                "title": f"{num_col} over Time",
                "type": "area",
                "xKey": dt_col,
                "yKey": num_col,
                "data": _clean_records(temp.head(50)),
                "color": "#0ea5e9"
            })

    # 5. Stacked bar: categorical + multiple numerics
    if categorical_cols and len(numeric_cols) >= 2:
        cat_col = categorical_cols[0]
        num_cols_subset = numeric_cols[:3]
        grouped = df.groupby(cat_col)[num_cols_subset].sum().nlargest(8, num_cols_subset[0]).reset_index()
        charts.append({
            "title": f"Breakdown by {cat_col}",
            "type": "stacked_bar",
            "xKey": cat_col,
            "yKeys": num_cols_subset,
            "data": _clean_records(grouped),
            "colors": ["#6d28d9", "#0ea5e9", "#34d399"]
        })

    # 6. Scatter plot: two numerics
    if len(numeric_cols) >= 2:
        sample = df[numeric_cols[:2]].dropna().head(100)
        charts.append({
            "title": f"{numeric_cols[0]} vs {numeric_cols[1]}",
            "type": "scatter",
            "xKey": numeric_cols[0],
            "yKey": numeric_cols[1],
            "data": _clean_records(sample),
            "color": "#34d399"
        })

    # 7. Histogram
    for nc in numeric_cols[:1]:
        hist_data = df[nc].dropna()
        if len(hist_data) > 0:
            n_bins = min(15, max(5, len(hist_data.unique())))
            try:
                counts, bin_edges = pd.cut(hist_data, bins=n_bins, retbins=True)
                hist_df = counts.value_counts().sort_index().reset_index()
                hist_df.columns = ["range", "count"]
                hist_df["range"] = hist_df["range"].astype(str)
                charts.append({
                    "title": f"Distribution of {nc}",
                    "type": "bar",
                    "xKey": "range",
                    "yKey": "count",
                    "data": _clean_records(hist_df),
                    "color": "#f59e0b"
                })
            except Exception:
                pass

    # 8. Column averages (only if no categorical columns)
    if not categorical_cols and not datetime_cols and numeric_cols:
        summary_data = []
        for nc in numeric_cols[:8]:
            m = df[nc].mean()
            summary_data.append({"column": nc, "mean": round(m, 2) if pd.notna(m) else 0})
        charts.append({
            "title": "Column Averages Overview",
            "type": "bar",
            "xKey": "column",
            "yKey": "mean",
            "data": summary_data,
            "color": "#8b5cf6"
        })

    # ── Data Preview ──
    preview_df = df.head(10).copy()
    for col in preview_df.columns:
        if preview_df[col].dtype == 'datetime64[ns]' or preview_df[col].dtype == 'datetime64[ns, UTC]':
            preview_df[col] = preview_df[col].astype(str)
    preview = preview_df.fillna("").to_dict(orient="records")
    column_names = df.columns.tolist()

    # ── Columns Info ──
    columns_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if col in numeric_cols:
            col_type = "numeric"
        elif col in datetime_cols:
            col_type = "datetime"
        else:
            col_type = "categorical"
        columns_info.append({"name": col, "dtype": dtype, "type": col_type, "missing": int(df[col].isnull().sum())})

    # ── Dashboard title ──
    dashboard_title = table_name.replace("data_", "").replace("_", " ").title() + " Analytics Dashboard"

    return {
        "table_name": table_name,
        "dashboard_title": dashboard_title,
        "kpis": kpis,
        "charts": charts,
        "filters": filters,
        "data_preview": preview,
        "column_names": column_names,
        "columns_info": columns_info,
        "row_count": rows,
        "col_count": cols
    }


def _format_number(val) -> str:
    """Format a number for display."""
    if pd.isna(val):
        return "N/A"
    if abs(val) >= 1000000:
        return f"{val/1000000:.2f}M"
    elif abs(val) >= 1000:
        return f"{val/1000:.1f}K"
    elif isinstance(val, float):
        return f"{val:,.2f}"
    return f"{val:,}"


def _clean_records(df: pd.DataFrame) -> list:
    """Convert DataFrame to list of dicts with JSON-safe values."""
    records = df.to_dict(orient="records")
    cleaned = []
    for record in records:
        clean = {}
        for k, v in record.items():
            if pd.isna(v):
                clean[k] = 0
            elif isinstance(v, (np.integer,)):
                clean[k] = int(v)
            elif isinstance(v, (np.floating,)):
                clean[k] = round(float(v), 2)
            else:
                clean[k] = v
        cleaned.append(clean)
    return cleaned
