from datasets import load_dataset
from PIL import Image
import pandas as pd
from pathlib import Path
from tqdm import tqdm
import random
import shutil


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_NAME = "huaweilin/waste-classification"

OUTPUT_DIR = Path("WasteLoop_Dataset")

# Maximum number of images for EACH WasteLoop class
MAX_IMAGES_PER_CLASS = 100

# Resize images to keep storage low
IMAGE_SIZE = (224, 224)

# JPEG quality
JPEG_QUALITY = 80

# Reproducibility
random.seed(42)


# ============================================================
# WASTELOOP TREATMENT MAPPING
# ============================================================

TREATMENT_MAP = {

    # -------------------------
    # REUSE
    # -------------------------
    "clothes": "REUSE",
    "shoes": "REUSE",

    # -------------------------
    # RECYCLE
    # -------------------------
    "plastic_bottles": "RECYCLE",
    "paper_products": "RECYCLE",
    "glass_containers": "RECYCLE",
    "cans_all_type": "RECYCLE",

    # -------------------------
    # RECOVER
    # -------------------------
    "batteries": "RECOVER",
    "e-waste": "RECOVER",
    "paints": "RECOVER",
    "pesticides": "RECOVER",

    # -------------------------
    # DECOMPOSE
    # -------------------------
    "food_scraps": "DECOMPOSE",
    "kitchen_waste": "DECOMPOSE",
    "yard_trimmings": "DECOMPOSE",
    "egg_shells": "DECOMPOSE",
    "coffee_tea_bags": "DECOMPOSE",

    # -------------------------
    # DISPOSE
    # -------------------------
    "diapers": "DISPOSE",
    "sanitary_napkin": "DISPOSE",
    "platics_bags_wrapped": "DISPOSE",
    "stroform_product": "DISPOSE",
    "ceramic_product": "DISPOSE",
}


# ============================================================
# CREATE OUTPUT DIRECTORIES
# ============================================================

print("\nCreating WasteLoop dataset folders...\n")

for treatment in [
    "REUSE",
    "RECYCLE",
    "RECOVER",
    "DECOMPOSE",
    "DISPOSE"
]:
    (OUTPUT_DIR / treatment).mkdir(
        parents=True,
        exist_ok=True
    )


# ============================================================
# DOWNLOAD DATASET
# ============================================================

print("Downloading/loading dataset...")
print("This may take some time the first time.\n")

dataset = load_dataset(
    DATASET_NAME,
    split="cleaned"
)

print("Dataset loaded successfully!")
print("Total source images:", len(dataset))


# ============================================================
# CHECK AVAILABLE SUBCLASSES
# ============================================================

print("\nAvailable subclasses:")

subclasses = sorted(
    set(dataset["subclass"])
)

for subclass in subclasses:
    print("  -", subclass)


# ============================================================
# GROUP IMAGES BY TREATMENT
# ============================================================

grouped = {
    "REUSE": [],
    "RECYCLE": [],
    "RECOVER": [],
    "DECOMPOSE": [],
    "DISPOSE": []
}


for index, row in enumerate(dataset):

    subclass = row["subclass"]

    if subclass in TREATMENT_MAP:

        treatment = TREATMENT_MAP[subclass]

        grouped[treatment].append(
            (index, row)
        )


# ============================================================
# DISPLAY AVAILABLE COUNTS
# ============================================================

print("\nImages available after mapping:")

for treatment, items in grouped.items():

    print(
        f"{treatment:12s}: {len(items)} images"
    )


# ============================================================
# SAVE IMAGES + CSV METADATA
# ============================================================

records = []

print("\nCreating WasteLoop dataset...\n")


for treatment, items in grouped.items():

    # Shuffle images
    random.shuffle(items)

    # Limit dataset size
    selected_items = items[
        :MAX_IMAGES_PER_CLASS
    ]

    print(
        f"{treatment}: selecting "
        f"{len(selected_items)} images"
    )

    for count, (index, row) in enumerate(
        tqdm(
            selected_items,
            desc=treatment
        )
    ):

        image = row["image"]

        # Convert image to RGB
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize
        image = image.resize(
            IMAGE_SIZE,
            Image.Resampling.LANCZOS
        )

        # Generate filename
        filename = (
            f"{treatment.lower()}_"
            f"{count:04d}.jpg"
        )

        output_path = (
            OUTPUT_DIR
            / treatment
            / filename
        )

        # Save compressed image
        image.save(
            output_path,
            "JPEG",
            quality=JPEG_QUALITY,
            optimize=True
        )

        # Store metadata
        records.append({

            "image": str(
                output_path
            ),

            "source_subclass":
                row["subclass"],

            "original_class":
                row["class"],

            "treatment":
                treatment,

            "filename":
                filename
        })


# ============================================================
# CREATE CSV
# ============================================================

df = pd.DataFrame(records)

csv_path = (
    OUTPUT_DIR
    / "wasteloop_labels.csv"
)

df.to_csv(
    csv_path,
    index=False
)


# ============================================================
# CREATE SUMMARY
# ============================================================

summary_path = (
    OUTPUT_DIR
    / "dataset_summary.txt"
)

with open(
    summary_path,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "WasteLoop Treatment Dataset\n"
    )

    file.write(
        "===========================\n\n"
    )

    file.write(
        f"Total images: {len(df)}\n\n"
    )

    file.write(
        "Class distribution:\n"
    )

    for treatment in [
        "REUSE",
        "RECYCLE",
        "RECOVER",
        "DECOMPOSE",
        "DISPOSE"
    ]:

        count = len(
            df[
                df["treatment"]
                == treatment
            ]
        )

        file.write(
            f"{treatment}: {count}\n"
        )


# ============================================================
# FINAL REPORT
# ============================================================

print("\n")
print("=" * 55)
print("       WASTELOOP DATASET CREATED")
print("=" * 55)

print(
    f"\nTotal images: {len(df)}"
)

print("\nClass distribution:")

for treatment in [
    "REUSE",
    "RECYCLE",
    "RECOVER",
    "DECOMPOSE",
    "DISPOSE"
]:

    count = len(
        df[
            df["treatment"]
            == treatment
        ]
    )

    print(
        f"  {treatment:12s} → {count}"
    )


print(
    "\nDataset location:"
)

print(
    OUTPUT_DIR.resolve()
)

print(
    "\nCSV:"
)

print(
    csv_path.resolve()
)

print(
    "\nDone!"
)
print("WASTELOOP SCRIPT IS RUNNING")
input("Press Enter to close...")