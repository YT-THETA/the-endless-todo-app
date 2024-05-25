import './styles.css';
import './components';
import { createElement, createCheckbox, saveToStorage, getFromStorage } from './utils';

// init and run
const app = todoApp();


// app logic
function todoApp() {
    const _dataService = todoData();
    const _renderer = todoRenderer();
    // wire events
    const messageInput = document.querySelector('#message');
    const addTodoButton = document.querySelector('#addBtn');

    addTodoButton.addEventListener('click', _onAddTodoButtonClicked);

    function _onAddTodoButtonClicked() {

        addTodoButton.classList.add('clicked');
        setTimeout(() => addTodoButton.classList.remove('clicked'), 300);

        let value = messageInput.value;
        if (!value) {
            return;
        }
        _dataService.add({
            message: value,
            status: false
        });
        messageInput.value = '';
        _renderer.render(_dataService.list());
    }
    // load the todo's if they are in storage
    let savedTodos = getFromStorage('teta-todos');

    if (savedTodos) {
        _dataService.load(savedTodos);
    }

    _renderer.render(_dataService.list());
}

// data logic
function todoData() {
    // state
    const _todos = [];
    let _idCounter = 0;

    return {

        load(todos) {
            // remove all the todo's
            for (var todo of _todos) {
                this.delete(todo);
            }
            // set the new todo's
            for (var todo of todos) {
                this.add(todo);
            }
        },

        add(todo) {
            _idCounter = _todos.length == 0 ? 0 :  _todos.map(t => t.id).reduce((a,b) => a > b ? a : b);
            let newId = ++_idCounter;
            todo.id = newId;     
            if (this.get(todo.id)) {
                console.log('duplicate id!')
            }
            _todos.push(todo);
            // save our todo's
            saveToStorage('teta-todos', _todos);
        },
        update(todo) {
            let todoToUpdate = this.get(id);
            if (!todoToUpdate) {
                console.log('no todo found with this id');
                return;
            }
            let index = _todos.indexOf(todoToUpdate);
            _todos[index] = todo;
            // save our todo's
            saveToStorage('teta-todos', _todos);
        },
        delete(todo) {
            let todoToDelete = this.get(todo.id);
            if (!todoToDelete) {
                console.log('no todo found with this id');
                return;
            }
            let index = _todos.indexOf(todoToDelete);
            _todos.splice(index, 1);
            // save our todo's
            saveToStorage('teta-todos', _todos);
        },
        get(id) {
            return _todos.find(t => t.id === id);
        },
        list() {
            return _todos;
        }
    }
}

// rendering logic
function todoRenderer() {

    const _todoList = document.querySelector('ul[et-todos]');

    function _createTodoItem(todo) {
        let todoItem = createElement('li', { class: 'et-todo-item', 'et-todo-id': todo.id });
        let todoCheckbox = createCheckbox();
        let todoDescription = createElement('label');
        todoDescription.innerText = todo.message;

        todoItem.appendChild(todoCheckbox);
        todoItem.appendChild(todoDescription);

        _todoList.appendChild(todoItem);
        return todoItem;
    }

    return {
        render(todos) {
            // add new todo's
            for (var todo of todos) {
                // check if the todo is already present in the ui
                let uiItem = Array.from(_todoList.children).find(el => el.getAttribute('et-todo-id') == todo.id);
                // if not, create the ui for that todo item
                if (!uiItem) {
                    uiItem = _createTodoItem(todo);
                }
            }

            // remove old todo's
            for (var todoElement of _todoList.children) {
                // check if there is a corresponding todo in the data
                let dataItem = todos.find(t => t.id == todoElement.getAttribute('et-todo-id'));

                // if not, remove the ui item
                if (!dataItem) {
                    _todoList.remove(todoElement);
                }
            }
        }
    }

}
