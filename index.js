const fs = require('fs').promises;
const { program } = require('commander');

const TODO_FILE = 'todos.json';

async function loadTodos() {
  try {
    const data = await fs.readFile(TODO_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveTodos(todos) {
  await fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 2));
}

program
  .version('1.0.0')
  .description('A command-line todo list application');

program
  .command('add <task>')
  .description('Add a new todo')
  .action(async (task) => {
    const todos = await loadTodos();
    const newTodo = {
      id: todos.length + 1,
      task,
      done: false,
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    await saveTodos(todos);
    console.log(`Todo added: ${task}`);
  });

program
  .command('list')
  .description('List all todos')
  .action(async () => {
    const todos = await loadTodos();
    if (todos.length === 0) {
      console.log("No todos found");
    } else {
      todos.forEach(todo => {
        const status = todo.done ? "Done" : "Not Done";
        console.log(`${todo.id}. [${status}] ${todo.task}`);
      });
    }
  });

program
  .command('done <id>')
  .description('Mark a todo as done')
  .action(async (id) => {
    const todos = await loadTodos();
    const todo = todos.find(t => t.id === parseInt(id));
    if (todo) {
      todo.done = true;
      await saveTodos(todos);
      console.log(`Todo marked as done: ${todo.task}`);
    } else {
      console.log(`Todo with id ${id} not found`);
    }
  });

program
  .command('delete <id>')
  .description('Delete a todo')
  .action(async (id) => {
    let todos = await loadTodos();
    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== parseInt(id));
    if (todos.length < initialLength) {
      await saveTodos(todos);
      console.log(`Todo with id ${id} deleted`);
    } else {
      console.log(`Todo with id ${id} not found`);
    }
  });

program.parse(process.argv);

// If no arguments, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}