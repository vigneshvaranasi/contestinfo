import pandas as pd
import json

# Load the Excel file
file_path = "D:/Github Repositories/contestinfo/xlsx-json/27.xlsx"  # Replace with your actual path
df = pd.read_excel(file_path, sheet_name=0)

# Clean header row if needed (if your first row contains headers again)
if df.columns.str.contains("Username", case=False).any():
    df = df.iloc[1:]

# Rename columns for consistency (modify based on your actual Excel headings)
df.columns = [
    "rollNo", "name", "username", "hackerrank", "leetcode",
    "interviewbit", "codechef", "codeforces", "spoj"
]

# Reset index
df.reset_index(drop=True, inplace=True)

# Format each row to match your required structure
def to_custom_format(row):
    return {
        "rollNo": row["rollNo"],
        "name": row["name"],
        "branch": "CSE",
        "year": 2025,
        "leetcode": {"username": row["leetcode"]},
        "codechef": {"username": row["codechef"]},
        "codeforces": {"username": row["codeforces"]},
        "interviewbit": {"username": row["interviewbit"]},
        "hackerrank": row["hackerrank"],
        "spoj": row["spoj"]
    }

# Apply transformation
formatted_data = [to_custom_format(row) for _, row in df.iterrows()]

# Save to JSON file
with open("formatted_output.json", "w") as f:
    json.dump(formatted_data, f, indent=2)

print("Data exported to formatted_output.json")
