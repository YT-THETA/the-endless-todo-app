import './styles.css';
import './components';
import { createElement, createCheckbox, saveToStorage, getFromStorage } from './utils';

// init and run
const app = todoApp();
window.app = app;


// app logic
function todoApp() {
    const _dataService = todoData();
    const _renderer = todoRenderer();
    // wire events
    const messageInput = document.querySelector('#message');
    const addTodoButton = document.querySelector('#addBtn');
    const appElement = document.querySelector('#et-app');

    addTodoButton.addEventListener('click', _onAddTodoButtonClicked);

    appElement.addEventListener('click', _onAppClicked);
    appElement.addEventListener('dblclick', _onAppDoubleClicked);

    function _onAppClicked(event) {
        _onCheckmarkChange(event);
        _onClickOutsideCheckmark(event);
    }

    function _onAppDoubleClicked(event) {
        _onMessageDoubleClicked(event);
    }

    function _onMessageDoubleClicked(event) {
        if (!event.target.closest('[et-todo-id]'))
            return;
        let messageInput = event.target;

        if (messageInput.hasAttribute('readonly'))
            messageInput.removeAttribute('readonly');
        else
            messageInput.setAttribute('readonly', '');
    }

    function _onClickOutsideCheckmark(event) {
        appElement.querySelectorAll('[et-todo-id] input').forEach(messageInput => {
            console.log(!messageInput.hasAttribute('readonly'), event.target.closest('[et-todo-id] input'))
            if (!messageInput.hasAttribute('readonly') && event.target.closest('[et-todo-id] input') !== messageInput)
                messageInput.setAttribute('readonly', '');
        });
    }

    function _onCheckmarkChange(event) {
        if (event.target.tagName != 'ET-CHECKMARK')
            return;
        let checkmark = event.target;
        let status = checkmark.hasAttribute('checked');
        let id = checkmark.parentNode.getAttribute('et-todo-id');
        let item = _dataService.get(id);
        item.status = status;
        _dataService.update(item);
    }

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

    return {
        renderer: _renderer,
        dataService: _dataService
    }
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
            let todoToUpdate = this.get(todo.id);
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
            return _todos.find(t => t.id == id);
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
        let todoLabel = createElement('label');
        const inputSize = todo.message && todo.message.length > 4 ? todo.message.length - 4 : 0;
        let todoMessage = createElement('input', { readonly: '', value: todo.message, size: inputSize });
        todoLabel.appendChild(todoMessage);
        todoItem.appendChild(todoCheckbox);
        todoItem.appendChild(todoLabel);

        todoMessage.addEventListener('input', (event) => {
            // resize the input
            const inputSize = todoMessage && todoMessage.value.length > 4 ? todoMessage.value.length - 4 : 0;
            todoMessage.setAttribute('size', inputSize);
        });

        todoMessage.addEventListener('change', (event) => {
            // update the todo item
            let id = todoItem.getAttribute('et-todo-id');
            let item = window.app.dataService.get(id);
            item.message = todoMessage.value;
            debugger;
            window.app.dataService.update(item);
        });

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
                let checkmark = uiItem.querySelector('et-checkmark');
                if (todo.status) {
                    checkmark.setAttribute('checked', '');
                }
                else {
                    checkmark.removeAttribute('checked');
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
