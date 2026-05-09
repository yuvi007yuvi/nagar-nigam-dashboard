
import json
import os

# Load the vehicles from the output file
output_file = r'C:\Users\yuvra\AppData\Local\Temp\nnmv-dashboard-vehicles.json'
# I need to get the actual path from the previous tool output
# Actually I'll just read the file I viewed earlier
# The path was C:\Users\yuvra\.gemini\antigravity\brain\1953e74c-6edb-40b9-95ce-f05cc1464acf\.system_generated\steps\18\output.txt

path = r'C:\Users\yuvra\.gemini\antigravity\brain\1953e74c-6edb-40b9-95ce-f05cc1464acf\.system_generated\steps\18\output.txt'

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

vehicles = data.get('documents', [])

seen_plates = {} # plate -> [doc_names]
seen_names = {} # name -> [doc_names]
seen_imeis = {} # imei -> [doc_names]

duplicates = []

for v in vehicles:
    doc_name = v['name']
    fields = v['fields']
    
    plate = fields.get('plateNumber', {}).get('stringValue', '').strip()
    name = fields.get('name', {}).get('stringValue', '').strip()
    imei = fields.get('imei', {}).get('stringValue', '').strip()
    
    if plate:
        if plate in seen_plates:
            seen_plates[plate].append(doc_name)
        else:
            seen_plates[plate] = [doc_name]
            
    if name:
        if name in seen_names:
            seen_names[name].append(doc_name)
        else:
            seen_names[name] = [doc_name]
            
    if imei:
        if imei in seen_imeis:
            seen_imeis[imei].append(doc_name)
        else:
            seen_imeis[imei] = [doc_name]

# Identify duplicates
to_delete = set()

# If multiple docs have same plate, keep the most recently updated one (or just first one for now)
for plate, docs in seen_plates.items():
    if len(docs) > 1:
        print(f"Duplicate Plate: {plate} -> {docs}")
        # Keep the first one, delete rest
        for d in docs[1:]:
            to_delete.add(d)

for name, docs in seen_names.items():
    if len(docs) > 1:
        # Check if we already marked these for deletion or if they are duplicates by name
        # Only consider it a duplicate if plate is empty for these docs
        # Actually, if the name is the same and they are separate documents, they are likely duplicates
        print(f"Duplicate Name: {name} -> {docs}")
        # Keep the first one, delete rest
        for d in docs[1:]:
            to_delete.add(d)

for imei, docs in seen_imeis.items():
    if len(docs) > 1:
        print(f"Duplicate IMEI: {imei} -> {docs}")
        for d in docs[1:]:
            to_delete.add(d)

print(f"\nTotal unique documents to delete: {len(to_delete)}")
for d in sorted(list(to_delete)):
    print(d)
