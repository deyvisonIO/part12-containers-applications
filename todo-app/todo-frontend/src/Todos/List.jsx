import React from 'react'
import TodoItem from './TodoItem'

const TodoList = ({ todos, deleteTodo, completeTodo }) => {
  const onClickDelete = (todo) => () => {
    deleteTodo(todo)
  }

  const onClickComplete = (todo) => () => {
    completeTodo(todo)
  }

  return (
    <>
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} onClickDelete={onClickDelete} onClickComplete={onClickComplete} />).reduce((acc, cur) => [...acc, <hr />, cur], [])}
    </>
  )
}

export default TodoList
