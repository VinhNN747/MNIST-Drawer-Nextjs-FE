"use client"

import { useRef, useState } from "react"

export default function Home(){

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [result,setResult] = useState<number|null>(null)

  const drawing = useRef(false)

  function startDraw(){
    drawing.current = true
  }

  function stopDraw(){
    drawing.current = false
  }

  function draw(e:any){

    if(!drawing.current) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    const rect = canvas.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const r = 23

    const g = ctx.createRadialGradient(x,y,0,x,y,r)

    g.addColorStop(0,"rgba(255,255,255,1)")
    g.addColorStop(1,"rgba(255,255,255,0)")

    ctx.fillStyle = g

    ctx.beginPath()
    ctx.arc(x,y,r,0,Math.PI*2)
    ctx.fill()
  }

  function clear(){

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    ctx.fillStyle="black"
    ctx.fillRect(0,0,280,280)
  }

  function getPixels(){

    const canvas = canvasRef.current!

    const small = document.createElement("canvas")
    small.width=28
    small.height=28

    const sctx = small.getContext("2d")!

    sctx.drawImage(canvas,0,0,28,28)

    const img = sctx.getImageData(0,0,28,28).data

    const pixels:number[]=[]

    for(let i=0;i<img.length;i+=4){
      pixels.push(img[i])
    }

    return pixels
  }

  async function predict(){
    const rootUrl = process.env.ROOT_URL || "http://localhost:8000"
    const pixels = getPixels()
    console.log(JSON.stringify(pixels))
    const res = await fetch(`${rootUrl}/predict`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({pixels})
    })

    const data = await res.json()

    setResult(data.digit)
  }

  return(

    <div style={{padding:40}}>

      <h2>Draw digit</h2>

      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        style={{border:"1px solid white"}}
        onMouseDown={startDraw}
        onMouseUp={stopDraw}
        onMouseMove={draw}
      />

      <br/><br/>

      <button onClick={predict}>Predict</button>
      <button onClick={clear}>Clear</button>

      <h3>Result: {result}</h3>

    </div>
  )
}