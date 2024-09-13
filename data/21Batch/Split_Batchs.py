import json

# Step 1: Read the JSON file
file_path = r"D:\Github Repositories\contestinfo\21.json"
with open(file_path, 'r') as file:
    data = json.load(file)

# Step 2: Determine the split points
total_length = len(data)
split_size = total_length // 4

# Step 3: Split the JSON content
part1 = data[:split_size]
part2 = data[split_size:2*split_size]
part3 = data[2*split_size:3*split_size]
part4 = data[3*split_size:]

# Step 4: Write the parts to new files
with open('data/21Batch/01.json', 'w') as file:
    json.dump(part1, file, indent=4)

with open('data/21Batch/02.json', 'w') as file:
    json.dump(part2, file, indent=4)

with open('data/21Batch/03.json', 'w') as file:
    json.dump(part3, file, indent=4)

with open('data/21Batch/04.json', 'w') as file:
    json.dump(part4, file, indent=4)
    
    
# Get Lengths of each part
print(len(part1))
print(len(part2))
print(len(part3))
print(len(part4))