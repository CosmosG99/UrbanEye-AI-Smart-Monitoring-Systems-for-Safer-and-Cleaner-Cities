import { useState } from "react"

export default function UrbanEyeChatbot(){

const [messages,setMessages] = useState([])
const [input,setInput] = useState("")
const [open,setOpen] = useState(false)

const sendMessage = async () => {

  if(!input.trim()) return

  const userMessage = {sender:"user",text:input}

  setMessages(prev => [...prev,userMessage])

  const res = await fetch("http://localhost:5000/api/chatbot",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({message:input})
  })

  const data = await res.json()

  const botMessage = {sender:"bot",text:data.reply}

  setMessages(prev => [...prev,botMessage])

  setInput("")
}

return(

<>
{/* CHAT BUTTON */}

<div
onClick={()=>setOpen(!open)}
style={{
position:"fixed",
bottom:"20px",
right:"20px",
width:"60px",
height:"60px",
borderRadius:"50%",
background:"#2563eb",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"white",
fontSize:"26px",
cursor:"pointer",
boxShadow:"0 4px 15px rgba(0,0,0,0.4)",
zIndex:1000
}}
>
💬
</div>


{/* CHAT WINDOW */}

{open && (

<div style={{
position:"fixed",
bottom:"90px",
right:"20px",
width:"320px",
height:"420px",
background:"#0f172a",
borderRadius:"12px",
display:"flex",
flexDirection:"column",
overflow:"hidden",
boxShadow:"0 10px 25px rgba(0,0,0,0.4)",
zIndex:1000
}}>

{/* HEADER */}

<div style={{
background:"#1e293b",
padding:"10px",
fontWeight:"bold",
color:"white"
}}>
UrbanEye Assistant 🤖
</div>


{/* CHAT AREA */}

<div style={{
flex:1,
overflowY:"auto",
padding:"10px",
color:"white"
}}>

{messages.map((m,i)=>(
<div key={i} style={{
textAlign:m.sender==="user"?"right":"left",
marginBottom:"8px"
}}>

<span style={{
background:m.sender==="user"?"#2563eb":"#334155",
padding:"6px 10px",
borderRadius:"6px",
display:"inline-block",
maxWidth:"80%"
}}>
{m.text}
</span>

</div>
))}

</div>


{/* INPUT AREA */}

<div style={{
display:"flex",
padding:"8px",
background:"#1e293b"
}}>

<input
value={input}
onChange={e=>setInput(e.target.value)}
placeholder="Ask UrbanEye..."
style={{
flex:1,
padding:"6px",
borderRadius:"6px",
border:"none",
outline:"none",
color:"black"
}}
/>

<button
onClick={sendMessage}
style={{
marginLeft:"6px",
padding:"6px 10px",
background:"#2563eb",
border:"none",
borderRadius:"6px",
color:"white",
cursor:"pointer"
}}
>
Send
</button>

</div>

</div>

)}

</>

)
}