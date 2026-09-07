package com.dyora.document;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class PdfExtractionService {

    public ExtractedDocument extract(MultipartFile file) {
        String fileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();

        try {
            if (fileName.endsWith(".pdf")) {
                return extractPdf(file);
            } else if (fileName.endsWith(".docx")) {
                return extractDocx(file);
            } else if (fileName.endsWith(".txt")) {
                return extractTxt(file);
            }
            throw new DocumentParsingException("Unsupported file type. Please upload PDF, DOCX or TXT.");
        } catch (DocumentParsingException e) {
            throw e;
        } catch (Exception e) {
            throw new DocumentParsingException("Could not read the uploaded file. It may be corrupted or password protected.", e);
        }
    }

    private ExtractedDocument extractPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.isEncrypted()) {
                throw new DocumentParsingException("This PDF is password-protected. Please upload an unlocked file.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return new ExtractedDocument(text, document.getNumberOfPages());
        }
    }

    private ExtractedDocument extractDocx(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            int approxPages = Math.max(1, text.length() / 3000);
            return new ExtractedDocument(text, approxPages);
        }
    }

    private ExtractedDocument extractTxt(MultipartFile file) throws IOException {
        String text = new String(file.getBytes(), StandardCharsets.UTF_8);
        int approxPages = Math.max(1, text.length() / 3000);
        return new ExtractedDocument(text, approxPages);
    }
}
