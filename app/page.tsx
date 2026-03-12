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

    ctx.fillStyle="white"
    ctx.beginPath()
    ctx.arc(x,y,10,0,Math.PI*2)
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
      pixels.push(img[i]/255)
    }

    return pixels
  }

  async function predict(){

    const pixels = getPixels()

    const res = await fetch("http://localhost:8000/predict",{
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
        style={{border:"1px solid black"}}
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