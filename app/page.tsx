"use client"

import { useEffect, useRef, useState } from "react"

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [result,setResult] = useState<number|null>(null)
  const [confidence,setConfidence] = useState<number|null>(null)

  // ===== DRAW =====
  function startDraw() {
    setDrawing(true)
  }

  function stopDraw() {
    setDrawing(false)
  }

  function draw(e: any) {
    if (!drawing) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const r = 21
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)

    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(1, "rgba(255,255,255,0)")

    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  function clear() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 280, 280)

    setResult(null)
    setConfidence(null)
  }

  // ===== CAMERA =====
  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current!.srcObject = stream
  }

  function capture() {
    const video = videoRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    ctx.drawImage(video, 0, 0, 280, 280)
  }

  // ===== PROCESS =====
  function getPixels() {
    const canvas = canvasRef.current!

    const small = document.createElement("canvas")
    small.width = 28
    small.height = 28

    const sctx = small.getContext("2d")!
    sctx.drawImage(canvas, 0, 0, 28, 28)

    const img = sctx.getImageData(0, 0, 28, 28).data
    const pixels: number[] = []

    for (let i = 0; i < img.length; i += 4) {
      const r = img[i]
      const g = img[i + 1]
      const b = img[i + 2]

      let gray = 0.299 * r + 0.587 * g + 0.114 * b
      gray = gray > 100 ? 255 : 0

      pixels.push(1 - gray / 255)
    }

    return pixels
  }

  // ===== PREDICT =====
  async function predict() {
    const rootUrl =
      process.env.NEXT_PUBLIC_ROOT_URL || "http://localhost:8000"

    const pixels = getPixels()

    const res = await fetch(`${rootUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pixels })
    })

    const data = await res.json()

    setResult(data.digit)
  }

  useEffect(() => {
    clear()
  }, [])

  // ===== UI =====
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: 30,
          background: "#1e293b",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          width: 340
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Draw a digit</h2>

        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Draw or capture a number from 0–9
        </p>

        {/* MODE SWITCH */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 10,
            justifyContent: "center"
          }}
        >
          <button
            onClick={() => setMode("draw")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: mode === "draw" ? "#22c55e" : "#334155",
              color: "white",
              cursor: "pointer"
            }}
          >
            Draw
          </button>

          <button
            onClick={() => setMode("camera")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: mode === "camera" ? "#22c55e" : "#334155",
              color: "white",
              cursor: "pointer"
            }}
          >
            Camera
          </button>
        </div>

        {/* DRAW */}
        {mode === "draw" && (
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            style={{
              border: "2px solid #334155",
              borderRadius: 12,
              marginTop: 15,
              background: "black",
              touchAction: "none"
            }}
            onPointerDown={startDraw}
            onPointerUp={stopDraw}
            onPointerMove={draw}
          />
        )}

        {/* CAMERA */}
        {mode === "camera" && (
          <>
            <video
              ref={videoRef}
              autoPlay
              style={{
                width: 280,
                height: 280,
                borderRadius: 12,
                marginTop: 15,
                border: "2px solid #334155"
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                justifyContent: "center"
              }}
            >
              <button
                onClick={startCamera}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Open
              </button>

              <button
                onClick={capture}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Capture
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              style={{ display: "none" }}
            />
          </>
        )}

        {/* ACTION */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            justifyContent: "center"
          }}
        >
          <button
            onClick={predict}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#22c55e",
              color: "white",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Predict
          </button>

          <button
            onClick={clear}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </div>

      {result !== null && (
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            fontWeight: 700
          }}
        >
          ---- Result: {result} ----Confidence: {(confidence! * 100).toFixed(2)}%
        </div>
      )}
    </div>
  </div>
  )
}