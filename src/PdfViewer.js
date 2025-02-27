import React, { useState, useRef } from "react";
import { getDocument } from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
// import { GlobalWorkerOptions } from "pdfjs-dist";
// GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";


export default function PdfViewer() {
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result);
      const loadedPdf = await getDocument({ data: pdfData }).promise;
      setPdf(loadedPdf);
      renderPage(loadedPdf, 1);
    };
  };

  const renderPage = async (pdf, pageNumber) => {
    if (!pdf) return;
    const page = await pdf.getPage(pageNumber);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise;
  };

  const changePage = (offset) => {
    if (!pdf) return;
    const newPageNum = pageNum + offset;
    if (newPageNum >= 1 && newPageNum <= pdf.numPages) {
      setPageNum(newPageNum);
      renderPage(pdf, newPageNum);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem" }}>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileChange} 
      />
      <canvas 
        ref={canvasRef} 
        style={{ border: "1px solid #e5e7eb", marginTop: "1rem", marginBottom: "1rem" }} 
      />
      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          onClick={() => changePage(-1)} 
          disabled={pageNum <= 1} 
          style={{ 
            paddingLeft: "1rem", 
            paddingRight: "1rem", 
            paddingTop: "0.5rem", 
            paddingBottom: "0.5rem", 
            backgroundColor: "#d1d5db", 
            borderRadius: "0.25rem",
            cursor: pageNum <= 1 ? "not-allowed" : "pointer",
            opacity: pageNum <= 1 ? "0.5" : "1"
          }}
        >
          Prev
        </button>
        <span>Page {pageNum} / {pdf?.numPages || "?"}</span>
        <button 
          onClick={() => changePage(1)} 
          disabled={!pdf || pageNum >= pdf.numPages} 
          style={{ 
            paddingLeft: "1rem", 
            paddingRight: "1rem", 
            paddingTop: "0.5rem", 
            paddingBottom: "0.5rem", 
            backgroundColor: "#d1d5db", 
            borderRadius: "0.25rem",
            cursor: (!pdf || pageNum >= pdf.numPages) ? "not-allowed" : "pointer",
            opacity: (!pdf || pageNum >= pdf.numPages) ? "0.5" : "1"
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
