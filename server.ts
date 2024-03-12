import express, {Express, Request, Response} from "express";
const app: Express = express();

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

type Todo = {
    id: string,
    title: string,
    date: Date,
    completed: boolean,
    created_at: string,
    completed_at: string,
}

const todos: Map<string, object> = new Map();

app.get('/', (req: Request, res: Response) => {
    res.render('todo.html');
});

app.get('/todos', (req: Request, res: Response) => {
    res.json([...todos.entries()].map((e: any): Todo => e[1]));
});

app.post('/todos', (req: Request, res: Response): any => {
    const todo: Todo = req.body;
    
    todos.set(todo.id, todo);
    
    if (req.headers["content-type"] === "application/json") {
        return res.json(todo);
    }

    res.redirect('/');
});

app.patch('/todos/:id', (req, res) => {
    const id: string = req.params.id;
    const todo: object | undefined = todos.get(id);
    const completed_at: {completed_at: string} = req.body.completed ? {completed_at: new Date().toString()} : {completed_at: ''};
    const task: Todo = { ...req.body, ...completed_at};
    const newTodo: Todo = {
        ...todo,
        ...task,
    };

    if (!todos.has(id)) {
        return res.json({"status": 404, 'message': 'Todos Id not found!'});
    } 
    todos.set(id, newTodo);

    if (req.headers["content-type"] === "application/json") {
        return res.json(newTodo);
    }
    res.redirect('/');
});


app.patch('/todos/:id', (req: Request, res: Response) => {
    const id: string = req.params.id;
    const todo: object | undefined = todos.get(id);
    const completed_at: {completed_at: string} = req.body.completed ? {completed_at: new Date().toString()} : {completed_at: ''};
    const task: Todo = { ...req.body, ...completed_at};
    const newTodo: Todo = {
        ...todo,
        ...task,
    };

    if (!todos.has(id)) {
        return res.json({"status": 404, 'message': 'Todos Id not found!'});
    } 
    todos.set(id, newTodo);

    if (req.headers["content-type"] === "application/json") {
        return res.json(newTodo);
    }
    res.redirect('/');
});

app.delete('/todos/:id', (req: Request, res: Response) => {
    const id: string = req.params.id;
    
    if (!todos.has(id)) {
        return res.json({"status": 404, 'message': 'Todos Id not found!'});
    } 
    todos.delete(id);

    if (req.headers["content-type"] === "application/json") {
        return res.json({'status': 204});
    }
    res.redirect("/");
});

app.listen(3000);