from io import BytesIO
from docx import Document
import os
from fastapi import UploadFile
from pypdf import PdfReader
import pypandoc


class CustomFileHandler():
    def pdf_handler(self, file: UploadFile):
        assert file.filename is not None, "File does not exist"

        reader = PdfReader(file.file)
        page_content = {
            "file_name": file.filename,
            "pages" : []
        }

        for i, page in enumerate(reader.pages):
            page_content["pages"].append({
                "page_number": i + 1,
                "page_content": page.extract_text()
            })

        return page_content
    
    async def docx_handler(self, file: UploadFile):
        assert file.filename is not None, "File does not exist"

        contents = await file.read()
        
        file_stream = BytesIO(contents)

        document = Document(file_stream)

        text = "\n".join([para.text for para in document.paragraphs])

        page_content = {
            "file_name": file.filename,
            "pages" : []
        }

        for i in range(0, len(text), 2000):
            page_content["pages"].append({
                "page_number": (i // 2000) + 1,
                "page_content": text[i:i + 2000]
            })
        
        return page_content

        
    async def plain_text_handler(self, file: UploadFile):
        assert file.filename is not None, "File does not exist"

        contents = await file.read()

        text = contents.decode("utf-8").splitlines()
        page_content = {
            "file_name": file.filename,
            "pages" : []
        }

        for i in range(0, len(text), 2000):
            page_content["pages"].append({
                "page_number": i // 2000 + 1,
                "page_content": "\n".join(text[i:i + 2000])
            })

        return page_content


        




