import { Template } from "./templates";
import { BANGLA_FONT_BASE64 } from "./fontBase64";

export interface CardState {
  senderName: string;
  designation?: string;
  receiverName?: string;
  greetingTitle?: string;
  note: string;
  photoUrl?: string;
  photoFrameShape: "circle" | "arch" | "squircle";
  photoZoom: number; // 0.8 to 1.6
  photoOffsetX?: number; // -80 to 80
  photoOffsetY: number; // -100 to 100
  textColor?: string;
  fontSizeScale?: number; // 0.85 to 1.25
  showYearTag?: boolean;
  yearTagText?: string;
}

export function wrapText(text: string, maxCharsPerLine = 38): string[] {
  if (!text) return [];
  const lines: string[] = [];
  const rawParagraphs = text.split("\n");

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.trim().split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + " " + word).length <= maxCharsPerLine) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

export async function processCardSvg(
  svgString: string,
  template: Template,
  cardState: CardState
): Promise<string> {
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");

    if (!svgElement) {
      throw new Error("Invalid SVG content");
    }

    // Determine dimensions
    let width = 1000;
    let height = 1600;
    const viewBox = svgElement.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).filter(Boolean).map(Number);
      if (parts.length >= 4 && parts[2] && parts[3]) {
        width = parts[2];
        height = parts[3];
      }
    } else {
      const wAttr = svgElement.getAttribute("width");
      const hAttr = svgElement.getAttribute("height");
      if (wAttr && hAttr) {
        width = parseFloat(wAttr) || width;
        height = parseFloat(hAttr) || height;
      }
      // Ensure valid viewBox if missing
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    // Save natural width and height for download canvas calculation
    svgElement.setAttribute("data-natural-width", width.toString());
    svgElement.setAttribute("data-natural-height", height.toString());

    // Make SVG responsive so it fits perfectly in any preview container
    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Dynamic Title update if template has eidTitleText
    const titleEl = svgElement.querySelector("#eidTitleText");
    if (titleEl) {
      titleEl.textContent = cardState.greetingTitle || "ঈদ মোবারক";
    }

    // Embed Bangla Font as base64 in <style>
    let defs = svgDoc.querySelector("defs");
    if (!defs) {
      defs = svgDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
      svgElement.insertBefore(defs, svgElement.firstChild);
    }

    // Remove any previous font style or custom elements
    const existingStyles = svgDoc.querySelectorAll(".card-injected-style");
    existingStyles.forEach((el) => el.remove());

    const fontStyle = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
    fontStyle.classList.add("card-injected-style");
    fontStyle.textContent = `
      @font-face {
        font-family: 'banglaFont';
        src: url(data:font/woff2;base64,${BANGLA_FONT_BASE64}) format('woff2');
        font-weight: normal;
        font-style: normal;
      }
      .card-text {
        font-family: 'banglaFont', 'AbuSayed', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
    `;
    defs.appendChild(fontStyle);

    // Primary & secondary text colors
    const primaryColor = cardState.textColor || template.color;
    const secondaryColor = template.secondaryColor || primaryColor;
    const isExclusive = template.category === "exclusive";

    // Clear previous custom texts or photo injections
    svgElement.querySelectorAll(".custom-text, .custom-photo-group, #customCardContent").forEach((el) => {
      if (el.id === "customCardContent") {
        el.innerHTML = "";
      } else {
        el.remove();
      }
    });

    // ==========================================
    // 1. PHOTO INJECTION
    // ==========================================
    const photoPlaceholder = svgElement.querySelector("#photoPlaceholder");
    const userPhotoSlot = svgElement.querySelector("#userPhotoSlot");

    if (cardState.photoUrl && cardState.photoUrl.trim()) {
      // Hide placeholder medallion if it exists
      if (photoPlaceholder) {
        photoPlaceholder.setAttribute("display", "none");
      }

      // Slot center and size
      const cx = template.photoSlot.cx;
      const cy = template.photoSlot.cy;
      const baseR = template.photoSlot.r;
      const shape = cardState.photoFrameShape || template.photoSlot.shape || "circle";
      const zoom = Math.max(0.6, Math.min(2.0, cardState.photoZoom || 1));
      const offsetY = cardState.photoOffsetY || 0;

      // Unique clip id
      const clipId = `clip_user_photo_${Date.now()}`;
      const clipPath = svgDoc.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.setAttribute("id", clipId);

      if (shape === "arch") {
        // Islamic arch shape clip
        const archPath = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
        const r = baseR;
        const d = `M ${cx - r} ${cy + r} L ${cx - r} ${cy - r * 0.2} C ${cx - r} ${cy - r * 0.8} ${cx - r * 0.55} ${cy - r * 1.25} ${cx} ${cy - r * 1.35} C ${cx + r * 0.55} ${cy - r * 1.25} ${cx + r} ${cy - r * 0.8} ${cx + r} ${cy - r * 0.2} L ${cx + r} ${cy + r} Z`;
        archPath.setAttribute("d", d);
        clipPath.appendChild(archPath);
      } else if (shape === "squircle") {
        const rect = svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", (cx - baseR).toString());
        rect.setAttribute("y", (cy - baseR).toString());
        rect.setAttribute("width", (baseR * 2).toString());
        rect.setAttribute("height", (baseR * 2).toString());
        rect.setAttribute("rx", (baseR * 0.35).toString());
        clipPath.appendChild(rect);
      } else {
        // Circle clip
        const circle = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx.toString());
        circle.setAttribute("cy", cy.toString());
        circle.setAttribute("r", baseR.toString());
        clipPath.appendChild(circle);
      }
      defs.appendChild(clipPath);

      // Photo Group
      const photoGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
      photoGroup.classList.add("custom-photo-group");

      // For classic templates without pre-drawn frame, add a handsome gold outer bezel
      if (!isExclusive) {
        const outerRim = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerRim.setAttribute("cx", cx.toString());
        outerRim.setAttribute("cy", cy.toString());
        outerRim.setAttribute("r", (baseR + 8).toString());
        outerRim.setAttribute("fill", "none");
        outerRim.setAttribute("stroke", primaryColor);
        outerRim.setAttribute("stroke-width", "8");
        outerRim.setAttribute("opacity", "0.9");
        photoGroup.appendChild(outerRim);

        const innerRim = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
        innerRim.setAttribute("cx", cx.toString());
        innerRim.setAttribute("cy", cy.toString());
        innerRim.setAttribute("r", (baseR + 1).toString());
        innerRim.setAttribute("fill", "none");
        innerRim.setAttribute("stroke", "#ffffff");
        innerRim.setAttribute("stroke-width", "2");
        outerRim.setAttribute("opacity", "0.8");
        photoGroup.appendChild(innerRim);
      }

      // The User Image
      const imageEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "image");
      const imgWidth = baseR * 2 * zoom;
      const imgHeight = baseR * 2 * zoom;
      const offsetX = cardState.photoOffsetX || 0;
      const imgX = cx - imgWidth / 2 + offsetX;
      const imgY = cy - imgHeight / 2 + offsetY;

      imageEl.setAttribute("href", cardState.photoUrl);
      imageEl.setAttribute("x", imgX.toString());
      imageEl.setAttribute("y", imgY.toString());
      imageEl.setAttribute("width", imgWidth.toString());
      imageEl.setAttribute("height", imgHeight.toString());
      imageEl.setAttribute("preserveAspectRatio", "xMidYMid slice");
      imageEl.setAttribute("clip-path", `url(#${clipId})`);
      photoGroup.appendChild(imageEl);

      // Inner subtle rim highlight
      const innerBorder = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
      innerBorder.setAttribute("cx", cx.toString());
      innerBorder.setAttribute("cy", cy.toString());
      innerBorder.setAttribute("r", (baseR - 1).toString());
      innerBorder.setAttribute("fill", "none");
      innerBorder.setAttribute("stroke", "#ffffff");
      innerBorder.setAttribute("stroke-width", "1.5");
      innerBorder.setAttribute("opacity", "0.35");
      photoGroup.appendChild(innerBorder);

      if (userPhotoSlot) {
        userPhotoSlot.appendChild(photoGroup);
      } else {
        svgElement.appendChild(photoGroup);
      }
    } else {
      // No photo uploaded, restore placeholder medallion if exists
      if (photoPlaceholder) {
        photoPlaceholder.removeAttribute("display");
      }
    }

    // ==========================================
    // 2. TEXT INJECTION
    // ==========================================
    let contentContainer = svgElement.querySelector("#customCardContent");
    if (!contentContainer) {
      contentContainer = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
      contentContainer.id = "customCardContent";
      svgElement.appendChild(contentContainer);
    }

    const scale = cardState.fontSizeScale || 1.0;

    if (isExclusive) {
      // EXCLUSIVE TEMPLATE LAYOUT (1000 x 1600)
      let currentY = 740;

      // Receiver Name (if exists)
      if (cardState.receiverName && cardState.receiverName.trim()) {
        const receiverLabel = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        receiverLabel.classList.add("custom-text", "card-text");
        receiverLabel.setAttribute("x", "500");
        receiverLabel.setAttribute("y", currentY.toString());
        receiverLabel.setAttribute("text-anchor", "middle");
        receiverLabel.setAttribute("font-size", `${28 * scale}`);
        receiverLabel.setAttribute("font-weight", "500");
        receiverLabel.setAttribute("fill", secondaryColor);
        receiverLabel.setAttribute("opacity", "0.95");
        receiverLabel.textContent = `প্রিয়: ${cardState.receiverName.trim()}`;
        contentContainer.appendChild(receiverLabel);

        currentY += 46;
      }

      // Note / Wish message lines
      const noteText = cardState.note && cardState.note.trim()
        ? cardState.note.trim()
        : "আপনার ও আপনার পরিবারের জন্য রইল পবিত্র ঈদের আন্তরিক শুভেচ্ছা ও ভালোবাসা। ঈদ মোবারক!";

      const noteFontSize = 32 * scale;
      const noteLines = wrapText(noteText, 34);

      // Start note at currentY + 15
      currentY += 20;

      noteLines.forEach((line) => {
        const lineEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        lineEl.classList.add("custom-text", "card-text");
        lineEl.setAttribute("x", "500");
        lineEl.setAttribute("y", currentY.toString());
        lineEl.setAttribute("text-anchor", "middle");
        lineEl.setAttribute("font-size", `${noteFontSize}`);
        lineEl.setAttribute("font-weight", "400");
        lineEl.setAttribute("fill", primaryColor);
        lineEl.setAttribute("opacity", "0.92");
        lineEl.textContent = line;
        contentContainer.appendChild(lineEl);

        currentY += noteFontSize * 1.5;
      });

      // Sender Section at lower area
      const senderY = 1260;

      // "শুভেচ্ছান্তে:" Label
      const senderLabel = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
      senderLabel.classList.add("custom-text", "card-text");
      senderLabel.setAttribute("x", "500");
      senderLabel.setAttribute("y", (senderY - 45).toString());
      senderLabel.setAttribute("text-anchor", "middle");
      senderLabel.setAttribute("font-size", `${22 * scale}`);
      senderLabel.setAttribute("font-weight", "400");
      senderLabel.setAttribute("fill", secondaryColor);
      senderLabel.setAttribute("opacity", "0.8");
      senderLabel.textContent = "— শুভেচ্ছান্তে —";
      contentContainer.appendChild(senderLabel);

      // Sender Name
      const senderNameText = cardState.senderName && cardState.senderName.trim()
        ? cardState.senderName.trim()
        : "আপনার নাম";

      const nameEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
      nameEl.classList.add("custom-text", "card-text");
      nameEl.setAttribute("x", "500");
      nameEl.setAttribute("y", senderY.toString());
      nameEl.setAttribute("text-anchor", "middle");
      nameEl.setAttribute("font-size", `${46 * scale}`);
      nameEl.setAttribute("font-weight", "700");
      nameEl.setAttribute("fill", primaryColor);
      nameEl.setAttribute("letter-spacing", "1");
      nameEl.textContent = senderNameText;
      contentContainer.appendChild(nameEl);

      // Designation / Title (if provided)
      if (cardState.designation && cardState.designation.trim()) {
        const desigEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        desigEl.classList.add("custom-text", "card-text");
        desigEl.setAttribute("x", "500");
        desigEl.setAttribute("y", (senderY + 38).toString());
        desigEl.setAttribute("text-anchor", "middle");
        desigEl.setAttribute("font-size", `${24 * scale}`);
        desigEl.setAttribute("font-weight", "400");
        desigEl.setAttribute("fill", secondaryColor);
        desigEl.setAttribute("opacity", "0.88");
        desigEl.textContent = cardState.designation.trim();
        contentContainer.appendChild(desigEl);
      }

      // Year / Occasion Tag at footer
      if (cardState.showYearTag !== false) {
        const yearTag = cardState.yearTagText || "পবিত্র ঈদুল ফিতর ২০২৫ • ১৪৪৬ হিজরি";
        const yearEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        yearEl.classList.add("custom-text", "card-text");
        yearEl.setAttribute("x", "500");
        yearEl.setAttribute("y", "1460");
        yearEl.setAttribute("text-anchor", "middle");
        yearEl.setAttribute("font-size", "22");
        yearEl.setAttribute("font-weight", "400");
        yearEl.setAttribute("fill", secondaryColor);
        yearEl.setAttribute("opacity", "0.75");
        yearEl.setAttribute("letter-spacing", "2");
        yearEl.textContent = yearTag;
        contentContainer.appendChild(yearEl);
      }
    } else {
      // CLASSIC TEMPLATE LAYOUT (e.g. 1500 x 2400)
      const senderNameText = cardState.senderName && cardState.senderName.trim()
        ? cardState.senderName.trim()
        : "আপনার নাম";

      const nameYPosition = height - height * 0.08;
      const nameFontSize = height * 0.038 * scale;

      const nameElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
      nameElement.classList.add("custom-text", "card-text");
      nameElement.setAttribute("x", (width / 2).toString());
      nameElement.setAttribute("y", nameYPosition.toFixed(2));
      nameElement.setAttribute("text-anchor", "middle");
      nameElement.setAttribute("font-size", nameFontSize.toFixed(2));
      nameElement.setAttribute("fill", primaryColor);
      nameElement.setAttribute("font-weight", "600");
      nameElement.textContent = senderNameText;
      contentContainer.appendChild(nameElement);

      // Designation
      if (cardState.designation && cardState.designation.trim()) {
        const desigElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        desigElement.classList.add("custom-text", "card-text");
        desigElement.setAttribute("x", (width / 2).toString());
        desigElement.setAttribute("y", (nameYPosition + nameFontSize * 0.8).toFixed(2));
        desigElement.setAttribute("text-anchor", "middle");
        desigElement.setAttribute("font-size", (nameFontSize * 0.55).toFixed(2));
        desigElement.setAttribute("fill", secondaryColor);
        desigElement.setAttribute("font-weight", "400");
        desigElement.textContent = cardState.designation.trim();
        contentContainer.appendChild(desigElement);
      }

      // Note lines
      const noteText = cardState.note && cardState.note.trim()
        ? cardState.note.trim()
        : "ঈদ মোবারক!";

      const noteFontSize = height * 0.028 * scale;
      const noteLines = wrapText(noteText, 40);
      const noteYStart = nameYPosition - noteLines.length * noteFontSize * 1.3 - height * 0.04;

      // Receiver Name if exists
      if (cardState.receiverName && cardState.receiverName.trim()) {
        const receiverEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        receiverEl.classList.add("custom-text", "card-text");
        receiverEl.setAttribute("x", (width / 2).toString());
        receiverEl.setAttribute("y", (noteYStart - noteFontSize * 1.5).toFixed(2));
        receiverEl.setAttribute("text-anchor", "middle");
        receiverEl.setAttribute("font-size", (noteFontSize * 1.1).toFixed(2));
        receiverEl.setAttribute("fill", secondaryColor);
        receiverEl.setAttribute("font-weight", "500");
        receiverEl.textContent = `প্রিয় ${cardState.receiverName.trim()},`;
        contentContainer.appendChild(receiverEl);
      }

      noteLines.forEach((textLine, index) => {
        const noteElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        noteElement.classList.add("custom-text", "card-text");
        const lineYPosition = noteYStart + index * noteFontSize * 1.3;
        noteElement.setAttribute("x", (width / 2).toString());
        noteElement.setAttribute("y", lineYPosition.toFixed(2));
        noteElement.setAttribute("text-anchor", "middle");
        noteElement.setAttribute("font-size", noteFontSize.toFixed(2));
        noteElement.setAttribute("fill", primaryColor);
        noteElement.setAttribute("font-weight", "400");
        noteElement.textContent = textLine;
        contentContainer.appendChild(noteElement);
      });
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDoc.documentElement);
  } catch (error) {
    console.error("Error processing SVG card:", error);
    throw error;
  }
}
