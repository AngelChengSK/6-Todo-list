//sidebar
const DashboardBtn = document.querySelector('[data-dashboard]');
const categoriesContainer = document.querySelector(
  '[data-categories-container]'
);
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');
const deleteCategoryBtn = document.querySelector('[data-delete-category]');
const searchInput = document.querySelector('[data-search-bar-input]');
const searchCancel = document.querySelector('[data-cancel-search]');

//sub-menu
const displayCategoryTitle = document.querySelector(
  '[data-display-category-title]'
);
const taskRemain = document.querySelector('[data-task-remain]');
const viewModulesBtn = document.querySelector('[data-view-modules]');
const viewListsBtn = document.querySelector('[data-view-lists]');
const deleteTaskIcon = document.querySelector('[data-delete-icon]');
const clearCompletedTasksBtn = document.querySelector(
  '[data-clear-completed-tasks]'
);
const deleteWholeListBtn = document.querySelector('[data-delete-whole-list]');

//new task inputs
const tasksContainer = document.querySelector('[data-tasks-container]');
const taskTemplate = document.querySelector('#task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskName = document.querySelector('[data-new-task-name]'); //name
const newTaskDescription = document.querySelector(
  '[data-new-task-description]'
);
const newTaskDate = document.querySelector('[data-new-task-date]');
const newTaskPriority = document.querySelectorAll('input[name="priority"]');
const newTaskRemarks = document.querySelector('[data-new-task-remarks]');
const saveEditTask = document.querySelector('[data-save-edit-task]');



// localStorage.removeItem('todo.categoriesList')
// localStorage.removeItem('todo.selectedCategoryId')

//variables
const LOCAL_STORAGE_CATEGORIES_KEY = 'todo.categoriesList';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'todo.selectedCategoryId';
let masterList =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let selectedCategoryId = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY)
);

//local storage: the key and value are always string, need to stringify when store, and parse when restore

//when new category name is submitted
newCategoryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (newCategoryInput.value === null || newCategoryInput.value === '') return;
  const newCategoryName = newCategoryInput.value;
  const newCategory = createCategory(newCategoryName);
  masterList.push(newCategory);
  newCategoryInput.value = null;
  save();
  render();
});

//when a category is selected
categoriesContainer.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedCategoryId = e.target.dataset.categoryId;
    saveAndRender();
  }
});

//when new task is submitted
newTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (newTaskName.value === null || newTaskName.value === '') return;

  const newName = newTaskName.value;
  const newDescription = newTaskDescription.value || '';
  const newDueDate = newTaskDate.value || '';
  const newRemarks = newTaskRemarks.value || '';
  const newPriority = document.querySelector(
    "input[type='radio'][name=priority]:checked"
  ).value;

  const newTask = createTask(
    newName,
    newDescription,
    newDueDate,
    newRemarks,
    newPriority
  );
  const selectedCategory = returnSelectedCategory();
  selectedCategory.tasks.push(newTask);
  newTaskName.value = null;
  saveAndRender();
});

//when a task is selected
tasksContainer.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'input' && e.target.getAttribute('type') === 'checkbox') {
    // if input tag's id and label tag's for property have the same value, the two tags are linked up, when users click on the label tag(=the text), the input tag (=checkbox) will also be checked
    // otherwise, the input tag (=checkbox) will only be checked when users click on it directly
    const selectedTaskId = e.target.id;

    const selectedCategory = masterList.find((category) =>
      category.tasks.some((task) => task.id == selectedTaskId)
    );
    const selectedTask = selectedCategory.tasks.find(
      (task) => task.id == selectedTaskId
    );
    selectedTask.complete = e.target.checked;
    saveAndRender();
    // updateTaskRemain(selectedCategory);
  }

  if (e.target.hasAttribute('data-save-edit-task')) {
    const selectedTaskId = e.target.id;
    const selectedCategory = masterList.find((category) =>
      category.tasks.some((task) => task.id == selectedTaskId)
    );
    const selectedTask = selectedCategory.tasks.find(
      (task) => task.id == selectedTaskId
    );

    const newVersionDescription = document.querySelector(`#desc${ selectedTaskId }`).innerText;
    
    selectedTask.description = newVersionDescription;
    saveAndRender();
  }
});

