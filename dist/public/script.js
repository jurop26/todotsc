"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const todosIncompleted = document.querySelector('#todos-incompleted');
const todosCompleted = document.querySelector('#todos-completed');
const textIncompleted = document.querySelector('#text-incompleted');
const textCompleted = document.querySelector('#text-completed');
const addTodoForm = document.querySelector('#add-todo-form');
function fetchTodos() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request('GET', '/todos/');
        textIncompleted.innerText = 'Incompleted todos';
        createTodosList(response);
        showIncompleted();
    });
}
function createTodosList(todos) {
    todos.forEach(createTodoNodes);
}
function createTodoNodes(todo) {
    const li = document.createElement('li');
    const completed = document.createElement('input');
    const dueClock = document.createElement('img');
    const title = document.createElement('input');
    const dueDate = document.createElement('input');
    const deleteButton = document.createElement('img');
    li.classList.add('flex', 'flex-row', 'justify-between', 'py-1', 'border-b', 'border-black');
    completed.type = 'checkbox';
    completed.checked = todo.completed;
    completed.classList.add('mr-2', 'lg:mr-5', 'cursor-pointer');
    completed.addEventListener('change', (e) => {
        var _a;
        todo.completed = e.target.checked;
        li.remove();
        updateTodo(todo.id, { completed: todo.completed });
        sortTodo(todo.completed, li);
        showCompleted();
        showIncompleted();
        const dueInput = (_a = e.target.parentNode) === null || _a === void 0 ? void 0 : _a.querySelectorAll('input[type="date"]')[0];
        changeDueDateColor(dueInput, maybeShowDueAlarm(todo, dueClock));
    });
    dueClock.src = 'icon-time.svg';
    dueClock.classList.add('w-3', 'h-3', 'lg:w-4', 'lg:h-4', 'mt-1.5', 'lg:mt-1');
    if (!todo.completed && isTodoDue(todo)) {
        dueClock.classList.add('visible');
    }
    else {
        dueClock.classList.add('invisible');
    }
    title.value = todo.title;
    title.classList.add('flex-1', 'bg-transparent', 'focus:bg-white', 'mx-2', 'lg:mx-5', 'cursor-pointer');
    title.addEventListener('change', (e) => { var _a; return updateTodo(todo.id, { title: (_a = e.target) === null || _a === void 0 ? void 0 : _a.value }); });
    dueDate.type = 'date';
    dueDate.value = todo.date;
    const dueDateColor = maybeShowDueAlarm(todo, dueClock) ? 'text-red-500' : 'text-black';
    dueDate.classList.add('text-xs', 'bg-transparent', 'focus:bg-white', 'w-fit', 'min-w-32', 'mr-2', 'lg:mr-5', 'cursor-pointer', dueDateColor);
    dueDate.addEventListener('change', (e) => {
        var _a;
        todo.date = (_a = e.target) === null || _a === void 0 ? void 0 : _a.value;
        updateTodo(todo.id, { date: todo.date });
        const dueInput = e.target;
        changeDueDateColor(dueInput, maybeShowDueAlarm(todo, dueClock));
    });
    deleteButton.src = 'icon-bin.svg';
    deleteButton.classList.add('fill-red-500', 'text-red-500', 'w-4', 'h-4', 'mt-1', 'cursor-pointer');
    deleteButton.addEventListener('click', () => {
        li.remove();
        deleteTodo(todo.id);
        showCompleted();
        showIncompleted();
    });
    li.append(completed, dueClock, title, dueDate, deleteButton);
    sortTodo(todo.completed, li);
}
addTodoForm === null || addTodoForm === void 0 ? void 0 : addTodoForm.addEventListener('submit', createTodo);
function createTodo(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const title = document.querySelector('#title');
        const date = document.querySelector('#date');
        const body = {
            id: new Date().valueOf().toString(),
            title: title.value,
            date: date.value,
            completed: false,
            created_at: new Date().toString(),
            completed_at: '',
        };
        title.value = '';
        date.value = '';
        const response = yield request('POST', '/todos/', body);
        createTodoNodes(response);
    });
}
function updateTodo(id, task) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request('PATCH', '/todos/' + id, task);
        if (response.status === 404)
            showErrorMessage(response);
    });
}
function deleteTodo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request('DELETE', '/todos/' + id);
        if (response.status === 404)
            showErrorMessage(response);
    });
}
function sortTodo(completed, li) {
    if (completed) {
        todosCompleted.appendChild(li);
    }
    else {
        todosIncompleted.appendChild(li);
    }
}
function maybeShowDueAlarm(todo, img) {
    if (!todo.completed && isTodoDue(todo)) {
        img.classList.replace('invisible', 'visible');
        return true;
    }
    else {
        img.classList.replace('visible', 'invisible');
        return false;
    }
}
function changeDueDateColor(dueInput, isDueAlarmOn) {
    if (isDueAlarmOn) {
        dueInput.classList.replace('text-black', 'text-red-500');
    }
    else {
        dueInput.classList.replace('text-red-500', 'text-black');
    }
}
function isTodoDue(todo) {
    const dueDate = new Date(todo.date);
    const today = new Date();
    return dueDate <= today;
}
function showCompleted() {
    const completed = todosCompleted === null || todosCompleted === void 0 ? void 0 : todosCompleted.querySelectorAll('li');
    if (completed.length > 0) {
        textCompleted.classList.replace('invisible', 'visible');
    }
    else {
        textCompleted.classList.add('visible', 'invisible');
    }
}
function showIncompleted() {
    const inCompleted = todosIncompleted === null || todosIncompleted === void 0 ? void 0 : todosIncompleted.querySelectorAll('li');
    if (inCompleted.length > 0) {
        textIncompleted.classList.replace('invisible', 'visible');
    }
    else {
        textIncompleted.classList.add('visible', 'invisible');
    }
}
function showErrorMessage(result) {
    const body = document.querySelector('body');
    const div = document.createElement('div');
    const err = document.createElement('p');
    const errDesc = document.createElement('p');
    const button = document.createElement('button');
    div.classList.add('flex', 'flex-col', 'justify-center', 'items-center', 'absolute', 'left-1/2', 'top-1/2', 'w-96', 'h-fit', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'border-double', 'border-8', 'border-red-500', 'bg-red-400', 'rounded');
    err.classList.add('text-white', 'pt-5');
    err.innerText = `Error: status: ${result.status}`;
    errDesc.classList.add('text-white', 'pt-5');
    errDesc.innerText = result.message;
    button.classList.add('font-bold', 'border', 'px-4', 'py-1', 'my-5', 'rounded-md', 'hover:bg-red-700');
    button.innerText = 'Ok';
    button.addEventListener('click', () => div.remove());
    div.append(err, errDesc, button);
    body === null || body === void 0 ? void 0 : body.appendChild(div);
}
function request(method, url, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        const result = yield response.json();
        return result;
    });
}
fetchTodos();
