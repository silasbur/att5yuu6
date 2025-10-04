import type {Todo} from "./App";

function TodosContainer(props: {todos: Todo[]}) {


  return (
    props.todos.map((t) => (
      <div key={t.id}>
        {t.text}
      </div>

    ))

  )
}

export default TodosContainer