//when typing in search bar
searchInput.addEventListener('keyup', (e) => {
  const searchString = searchInput.value;
  searchTasks(searchString);
  if (e.key === 'Enter') {
    e.preventDefault();
    searchInput.value = '';
  }
  if (searchInput.value !== '') {
    searchCancel.classList.add('active');
  } else {
    searchCancel.classList.remove('active');
  }
});

searchCancel.addEventListener('click', () => {
  searchInput.value = '';
  searchTasks('');
  searchCancel.classList.remove('active');
});

DashboardBtn.addEventListener('click', () => {
  selectedCategoryId = null;
  saveAndRender();
});

deleteCategoryBtn.addEventListener('click', deleteCategory);

//dropdown menu
document.addEventListener('click', (e) => {
  const isDropdownBtn = e.target.matches('[data-dropdown-btn]');
  if (!isDropdownBtn && e.target.closest('[data-dropdown]') !== null) return;
  // if it is not a dropdown btn && is inside a dropdown menu, return
  //.closest will return the closest ancestor that match the selecting criteria

  let currentDropdown;
  if (isDropdownBtn) {
    currentDropdown = e.target.closest('[data-dropdown]');
    currentDropdown.classList.toggle('show');
  }

  document.querySelectorAll('[data-dropdown].show').forEach((dropdown) => {
    //close the dropdown that has been opened, except the one I just clicked
    if (dropdown === currentDropdown) return;
    dropdown.classList.remove('show');
  });
});

clearCompletedTasksBtn.addEventListener('click', clearCompletedTasks);
deleteWholeListBtn.addEventListener('click', deleteWholeList);

function createCategory(name) {
  return {
    id: Date.now().toString(),
    categoryName: name,
    tasks: []
  };
}

function createTask(name, description, date, priority, remarks) {
  return {
    id: Date.now().toString(),
    taskName: name,
    description: description,
    dueDate: date,
    priority: priority,
    remarks: remarks,
    complete: false
  };
}

function saveAndRender() {
  save();
  render();
}

function save() {
  localStorage.setItem(
    LOCAL_STORAGE_CATEGORIES_KEY,
    JSON.stringify(masterList)
  );
  localStorage.setItem(
    LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY,
    selectedCategoryId
  );
}

function render() {
  clearElement(categoriesContainer);
  renderCategories();
  clearElement(tasksContainer);

  if (selectedCategoryId === null) {
    const allTasks = masterList.map((category) => category.tasks).flat();
    const allCategories = { tasks: allTasks };
    renderTasks(allCategories);
    displayCategoryTitle.innerText = 'Dashboard';
    updateTaskRemain(allCategories);
  } else {
    const selectedCategory = returnSelectedCategory()
    displayCategoryTitle.innerText = selectedCategory.categoryName;
    renderTasks(selectedCategory);
    updateTaskRemain(selectedCategory);
  }
}

function searchTasks(searchString) {
  if (selectedCategoryId === null) {
    const allTasksArray = masterList.map((category) => category.tasks).flat();
    const filteredTasksArray = allTasksArray.filter((task) =>
      task.taskName.includes(searchString)
    );
    const filteredTasksObject = { tasks: filteredTasksArray };
    clearElement(tasksContainer);
    renderTasks(filteredTasksObject);
  } else {
    const selectedCategory = returnSelectedCategory();
    const filteredTasksArray = selectedCategory.tasks.filter((task) =>
      task.taskName.includes(searchString)
    );
    const filteredTasksObject = { tasks: filteredTasksArray };
    clearElement(tasksContainer);
    renderTasks(filteredTasksObject);
  }
}

//delete html element
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function renderCategories() {
  masterList.forEach((item) => {
    const newElement = document.createElement('li');
    newElement.classList.add('category-item');
    newElement.innerText = item.categoryName;
    newElement.dataset.categoryId = item.id;
    if (selectedCategoryId == item.id) {
      newElement.classList.add('active');
    }
    categoriesContainer.append(newElement);
  });
}

