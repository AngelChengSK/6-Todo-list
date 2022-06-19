const DashboardBtn = document.querySelector('[data-dashboard]');
const categoriesContainer = document.querySelector(
  '[data-categories-container]'
);
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');
const deleteCategoryBtn = document.querySelector('[data-delete-category]');
// const searchForm = document.querySelector('[data-search-bar-form]');
const searchInput = document.querySelector('[data-search-bar-input]');
const searchCancel = document.querySelector('[data-cancel-search]');
const displayCategoryTitle = document.querySelector(
  '[data-display-category-title]'
);
const taskRemain = document.querySelector('[data-task-remain]');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const tasksContainer = document.querySelector('[data-tasks-container]');
const taskTemplate = document.querySelector('#task-template');
const clearCompletedTasksBtn = document.querySelector(
  '[data-clear-completed-tasks]'
);
const deleteWholeListBtn = document.querySelector('[data-delete-whole-list]');

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

  if (newTaskInput.value === null || newTaskInput.value === '') return;
  const newTaskName = newTaskInput.value;
  const newTask = createTask(newTaskName);
  const selectedCategory = masterList.find(
    (category) => category.id == selectedCategoryId
  );
  selectedCategory.tasks.push(newTask);
  newTaskInput.value = null;
  saveAndRender();
});

//when a task is selected
tasksContainer.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'input') {
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
    save();
    updateTaskRemain(selectedCategory);
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
clearCompletedTasksBtn.addEventListener('click', clearCompletedTasks);
deleteWholeListBtn.addEventListener('click', deleteWholeList);

function createCategory(name) {
  return {
    id: Date.now().toString(),
    categoryName: name,
    tasks: []
  };
}

function createTask(name) {
  return {
    id: Date.now().toString(),
    taskName: name,
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
    const selectedCategory = masterList.find(
      (category) => category.id == selectedCategoryId
    );
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
    const selectedCategory = masterList.find(
      (category) => category.id == selectedCategoryId
    );
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
    const inputTag = newElement.querySelector('input');
    inputTag.id = task.id;
    inputTag.checked = task.complete;
    const labelTag = newElement.querySelector('label');
    labelTag.htmlFor = inputTag.id;
    labelTag.append(task.taskName);
    tasksContainer.append(newElement);
  });
}

function updateTaskRemain(Category) {
  // const selectedCategory = masterList.find(
  //   (category) => category.id === selectedCategoryId
  // );
  let taskNumRemain = Category.tasks.filter(
    (task) => task.complete === false
  ).length;
  taskRemain.innerText = `${taskNumRemain} tasks remains`;
}

// function renderAllTasks() {
//   const allTasks = masterList.map((category) => category.tasks).flat();
//   const allCategories = {tasks: allTasks};
//   renderTasks(allCategories);
// }

function deleteCategory() {
  masterList = masterList.filter(
    (category) => category.id !== selectedCategoryId
  );
  selectedCategoryId = null;
  saveAndRender();
}

function clearCompletedTasks() {
  let selectedCategory = masterList.find(
    (category) => category.id == selectedCategoryId
  );
  selectedCategory.tasks = selectedCategory.tasks.filter(
    (task) => task.complete === false
  );
  saveAndRender();
}

function deleteWholeList() {
  const selectedCategory = masterList.find(
    (category) => category.id == selectedCategoryId
  );
  selectedCategory.tasks = [];
  saveAndRender();
}

//to load the data from local storage when refresh
render();
