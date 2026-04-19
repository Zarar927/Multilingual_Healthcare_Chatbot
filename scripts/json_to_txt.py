import json
import os

INPUT_FILE = "data/linguistic_data/raw/medical_chat.json"
OUTPUT_FILE = "data/linguistic_data/raw/medical_chat.txt"


def main():

    # Check if JSON file exists
    if not os.path.exists(INPUT_FILE):
        print("❌ JSON file not found:", INPUT_FILE)
        return

    # Load JSON
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Create TXT file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:

        # Your JSON uses "diseases"
        for item in data["diseases"]:

            name = item.get("name", "")
            description = item.get("description", "")
            symptoms = ", ".join(item.get("symptoms", []))
            treatments = ", ".join(item.get("treatments", []))

            out.write(f"Disease: {name}\n")
            out.write(f"Description: {description}\n")
            out.write(f"Symptoms: {symptoms}\n")
            out.write(f"Treatments: {treatments}\n")
            out.write("\n----------------------\n\n")

    print("✅ JSON converted to TXT successfully")


if __name__ == "__main__":
    main()
