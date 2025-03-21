import io
import os
from typing import Annotated
from fastapi import UploadFile
from fastapi.responses import StreamingResponse
from pypdf import PdfReader
from docx import Document
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

        docx_content = await file.read()

        temp_docx_path = "/tmp/temp_file.docx"
        with open(temp_docx_path, 'wb') as f:
            f.write(docx_content)


        pdf_path = "/tmp/temp_file.pdf"
        pypandoc.convert_file(temp_docx_path, 'pdf', outputfile=pdf_path)

        # Open the converted PDF as a binary stream
        with open(pdf_path, "rb") as pdf_file:
            pdf_content = io.BytesIO(pdf_file.read())

        # Clean up temporary files
        os.remove(temp_docx_path)
        os.remove(pdf_path)

        reader = PdfReader(pdf_content)
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

        
    async def plain_text_handler(self, file: UploadFile):
        assert file.filename is not None, "File does not exist"

        contents = await file.read()

        text = contents.decode("utf-8").splitlines()
        page_content = {
            "file_name": file.filename,
            "pages" : []
        }

        for i in range(0, len(text), 500):
            page_content["pages"].append({
                "page_number": i // 500 + 1,
                "page_content": "\n".join(text[i:i + 500])
            })

        return page_content


        




