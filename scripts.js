//header
const menuBtn = document.querySelector('[data-menu-btn]');
const sidebar = document.querySelector('[data-sidebar]');
const searchInput = document.querySelector('[data-search-bar-input]');
const searchCancel = document.querySelector('[data-cancel-search]');
const profilePicInput = document.querySelector("[data-profile-pic-input]");
const profilePicContainer = document.querySelector("[data-profile-pic]")

//sidebar
const DashboardBtn = document.querySelector('[data-dashboard]');
const categoriesContainer = document.querySelector(
  '[data-categories-container]'
);
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');
const deleteCategoryBtn = document.querySelector('[data-delete-category]');

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
const newTaskCategory = document.querySelector('[data-new-task-category]'); 
const newTaskName = document.querySelector('[data-new-task-name]'); 
const newTaskDescription = document.querySelector(
  '[data-new-task-description]'
);
const newTaskDate = document.querySelector('[data-new-task-date]');
const newTaskPriority = document.querySelectorAll('input[name="priority"]');
const newTaskRemarks = document.querySelector('[data-new-task-remarks]');
const saveEditTask = document.querySelector('[data-save-edit-task]');

// localStorage.removeItem('todo.categoriesList')
// localStorage.removeItem('todo.profilePic')

//variables
const LOCAL_STORAGE_CATEGORIES_KEY = 'todo.categoriesList';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'todo.selectedCategoryId';
const LOCAL_STORAGE_VIEW_PREFERENCE = 'todo.viewPreference';
const LOCAL_STORAGE_PROFILE_PIC_KEY = 'todo.profilePic';

let masterList =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let selectedCategoryId = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY)
);
let viewPreference =localStorage.getItem(LOCAL_STORAGE_VIEW_PREFERENCE) ||
  'view-modules';
let profilePic = localStorage.getItem(LOCAL_STORAGE_PROFILE_PIC_KEY) 


document.addEventListener("DOMContentLoaded", () => {
  if (profilePic) {
    profilePicContainer.style.backgroundImage = `url(${profilePic})`;
  }
})

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open')
})

profilePicInput.addEventListener("change", function() {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const uploadedProfilePic = reader.result;
    profilePicContainer.style.backgroundImage = `url(${uploadedProfilePic})`;
    localStorage.setItem(LOCAL_STORAGE_PROFILE_PIC_KEY, reader.result)
  });
  reader.readAsDataURL(this.files[0]);
});

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

    newTaskCategory.value = returnSelectedCategory().categoryName;
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
    newPriority,
    newRemarks
  );
  const selectedCategory = returnSelectedCategory();
  selectedCategory.tasks.push(newTask);
  newTaskName.value = null;
  newTaskDescription.value = null;
  newTaskDate.value = null;
  newTaskRemarks.value = null;
  saveAndRender();
});

//when a task is selected
tasksContainer.addEventListener('click', (e) => {
  if (
    e.target.tagName.toLowerCase() === 'input' &&
    e.target.getAttribute('type') === 'checkbox'
  ) {
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
  }

  if (e.target.hasAttribute('data-save-edit-task')) {
    const selectedTaskId = e.target.id.replace(/[^0-9]/g, '');

    const selectedCategory = masterList.find((category) =>
      category.tasks.some((task) => task.id == selectedTaskId)
    );
    const selectedTask = selectedCategory.tasks.find(
      (task) => task.id == selectedTaskId
    );

    const newDescription = document.querySelector(
      `#desc${selectedTaskId}`
    ).innerText;
    const newRemarks = document.querySelector(
      `#rema${selectedTaskId}`
    ).innerText;

    selectedTask.description = newDescription;
    selectedTask.remarks = newRemarks;
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
  localStorage.setItem(LOCAL_STORAGE_VIEW_PREFERENCE, viewPreference);

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
    const selectedCategory = returnSelectedCategory();
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
    newElement.classList.add('category-list-item');
    newElement.innerText = item.categoryName;
    newElement.dataset.categoryId = item.id;
    if (selectedCategoryId == item.id) {
      newElement.classList.add('active');
    }
    categoriesContainer.append(newElement);
  });
}

function renderTasks(listObject) {
  tasksContainer.classList.add(viewPreference)

  listObject.tasks.forEach((task) => {
    const newElement = document.importNode(taskTemplate.content, true);

    const checkbox = newElement.querySelector('input[type=checkbox]');
    checkbox.id = task.id;
    checkbox.checked = task.complete;

    const labelTag = newElement.querySelector('label');
    labelTag.htmlFor = checkbox.id;
    labelTag.append(task.taskName);

    const descriptionDiv = newElement.querySelector('.description');
    descriptionDiv.id = 'desc' + task.id;
    descriptionDiv.innerText = task.description;

    const remarksDiv = newElement.querySelector('.remarks');
    remarksDiv.id = 'rema' + task.id;
    remarksDiv.innerText = task.remarks;

    const dateDiv = newElement.querySelector('.date');
    dateDiv.id = 'date' + task.id;
    dateDiv.innerText = task.dueDate;

    const priorityDiv = newElement.querySelector('.priority');
    priorityDiv.id = 'prio' + task.id;
    priorityDiv.innerText = task.priority;

    const saveEdits = newElement.querySelector('[data-save-edit-task]');
    saveEdits.id = 'save' + task.id;

    const taskWrapper = newElement.querySelector('.task-wrapper');
    taskWrapper.classList.add(viewPreference)
    if (checkbox.checked) {
      taskWrapper.style.borderColor = 'rgba(222,220,238,1)';
    } else if (task.priority === 'high') {
      taskWrapper.style.borderColor = 'rgba(243,129,129,1)';
    } else if (task.priority === 'medium') {
      taskWrapper.style.borderColor = 'rgba(252,227,138,1)';
    } else {
      taskWrapper.style.borderColor = 'rgba(149,225,211,1)';
    }

    tasksContainer.append(newElement);
  });

  viewListsBtn.addEventListener('click', () => {
    if (viewPreference === 'view-lists') return;
    else {
      changeView();
      viewPreference = 'view-lists';
    }
  });

  viewModulesBtn.addEventListener('click', () => {
    if (viewPreference === 'view-modules') return;
    else {
      changeView();
      viewPreference = 'view-modules';
    }
  });
}

function changeView() {
  const taskWrapper = document.querySelectorAll('.task-wrapper');

  tasksContainer.classList.toggle('view-modules');
  tasksContainer.classList.toggle('view-lists');
  for (var i = 0; i < taskWrapper.length; i++) {
    taskWrapper[i].classList.toggle('view-modules');
    taskWrapper[i].classList.toggle('view-lists');
  }
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
