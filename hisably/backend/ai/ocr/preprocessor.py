"""Image preprocessing for OCR pipeline."""

import tempfile

import cv2
import fitz
import numpy as np


def preprocess_image(image_path: str) -> str:
    """Apply deskew, denoise, and contrast enhancement to an image and return the processed path."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    blurred = cv2.GaussianBlur(gray, (3, 3), 0)

    sharpened = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)

    _, thresh = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) > 5:
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]
        if angle < -45:
            angle = 90 + angle
        if abs(angle) > 0.5:
            h, w = sharpened.shape
            center = (w // 2, h // 2)
            matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            sharpened = cv2.warpAffine(
                sharpened, matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
            )

    out = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    cv2.imwrite(out.name, sharpened)
    return out.name


def is_digital_pdf(file_path: str) -> bool:
    """Check whether a PDF contains extractable text or is a scanned image."""
    doc = fitz.open(file_path)
    if len(doc) == 0:
        doc.close()
        return False
    text = doc[0].get_text()
    doc.close()
    return len(text.strip()) > 50
