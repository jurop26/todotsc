const todosIncompleted = document.querySelector('#todos-incompleted') as HTMLUListElement;
const todosCompleted = document.querySelector('#todos-completed') as HTMLUListElement;
const textIncompleted = document.querySelector('#text-incompleted') as HTMLHeadingElement;
const textCompleted = document.querySelector('#text-completed') as HTMLHeadingElement;
const addTodoForm = document.querySelector('#add-todo-form') as HTMLFormElement;

type Todo = {
    id: string,
    title: string,
    date: string,
    completed: boolean,
    created_at: string,
    completed_at: string,
}

async function fetchTodos(): Promise<void> {
    const response: Todo[] = await request('GET', '/todos/');
    textIncompleted.innerText = 'Incompleted todos';
    createTodosList(response);
    showIncompleted();
}

function createTodosList(todos: Todo[]): void {
    todos.forEach(createTodoNodes);
}

function createTodoNodes(todo: Todo): void {
    const li = document.createElement('li');
    const completed = document.createElement('input');
    const dueClock = document.createElement('img');
    const title = document.createElement('input');
    const dueDate = document.createElement('input');
    const deleteButton = document.createElement('img');
    
    li.classList.add('flex','flex-row','justify-between', 'py-1', 'border-b', 'border-black');
    
    completed.type = 'checkbox';
    completed.checked = todo.completed;
    completed.classList.add('mr-2','lg:mr-5', 'cursor-pointer');
    completed.addEventListener('change', (e: Event) => {
        const target = <HTMLInputElement>e.target;
        todo.completed = target.checked;
        li.remove();
        updateTodo(todo.id, {completed: todo.completed});
        sortTodo(todo.completed, li);
        showCompleted();
        showIncompleted();

        const dueInput = target.parentNode?.querySelectorAll('input[type="date"]')[0] as HTMLElement;
        changeDueDateColor(dueInput, maybeShowDueAlarm(todo, dueClock));
    });
    
    dueClock.src = 'icon-time.svg';
    dueClock.classList.add('w-3','h-3','lg:w-4','lg:h-4','mt-1.5','lg:mt-1');
    if(!todo.completed && isTodoDue(todo)) {dueClock.classList.add('visible');}
    else {dueClock.classList.add('invisible');}
    
    title.value = todo.title;
    title.classList.add('flex-1','bg-transparent','focus:bg-white','mx-2', 'lg:mx-5', 'cursor-pointer');
    title.addEventListener('change', (e: Event): Promise<void> => updateTodo(todo.id, {title: (e.target as HTMLInputElement)?.value}));

    dueDate.type = 'date';
    dueDate.value = todo.date;
    const dueDateColor = maybeShowDueAlarm(todo, dueClock) ? 'text-red-500' : 'text-black';
    dueDate.classList.add('text-xs','bg-transparent','focus:bg-white', 'w-fit','min-w-32', 'mr-2' ,'lg:mr-5','cursor-pointer', dueDateColor);
    dueDate.addEventListener('change', (e: Event): void => {
        const target = <HTMLInputElement>e.target;
        todo.date = target.value;
        updateTodo(todo.id, {date: todo.date});

        changeDueDateColor(target, maybeShowDueAlarm(todo, dueClock));
    });
    
    deleteButton.src = 'icon-bin.svg';
    deleteButton.classList.add('fill-red-500', 'text-red-500','w-4', 'h-4', 'mt-1','cursor-pointer');
    deleteButton.addEventListener('click', (): void => {
        li.remove(); 
        deleteTodo(todo.id);
        showCompleted();
        showIncompleted();
    });

    li.append(completed, dueClock, title, dueDate,  deleteButton);
    sortTodo(todo.completed, li);    
}

addTodoForm?.addEventListener('submit', createTodo);

async function createTodo(e: Event): Promise<void> {
    e.preventDefault();
    const title = document.querySelector('#title') as HTMLInputElement;
    const date = document.querySelector('#date') as HTMLInputElement;
    const body: Todo = {
        id: new Date().valueOf().toString(),
        title: title!.value,
        date: date!.value, 
        completed: false,
        created_at: new Date().toString(),
        completed_at: '',
    }
    title!.value = '';
    date!.value = '';
    
    const response: Todo = await request('POST', '/todos/', body);
    createTodoNodes(response);
}

async function updateTodo(id: Todo['id'], task: Partial<Todo>): Promise<void> {
    const response: Response = await request('PATCH', '/todos/' + id, task);
    if(response.status === 404) showErrorMessage(response);
}

async function deleteTodo(id: Todo['id']): Promise<void> {
    const response: Response = await request('DELETE','/todos/' + id); 
    if(response.status === 404) showErrorMessage(response);
}

function sortTodo(completed: boolean, li: HTMLLIElement){
    if(completed) {
        todosCompleted.appendChild(li);
    } else {
        todosIncompleted.appendChild(li);  
    }
}

function maybeShowDueAlarm(todo: Todo, img: HTMLImageElement) {
    if(!todo.completed && isTodoDue(todo)) {
        img.classList.replace('invisible', 'visible');
        return true;
    }
    else {
        img.classList.replace('visible', 'invisible');
        return false;
    }
}

function changeDueDateColor(dueInput: HTMLElement, isDueAlarmOn: boolean) {
    if (isDueAlarmOn) {
        dueInput.classList.replace('text-black', 'text-red-500');
    } else {
        dueInput.classList.replace('text-red-500', 'text-black');
    }
}

function isTodoDue(todo: Todo): boolean {
    const dueDate = new Date(todo.date);
    const today = new Date();

    return dueDate <= today;
}

function showCompleted() {
    const completed = todosCompleted?.querySelectorAll('li');
    if(completed.length > 0) {
        textCompleted.classList.replace('invisible', 'visible');
    }
    else {
        textCompleted.classList.add('visible', 'invisible');
    }
}
function showIncompleted() {
    const inCompleted = todosIncompleted?.querySelectorAll('li');
    if(inCompleted.length > 0) {
        textIncompleted.classList.replace('invisible', 'visible');
    }
    else {
        textIncompleted.classList.add('visible', 'invisible');
    }
}

function showErrorMessage(result: Response & {message?: string}) {
    const body = document.querySelector('body');
    const div = document.createElement('div');
    const err = document.createElement('p');
    const errDesc = document.createElement('p');
    const button = document.createElement('button');

    div.classList.add('flex', 'flex-col','justify-center','items-center','absolute','left-1/2', 'top-1/2','w-96','h-fit','transform' ,'-translate-x-1/2' ,'-translate-y-1/2' , 'border-double','border-8', 'border-red-500','bg-red-400', 'rounded');
    
    err.classList.add('text-white','pt-5');
    err.innerText = `Error: status: ${result.status}`;
    errDesc.classList.add('text-white','pt-5');
    if (result.message) errDesc.innerText = result.message;

    button.classList.add('font-bold','border','px-4','py-1', 'my-5','rounded-md','hover:bg-red-700');
    button.innerText= 'Ok';
    button.addEventListener('click',(): void => div.remove());

    div.append(err, errDesc, button);
    body?.appendChild(div);
}

async function request(method: string, url: string, body?: object | Todo): Promise<any> {
    const response: Response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json'},
        body: body ? JSON.stringify(body) : undefined
        })
    const result: Promise<object> = await response.json();
    return result;
}

fetchTodos();