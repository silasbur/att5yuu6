import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './App.css'
import TodosContainer from "./TodosContainer"

export interface Todo {
  text: string;
  id: string;
  children?: Todo[];
}

const sample = [{text: "this is a first todo", id: uuid() },
  {text: "another great thing", id: uuid() },
  {text: "pick up the room", id: uuid() },
  {text: "get the groceries", id: uuid() }

]


function App() {
  
  const [todos, setTodos] = useState([...sample])
  const [text, setText] = useState("")
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === undefined) return 
    setText(e.target.value)
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setTodos((prev)=>[...prev, {text: text, id: uuid()}])
  }

  return (
    <>
    <TodosContainer todos={todos}/>
    <input onChange={handleChange} value={text}></input>
    <button onClick={handleClick} className="color:black;background-color:gray;">submit</button>
    </>
   
  )
}

export default App