function renderTasks(listObject) {
  listObject.tasks.forEach((task) => {
    const newElement = document.importNode(taskTemplate.content, true);

    const checkbox = newElement.querySelector('input[type=checkbox]');
    checkbox.id = task.id;
    checkbox.checked = task.complete;

    const labelTag = newElement.querySelector('label');
    labelTag.htmlFor = checkbox.id;
    labelTag.append(task.taskName);

    const descriptionDiv = newElement.querySelector('.description');
    descriptionDiv.id = "desc" + task.id;
    descriptionDiv.innerText = task.description;

    const remarksDiv = newElement.querySelector('.remarks');
    remarksDiv.innerText = task.remarks;

    const dateDiv = newElement.querySelector('.date');
    dateDiv.innerText = task.dueDate;

    const priorityDiv = newElement.querySelector('.priority');
    priorityDiv.innerText = task.priority;

    const saveEdits = newElement.querySelector('[data-save-edit-task]');
    saveEdits.id = task.id;

    tasksContainer.append(newElement);
  });

  const taskWrapper = document.querySelectorAll('.task-wrapper');
  // const cardBtnsContainer = document.querySelector('[data-card-btns-container]');

  viewListsBtn.addEventListener('click', () => {
    const listView = tasksContainer.classList.contains('view-lists');

    if (listView) return;
    else {
      tasksContainer.classList.remove('view-modules');
      tasksContainer.classList.add('view-lists');
      for (var i = 0; i < taskWrapper.length; i++) {
        taskWrapper[i].classList.remove('view-modules');
        taskWrapper[i].classList.add('view-lists');
      }
    }
  });

  viewModulesBtn.addEventListener('click', () => {
    const modulesView = tasksContainer.classList.contains('view-modules');

    if (modulesView) return;
    else {
      tasksContainer.classList.remove('view-lists');
      tasksContainer.classList.add('view-modules');
      for (var i = 0; i < taskWrapper.length; i++) {
        taskWrapper[i].classList.remove('view-lists');
        taskWrapper[i].classList.add('view-modules');
      }
    }
  });
}

function updateTaskRemain(Category) {
  let taskNumRemain = Category.tasks.filter(
    (task) => task.complete === false
  ).length;
  taskRemain.innerText = `${taskNumRemain} tasks remains`;
}

function deleteCategory() {
  masterList = masterList.filter(
    (category) => category.id !== selectedCategoryId
  );
  selectedCategoryId = null;
  saveAndRender();
}

function clearCompletedTasks() {
  if (selectedCategoryId === null) {
    setSelectedCategoryId();
  }

  const selectedCategory = returnSelectedCategory();
  selectedCategory.tasks = selectedCategory.tasks.filter(
    (task) => task.complete === false
  );
  saveAndRender();
}

function deleteWholeList() {
  const selectedCategory = returnSelectedCategory();
  selectedCategory.tasks = [];
  saveAndRender();
}

// function saveEdits() {
//   const newVersionDescription = document.querySelector('.description');

//   //get the edited element content
//   var userVersion = editableElemnt.innerHTML;

  
// }



// cardBtnsContainer.addEventListener('click', (e) => {
//   if (e.target.tagName.toLowerCase() === 'button') {
//     const selectedTaskId = e.target.id;
//     const selectedCategory = masterList.find((category) =>
//       category.tasks.some((task) => task.id == selectedTaskId)
//     );
//     const selectedTask = selectedCategory.tasks.find(
//       (task) => task.id == selectedTaskId
//     );

//     const newVersionDescription = document.getElementById(e.target.id).innerText;
    
//     selectedTask.description = newVersionDescription;
//     saveAndRender();


//   }
    
//     updateTaskRemain(selectedCategory);
//   }
// );








//for selectedCategoryId !== null
function returnSelectedCategory() {
  return masterList.find((category) => category.id == selectedCategoryId);
}

function returnSelectedTask(e) {
  const selectedCategory = returnSelectedCategory();
  return selectedCategory.tasks.find((task) => task.id == e);
}

//to load the data from local storage when refresh
render();
