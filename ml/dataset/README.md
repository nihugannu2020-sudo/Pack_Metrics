# ML Declaration Dataset

This dataset is intentionally synthetic and designed to teach a declaration-type classifier, not to replace official legal source material.

## Purpose

- Separate legal knowledge from ML declaration classification.
- Train a lightweight text classifier to predict the likely label of an OCR snippet.
- Prevent irrelevant strings such as model names or Bluetooth versions from being treated as legal declarations.

## Legal source ground truth

The legal rule knowledge is sourced from the official Department of Consumer Affairs legal metrology pages, especially:

- Legal Metrology Act, 2009
- Legal Metrology (Packaged Commodities) Rules, 2011
- official amendments and advisories listed on https://consumeraffairs.gov.in/pages/legal-metrology-act

## Dataset source

- Synthetic declaration templates generated from legal declaration categories.
- Realistic variants of legal strings mixed with negative examples.
- Not government-provided training data.

## Class definitions

- MANUFACTURER
- PACKER
- IMPORTER
- ADDRESS
- COUNTRY_OF_ORIGIN
- COMMODITY_NAME
- NET_QUANTITY
- MRP
- MFG_DATE
- PACKING_DATE
- IMPORT_DATE
- CONSUMER_CARE
- PHONE
- EMAIL
- BEST_BEFORE
- USE_BY
- DIMENSIONS
- UNIT_SALE_PRICE
- TECHNICAL_SPECIFICATION
- MODEL_NUMBER
- SERIAL_NUMBER
- EAN_BARCODE
- MARKETING_TEXT
- WARRANTY
- WEBSITE
- RANDOM_NUMBER
- OTHER

## Training date

- Generated on: 2026-09-16

## Model version

- rule-backed declaration classifier v1.0
