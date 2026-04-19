from pdf_to_text import read_pdf
from clean_text import clean_text
from chunk_text import chunk_text
from save_with_metadata import save_chunks

pdf_path = "data/raw_pdfs/malaria_guidelines.pdf"
pdf_name = "malaria_guidelines.pdf"
guideline_type = "malaria"

pages = read_pdf(pdf_path)

for page_number, page_text in enumerate(pages, start=1):
    cleaned = clean_text(page_text)
    chunks = chunk_text(cleaned)
    save_chunks(chunks, pdf_name, guideline_type, page_number)
