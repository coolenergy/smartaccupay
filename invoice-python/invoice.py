from textract import create_textract, analyze_invoice, get_summary, get_table
from csv_embed import embeding

textract = create_textract('us-east-1', 'AKIAZZW3P4QFF5Y3VKGP', '9SNwrgFXCFKVEdv9DEjlvpCGpxQtRonaoVWaNAxw')
response = analyze_invoice(textract, "s3-store-camera-frame", "7.pdf")
get_summary(response)
get_table(response)

embeding("./CSV/index.csv")