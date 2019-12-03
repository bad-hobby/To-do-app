const listsContainer = document.querySelector('[data-lists]'); // corresponds with the ul in html 
const newListForm = document.querySelector('[data-new-list-form'); // corresponds with the form
const newListInput = document.querySelector('[data-new-list-input'); // corresponds with the input button '+'
const deleteListButton = document.querySelector('[data-delete-list-button'); 
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]');

const LOCAL_STORAGE_LIST_KEY = 'task.lists'; // create key '.' is for preventing overwriting and colisions with this key. Will store the list from lists variable here.
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];  // the list container is empty when opened first. Then loads from this variable. Instead of loading an empty array we want to get the information from the local storage using this key. getItem(key)    
// and if this info exist in the local storage - parse it into an object.
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY); // if nothing returns null

listsContainer.addEventListener('click', e => { // listens for when a list is selected
    if (e.target.tagName.toLowerCase() === 'li') { // e.target = the element that was clicked === li
        selectedListId = e.target.dataset.listId; // get the id created in render fu 
        saveAndRender();
    }
});

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id === selectedListId);
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
        selectedTask.complete = e.target.checked;
        save();
        renderTaskCount(selectedList);
    }
});

clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender();
});

deleteListButton.addEventListener('click', e => {  // when click delete list button
     lists = lists.filter(list => list.id !== selectedListId); // gives new list with items matching the criteria
     selectedListId = null; // selected list is deleted
     saveAndRender(); // update 
});

newListForm.addEventListener('submit', e => { //submit button / e = event
    e.preventDefault(); // preventing page from refreshing when submit list is pressed
    const listName = newListInput.value; // gets the value of what is typed in the field
    if (listName == null || listName === '') return; // if its not a name return
    const list = createList(listName); // Creating new task with the name typed in the input
    newListInput.value = null; // clear input after typed end submited
    
    lists.push(list);
    saveAndRender();
});

newTaskForm.addEventListener('submit', e => { //submit button / e = event
    e.preventDefault(); // preventing page from refreshing when submit list is pressed
    const taskName = newTaskInput.value; // gets the value of what is typed in the field
    if (taskName == null || taskName === '') return; // if its not a name return
    const task = createTask(taskName); // Creating new list with the name typed in the input
    newTaskInput.value = null; // clear input after typed end submited
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks.push(task);
    saveAndRender();
});

function createList(name) { // create list function. Returns object with keys
    return { id: Date.now().toString(), name: name, tasks: [] } // unique id from current time. name = name passed in, tasks by default are none.
 }

 function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false } // by default the task is incomplete
 }

 function saveAndRender() {
    save();
    render();
}

 function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists)); // saves to local storage . setItem(passing key first, then value)
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function render() { // populates the list
    clearElement(listsContainer)// clears list container everytime render is called
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId) // checks each of our lists and their id if === selectedListId 
    if (selectedListId == null) { // if true - we don't have list selected
        listDisplayContainer.style.display = 'none'; // removes tasks container box
    } else { // else we do have list selected
        listDisplayContainer.style.display = ''; // shows tasks container when list is selected
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList); // render remaining tasks. Passing in the currently selected list
        clearElement(tasksContainer); // clear tasks first
        renderTasks(selectedList); // now render them
    }
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => { // code inside runs for each task that we have
        const taskElement = document.importNode(taskTemplate.content, true); // cloning the task with its content. Passing 'true' renders everything inside of the template                        
        const checkbox = taskElement.querySelector('input'); // getting the input element - checkbox
        checkbox.id = task.id; // set id for the checkbox same as the 'id' of its task
        checkbox.checked = task.complete; // check the checkbox to the task if its complete
        const label = taskElement.querySelector('label'); // getting the label element
        label.htmlFor = task.id; //set the 
        label.append(task.name); // make the name of the label show up 
        tasksContainer.appendChild(taskElement); // append task to the container
    });
}

function renderTaskCount(selectedList) { // render the number of incomplete tasks in a list
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length; // getting only the number of tasks that are NOT complete
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks"; // convert that to string, single or plural
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
}

function renderLists() {
    lists.forEach(list => { // cycle through each Object in lists variable
        const listElement = document.createElement('li'); // creates li element in html
        listElement.dataset.listId = list.id; // with data atribute, ads id from key: value pair of the object to the html element so we can identify which list is selected
        listElement.classList.add("list-name"); // adding class to 'li' element
        listElement.innerText = list.name; // sets the >text< inside of the li element in the list object
        if (list.id === selectedListId) { // it means the list is currently selected
            listElement.classList.add('active-list');
        }
        listsContainer.appendChild(listElement); // append the created list element in html
    });
}

function clearElement(element) { //the function for clearing the container everytime it is started
    while (element.firstChild) { // if the element has 1st child 
        element.removeChild(element.firstChild) // remove it until empty
    }
}

render();