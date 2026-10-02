import os
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

chunks = glob.glob('frontend/.next/static/chunks/**/*.js', recursive=True)
all_js = ' '.join(open(c, 'r', encoding='utf-8', errors='ignore').read() for c in chunks)

checks = [
    ("Detailed UV Index Graph", "Solar UV Index 24-Hour Profile"),
    ("WHO UV Scale Legend", "WHO Global UV Scale"),
    ("Color-Coded Graphs", "Detailed Meteorological Analytics"),
    ("Event Planner Sunlight", "Daylight & Solar Schedule"),
    ("Visibility Intelligence", "Atmospheric Visibility Intelligence"),
    ("Citizen Roles (Commuter/Delivery)", "Daily Commuter"),
    ("Allergy Outlook & Triggers", "Environmental Allergy & Sensitivity Outlook"),
    ("Non-Medical Disclaimer", "Non-Medical Disclaimer: This guidance is based on atmospheric telemetry and does not constitute medical advice."),
    ("Pollen Unavailable Notice", "Pollen data unavailable for this location"),
    ("Help & Report Modal", "National Weather Assistance & Feedback"),
    ("Feedback 0/500 Char Counter", "characters remaining"),
    ("Emergency Numbers (112, 1078, etc.)", "National Emergency Helpline"),
    ("Multi-language (Hindi)", "राष्ट्रीय मौसम विज्ञान इंटेलिजेंस पोर्टल"),
    ("Multi-language (Marathi)", "राष्ट्रीय हवामान बुद्धिमत्ता पोर्टल")
]

print(f"Inspecting {len(chunks)} compiled client bundles ({len(all_js):,} bytes):")
all_passed = True
for name, query in checks:
    found = query in all_js
    status = "✓" if found else "✗"
    print(f"{status} {name}: {'Found' if found else 'NOT FOUND'}")
    if not found:
        all_passed = False

if all_passed:
    print("\nALL 8 FEATURES CONFIRMED COMPILED AND BUNDLED IN FRONTEND PRODUCTION CODE!")
else:
    print("\nSome components were not found in bundles.")
