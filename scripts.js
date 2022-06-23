//header
const menuBtn = document.querySelector('[data-menu-btn]');
const searchInput = document.querySelector('[data-search-bar-input]');
const searchCancel = document.querySelector('[data-cancel-search]');
const editUsername = document.querySelector('[data-username]');

//sidebar
const sidebar = document.querySelector('[data-sidebar]');
const profilePicInput = document.querySelector('[data-profile-pic-input]');
const profilePicContainer = document.querySelector('[data-profile-pic]');
const DashboardBtn = document.querySelector('[data-dashboard]');
const totalTasksRemain = document.querySelector('[data-total-tasks-remain]');
const categoriesContainer = document.querySelector(
  '[data-categories-container]'
);
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');
const addCategoryErrorMsg = document.querySelector('[data-add-category-error-msg]');
const deleteCategoryBtn = document.querySelector('[data-delete-category]');

//sub-menu
const displayCategoryTitle = document.querySelector(
  '[data-display-category-title]'
);
const taskRemain = document.querySelector('[data-task-remain]');
const viewModulesBtn = document.querySelector('[data-view-modules]');
const viewListsBtn = document.querySelector('[data-view-lists]');
const clearCurrentListBtn = document.querySelector('[data-clear-current-list]');
const clearWholeListBtn = document.querySelector('[data-delete-whole-list]');

//cards
const sortAllBtn = document.querySelector('[data-sort-all]');
const sortTodayBtn = document.querySelector('[data-sort-today]');
const sortOngoingBtn = document.querySelector('[data-sort-ongoing]');
const sortCompletedBtn = document.querySelector('[data-sort-completed]');

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
const newTaskErrorMsg = document.querySelector('[data-new-task-error-msg]');
const saveEditTask = document.querySelector('[data-save-edit-task]');

// localStorage.removeItem('todo.categoriesList')
// localStorage.removeItem('todo.profilePic')

// ================== variables =====================
let sortPreference;

const LOCAL_STORAGE_USERNAME_KEY = 'todo.username';
const LOCAL_STORAGE_PROFILE_PIC_KEY = 'todo.profilePic';
const LOCAL_STORAGE_CATEGORIES_KEY = 'todo.categoriesList';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'todo.selectedCategoryId';
const LOCAL_STORAGE_VIEW_PREFERENCE = 'todo.viewPreference';
// const LOCAL_STORAGE_SORT_PREFERENCE = 'todo.sortPreference';

let username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY) || 'Stranger';
let profilePic = localStorage.getItem(LOCAL_STORAGE_PROFILE_PIC_KEY);
let masterList =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let selectedCategoryId = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY)
);
let viewPreference =
  localStorage.getItem(LOCAL_STORAGE_VIEW_PREFERENCE) || 'view-modules';

// ================== event listeners =====================

document.addEventListener('DOMContentLoaded', () => {
  if (profilePic) {
    profilePicContainer.style.backgroundImage = `url(${profilePic})`;
  }

  if (username) {
    editUsername.innerText = username;
  }
});

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
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

editUsername.addEventListener('keyup', (e) => {
  if (e.key == 'Enter') {
    editUsername.innerText = 'ERROR';
  }

  localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, e.target.innerText);
});

sidebar.addEventListener('click', () => {
  if (!sidebar.classList.contains('open')) {
    sidebar.classList.add('open');
  }
});

profilePicInput.addEventListener('change', function () {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const uploadedProfilePic = reader.result;
    profilePicContainer.style.backgroundImage = `url(${uploadedProfilePic})`;
    localStorage.setItem(LOCAL_STORAGE_PROFILE_PIC_KEY, reader.result);
  });
  reader.readAsDataURL(this.files[0]);
});

newCategoryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (newCategoryInput.value === null || newCategoryInput.value === '')
    return

  const categoryNameExists = masterList.some((item) => {
    return item.categoryName === newCategoryInput.value;
  });

  if (categoryNameExists) {
    addCategoryErrorMsg.classList.add('show');
    setTimeout(() => {
      addCategoryErrorMsg.classList.remove('show');
    }, 1500);
  }

  const newCategoryName = newCategoryInput.value;
  const newCategory = createCategory(newCategoryName);
  masterList.push(newCategory);
  newCategoryInput.value = null;
  save();
  render();
});

categoriesContainer.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedCategoryId = e.target.dataset.categoryId;

    newTaskCategory.value = returnSelectedCategory().categoryName;
    saveAndRender();
  }
});

newTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const selectedCategory = masterList.find(
    (item) => item.categoryName === newTaskCategory.value
  );

  if (selectedCategory === undefined) {
    newTaskErrorMsg.innerText = 'Please enter valid category name';
    return;
  } else {
    newTaskErrorMsg.innerText = '';
  }

  if (newTaskName.value === null || newTaskName.value === '') {
    newTaskErrorMsg.innerText = 'Please enter task name';
    return;
  } else {
    newTaskErrorMsg.innerText = '';
  }

  const newName = newTaskName.value;
  const newDescription = newTaskDescription.value || '';
  const newDueDate = newTaskDate.value || '';
  const newRemarks = newTaskRemarks.value || 'Remarks';
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

  selectedCategory.tasks.push(newTask);
  newTaskName.value = null;
  newTaskDescription.value = null;
  newTaskDate.value = null;
  newTaskRemarks.value = null;
  saveAndRender();
});

tasksContainer.addEventListener('click', (e) => {
  const selectedTaskId = e.target.id.replace(/[^0-9]/g, '');

  if (selectedTaskId === '') return;

  const selectedCategory = masterList.find((category) =>
    category.tasks.some((task) => task.id == selectedTaskId)
  );
  const selectedTask = selectedCategory.tasks.find(
    (task) => task.id == selectedTaskId
  );

  if (
    e.target.tagName.toLowerCase() === 'input' &&
    e.target.getAttribute('type') === 'checkbox'
  ) {
    selectedTask.complete = e.target.checked;
    saveAndRender();
  }

  if (e.target.hasAttribute('data-edit-task')) {
    document
      .querySelector(`#desc${selectedTaskId}`)
      .setAttribute('contenteditable', true);
    document
      .querySelector(`#rema${selectedTaskId}`)
      .setAttribute('contenteditable', true);

    document.querySelector(`#desc${selectedTaskId}`).style.border =
      '1px solid lightgrey';
    document.querySelector(`#rema${selectedTaskId}`).style.border =
      '1px solid lightgrey';

    document.querySelector(`#editBtns${selectedTaskId}`).classList.add('show');
  }

  if (e.target.hasAttribute('data-cancel-edit-task')) {
    render();
  }

  if (e.target.hasAttribute('data-save-edit-task')) {
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

  if (e.target.hasAttribute('data-delete-task')) {
    selectedCategory.tasks = selectedCategory.tasks.filter(
      (task) => task.id !== selectedTaskId
    );
    saveAndRender();
  }
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

  if (e.target.closest('[data-content-container]')) {
    sidebar.classList.remove('open');
  }
});

sortAllBtn.addEventListener('click', () => {
  sortPreference = 'all';
  toggleSortBtn(sortAllBtn);
  render();
});

sortTodayBtn.addEventListener('click', () => {
  sortPreference = 'today';
  toggleSortBtn(sortTodayBtn);
  const sortedTasksObject = sortTodayTasks();
  clearElement(tasksContainer);
  renderTasks(sortedTasksObject);
});

sortOngoingBtn.addEventListener('click', () => {
  sortPreference = 'ongoing';
  toggleSortBtn(sortOngoingBtn);
  const sortedTasksObject = sortOngoingTasks();
  clearElement(tasksContainer);
  renderTasks(sortedTasksObject);
});

sortCompletedBtn.addEventListener('click', () => {
  sortPreference = 'completed';
  toggleSortBtn(sortCompletedBtn);
  const sortedTasksObject = sortCompletedTasks();
  clearElement(tasksContainer);
  renderTasks(sortedTasksObject);
});

clearCurrentListBtn.addEventListener('click', clearCurrentList);
clearWholeListBtn.addEventListener('click', clearWholeList);

// ================== functions =====================

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
  updateTotalTasksRemain();
  toggleSortBtn(sortAllBtn);

  if (selectedCategoryId === null) {
    const allTasks = returnAllTasks();
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
  tasksContainer.classList.add(viewPreference);

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

    const Edit = newElement.querySelector('[data-edit-task]');
    Edit.id = 'edit' + task.id;

    const editBtnsContainer = newElement.querySelector(
      '[data-edit-btns-container]'
    );
    editBtnsContainer.id = 'editBtns' + task.id;

    const saveEdits = newElement.querySelector('[data-save-edit-task]');
    saveEdits.id = 'save' + task.id;

    const cancelEdits = newElement.querySelector('[data-cancel-edit-task]');
    cancelEdits.id = 'canc' + task.id;

    const deleteThis = newElement.querySelector('[data-delete-task]');
    deleteThis.id = 'dele' + task.id;

    const taskWrapper = newElement.querySelector('.task-wrapper');
    taskWrapper.classList.add(viewPreference);

    if (checkbox.checked) {
      taskWrapper.style.borderColor = 'rgba(222,220,238,1)';
      newElement.querySelector('[data-edit-task-btn]').style.display = 'none';
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

function sortTodayTasks() {
  const today = new Date().toLocaleDateString('en-CA');

  if (selectedCategoryId === null) {
    const allTasks = returnAllTasks();
    const sortedTasksArray = allTasks.filter((task) => task.dueDate === today);
    return { tasks: sortedTasksArray };
  } else {
    const selectedCategory = returnSelectedCategory();
    const sortedTasksArray = selectedCategory.tasks.filter(
      (task) => task.dueDate === today
    );
    return { tasks: sortedTasksArray };
  }
}

function sortOngoingTasks() {
  if (selectedCategoryId === null) {
    const allTasks = returnAllTasks();
    const sortedTasksArray = allTasks.filter((task) => task.complete === false);
    return { tasks: sortedTasksArray };
  } else {
    const selectedCategory = returnSelectedCategory();
    const sortedTasksArray = selectedCategory.tasks.filter(
      (task) => task.complete === false
    );
    return { tasks: sortedTasksArray };
  }
}

function sortCompletedTasks() {
  if (selectedCategoryId === null) {
    const allTasks = returnAllTasks();
    const sortedTasksArray = allTasks.filter((task) => task.complete === true);
    return { tasks: sortedTasksArray };
  } else {
    const selectedCategory = returnSelectedCategory();
    const sortedTasksArray = selectedCategory.tasks.filter(
      (task) => task.complete === true
    );
    return { tasks: sortedTasksArray };
  }
}

function toggleSortBtn(clickedBtn) {
  if (clickedBtn.classList.contains('show')) return;

  const sortBtns = [sortAllBtn, sortTodayBtn, sortOngoingBtn, sortCompletedBtn];
  clickedBtn.classList.add('show');
  sortBtns.forEach((btn) => {
    if (btn !== clickedBtn) btn.classList.remove('show');
  });
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

function updateTaskRemain(Category) {
  let taskNumRemain = Category.tasks.filter(
    (task) => task.complete === false
  ).length;
  taskRemain.innerText = `${taskNumRemain} task(s) remain`;
}

function updateTotalTasksRemain() {
  const allTasks = returnAllTasks();
  const allTasksObject = { tasks: allTasks };
  let totalRasksRemain = allTasksObject.tasks.filter(
    (task) => task.complete === false
  ).length;
  totalTasksRemain.innerText = totalRasksRemain;
}

function deleteCategory() {
  masterList = masterList.filter(
    (category) => category.id !== selectedCategoryId
  );
  selectedCategoryId = null;
  saveAndRender();
}

function clearCurrentList() {
  if (sortPreference === 'all') {
    clearWholeList();
  } else if (sortPreference === 'today') {
    const todayTasks = sortTodayTasks();
    const todayTasksIds = todayTasks.tasks.map((task) => task.id).flat();

    masterList.forEach((category) => {
      category.tasks = category.tasks.filter(
        (task) => !todayTasksIds.includes(task.id)
      );
    });
    saveAndRender();
  } else if (sortPreference === 'ongoing') {
    const ongoingTasks = sortOngoingTasks();
    const ongoingTasksIds = ongoingTasks.tasks.map((task) => task.id).flat();

    masterList.forEach((category) => {
      category.tasks = category.tasks.filter(
        (task) => !ongoingTasksIds.includes(task.id)
      );
    });
    saveAndRender();
  } else {
    const completedTasks = sortCompletedTasks();
    const completedTasksIds = completedTasks.tasks
      .map((task) => task.id)
      .flat();
    masterList.forEach((category) => {
      category.tasks = category.tasks.filter(
        (task) => !completedTasksIds.includes(task.id)
      );
    });
    saveAndRender();
  }
}

function clearTodayTasks() {
  const today = new Date().toLocaleDateString('en-CA');

  if (selectedCategoryId === null) {
    const allTasks = returnAllTasks();
    const sortedTasksArray = allTasks.filter((task) => task.dueDate !== today);
    return { tasks: sortedTasksArray };
  } else {
    const selectedCategory = returnSelectedCategory();
    const sortedTasksArray = selectedCategory.tasks.filter(
      (task) => task.dueDate !== today
    );
    return { tasks: sortedTasksArray };
  }
}

function clearWholeList() {
  if (selectedCategoryId === null) {
    masterList.forEach((category) => {
      category.tasks = [];
    });
  } else {
    const selectedCategory = returnSelectedCategory();
    selectedCategory.tasks = [];
  }
  saveAndRender();
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

//for selectedCategoryId !== null
function returnSelectedCategory() {
  return masterList.find((category) => category.id == selectedCategoryId);
}

function returnSelectedTask(e) {
  const selectedCategory = returnSelectedCategory();
  return selectedCategory.tasks.find((task) => task.id == e);
}

function returnAllTasks() {
  return masterList.map((category) => category.tasks).flat();
}

//to load the data from local storage when refresh
render();
