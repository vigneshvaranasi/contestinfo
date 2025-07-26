import pandas as pd
import json

# Load the Excel file
file_path = "D:/Github Repositories/contestinfo/xlsx-json/coding_platform_20batch.xlsx"
df = pd.read_excel(file_path, sheet_name=0)

# Rename columns for clarity
df = df.rename(columns={
    "Roll Number": "rollNo",
    "Name of the Student /  Linkedin": "name",
    "HackerRank (HR)": "hackerrank",
    "LeetCode (LC)": "leetcode",
    "InterviewBit (IB)": "interviewbit",
    "CodeChef (CC)": "codechef",
    "Codeforces (CF)": "codeforces",
    "Spoj (S)": "spoj"
})

# Drop unnecessary columns like "S. No."
df = df.drop(columns=["S. No."])

# Reset index
df.reset_index(drop=True, inplace=True)

# Format each row
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

# Apply formatting
formatted_data = [to_custom_format(row) for _, row in df.iterrows()]

# Export to JSON
output_path = "formatted_output.json"
with open(output_path, "w") as f:
    json.dump(formatted_data, f, indent=2)

print(f"Data exported to {output_path}")
