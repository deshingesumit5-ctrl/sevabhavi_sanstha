package com.SevabhaviSanstha.util;

import com.lowagie.text.pdf.BaseFont;
import java.io.File;
import java.io.InputStream;

public class PdfFontUtil {

    public static BaseFont loadDevanagariBaseFont(boolean bold) {
        try {
            // First try loading Nirmala font (clean sans-serif Devanagari UI font for standard text rendering)
            String fontResource = bold ? "/fonts/NirmalaB.ttf" : "/fonts/Nirmala.ttf";
            InputStream fontStream = PdfFontUtil.class.getResourceAsStream(fontResource);
            String fontName = bold ? "NirmalaB.ttf" : "Nirmala.ttf";

            if (fontStream == null) {
                fontStream = PdfFontUtil.class.getResourceAsStream("/fonts/Nirmala.ttf");
                fontName = "Nirmala.ttf";
            }
            if (fontStream == null) {
                fontStream = PdfFontUtil.class.getResourceAsStream(bold ? "/fonts/mangalb.ttf" : "/fonts/mangal.ttf");
                fontName = bold ? "mangalb.ttf" : "mangal.ttf";
            }
            if (fontStream == null) {
                fontStream = PdfFontUtil.class.getResourceAsStream("/fonts/mangal.ttf");
                fontName = "mangal.ttf";
            }
            if (fontStream != null) {
                byte[] fontBytes = fontStream.readAllBytes();
                return BaseFont.createFont(fontName, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null);
            }

            // Fallback to system fonts on Windows or Linux
            String[] systemFontPaths = bold ? new String[]{
                    "C:/Windows/Fonts/NirmalaB.ttf",
                    "C:/Windows/Fonts/Nirmala.ttf",
                    "C:/Windows/Fonts/mangalb.ttf",
                    "C:/Windows/Fonts/mangal.ttf",
                    "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf",
                    "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf"
            } : new String[]{
                    "C:/Windows/Fonts/Nirmala.ttf",
                    "C:/Windows/Fonts/mangal.ttf",
                    "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf",
                    "/usr/share/fonts/truetype/freefont/FreeSans.ttf"
            };

            for (String fontPath : systemFontPaths) {
                File file = new File(fontPath);
                if (file.exists()) {
                    return BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                }
            }

            return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            try {
                return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            } catch (Exception ex) {
                throw new RuntimeException("Could not load any PDF base font", ex);
            }
        }
    }

    public static com.lowagie.text.Image createDevanagariImage(String text, float fontSizePt, boolean bold, java.awt.Color color) {
        return createDevanagariImage(text, fontSizePt, bold, color, 0f);
    }

    public static com.lowagie.text.Image createDevanagariImage(String text, float fontSizePt, boolean bold, java.awt.Color color, float maxPtWidth) {
        if (text == null || text.trim().isEmpty()) {
            text = "-";
        }
        float scale = 4.0f; // High DPI 4x scale factor
        float fontPx = fontSizePt * scale;
        java.awt.Font awtFont = loadAwtFont(bold, fontPx);

        java.awt.image.BufferedImage dummy = new java.awt.image.BufferedImage(1, 1, java.awt.image.BufferedImage.TYPE_INT_ARGB);
        java.awt.Graphics2D g2 = dummy.createGraphics();
        g2.setRenderingHint(java.awt.RenderingHints.KEY_TEXT_ANTIALIASING, java.awt.RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2.setRenderingHint(java.awt.RenderingHints.KEY_FRACTIONALMETRICS, java.awt.RenderingHints.VALUE_FRACTIONALMETRICS_ON);
        g2.setFont(awtFont);
        java.awt.FontMetrics fm = g2.getFontMetrics();

        float maxPxWidth = maxPtWidth > 0 ? maxPtWidth * scale : 0f;

        java.util.List<String> finalLines = new java.util.ArrayList<>();
        String[] originalParagraphs = text.split("\n");

        for (String para : originalParagraphs) {
            if (para.isEmpty()) {
                finalLines.add("");
                continue;
            }
            if (maxPxWidth <= 0 || fm.stringWidth(para) <= maxPxWidth) {
                finalLines.add(para);
            } else {
                String[] words = para.split(" ");
                StringBuilder currentLine = new StringBuilder();
                for (String word : words) {
                    if (currentLine.length() == 0) {
                        currentLine.append(word);
                    } else {
                        String testLine = currentLine + " " + word;
                        if (fm.stringWidth(testLine) <= maxPxWidth) {
                            currentLine.append(" ").append(word);
                        } else {
                            finalLines.add(currentLine.toString());
                            currentLine = new StringBuilder(word);
                        }
                    }
                }
                if (currentLine.length() > 0) {
                    finalLines.add(currentLine.toString());
                }
            }
        }
        g2.dispose();

        String[] lines = finalLines.toArray(new String[0]);

        int maxLineWidth = 0;
        for (String line : lines) {
            int w = fm.stringWidth(line);
            if (w > maxLineWidth) {
                maxLineWidth = w;
            }
        }
        int textAscent = fm.getAscent();
        int textDescent = fm.getDescent();
        int lineHeight = textAscent + textDescent + fm.getLeading();
        int totalHeight = lineHeight * lines.length;

        int padX = 8;
        int padY = 8;
        int imgWidth = Math.max(1, maxLineWidth + padX * 2);
        int imgHeight = Math.max(1, totalHeight + padY * 2);

        java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(imgWidth, imgHeight, java.awt.image.BufferedImage.TYPE_INT_ARGB);
        java.awt.Graphics2D g = img.createGraphics();
        g.setRenderingHint(java.awt.RenderingHints.KEY_TEXT_ANTIALIASING, java.awt.RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(java.awt.RenderingHints.KEY_FRACTIONALMETRICS, java.awt.RenderingHints.VALUE_FRACTIONALMETRICS_ON);
        g.setFont(awtFont);
        g.setColor(color != null ? color : java.awt.Color.BLACK);

        int currentY = padY + textAscent;
        for (String line : lines) {
            g.drawString(line, padX, currentY);
            currentY += lineHeight;
        }
        g.dispose();

        try {
            com.lowagie.text.Image itextImg = com.lowagie.text.Image.getInstance(img, null);
            itextImg.scalePercent(100f / scale);
            return itextImg;
        } catch (Exception e) {
            throw new RuntimeException("Error rendering Devanagari text image", e);
        }
    }

    private static java.awt.Font loadAwtFont(boolean bold, float sizePx) {
        try {
            String fontPath = bold ? "/fonts/NirmalaB.ttf" : "/fonts/Nirmala.ttf";
            InputStream is = PdfFontUtil.class.getResourceAsStream(fontPath);
            if (is == null) {
                fontPath = "/fonts/Nirmala.ttf";
                is = PdfFontUtil.class.getResourceAsStream(fontPath);
            }
            if (is == null) {
                fontPath = bold ? "/fonts/mangalb.ttf" : "/fonts/mangal.ttf";
                is = PdfFontUtil.class.getResourceAsStream(fontPath);
            }
            if (is != null) {
                java.awt.Font f = java.awt.Font.createFont(java.awt.Font.TRUETYPE_FONT, is);
                return f.deriveFont(bold ? java.awt.Font.BOLD : java.awt.Font.PLAIN, sizePx);
            }
        } catch (Exception e) {
            // fallback to system font
        }
        return new java.awt.Font("Nirmala UI", bold ? java.awt.Font.BOLD : java.awt.Font.PLAIN, (int) sizePx);
    }
}
