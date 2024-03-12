"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express_1.default.static(__dirname + '/public'));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
const todos = new Map();
app.get('/', (req, res) => {
    res.render('todo.html');
});
app.get('/todos', (req, res) => {
    res.json([...todos.entries()].map((e) => e[1]));
});
app.post('/todos', (req, res) => {
    const todo = req.body;
    todos.set(todo.id, todo);
    if (req.headers["content-type"] === "application/json") {
        return res.json(todo);
    }
    res.redirect('/');
});
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const todo = todos.get(id);
    const completed_at = req.body.completed ? { completed_at: new Date().toString() } : { completed_at: '' };
    const task = Object.assign(Object.assign({}, req.body), completed_at);
    const newTodo = Object.assign(Object.assign({}, todo), task);
    if (!todos.has(id)) {
        return res.json({ "status": 404, 'message': 'Todos Id not found!' });
    }
    todos.set(id, newTodo);
    if (req.headers["content-type"] === "application/json") {
        return res.json(newTodo);
    }
    res.redirect('/');
});
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const todo = todos.get(id);
    const completed_at = req.body.completed ? { completed_at: new Date().toString() } : { completed_at: '' };
    const task = Object.assign(Object.assign({}, req.body), completed_at);
    const newTodo = Object.assign(Object.assign({}, todo), task);
    if (!todos.has(id)) {
        return res.json({ "status": 404, 'message': 'Todos Id not found!' });
    }
    todos.set(id, newTodo);
    if (req.headers["content-type"] === "application/json") {
        return res.json(newTodo);
    }
    res.redirect('/');
});
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!todos.has(id)) {
        return res.json({ "status": 404, 'message': 'Todos Id not found!' });
    }
    todos.delete(id);
    if (req.headers["content-type"] === "application/json") {
        return res.json({ 'status': 204 });
    }
    res.redirect("/");
});
app.listen(3000);
