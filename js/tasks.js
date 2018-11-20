const TASKS_NAME = 'tasks';
const STATE = {
    [TASKS_NAME]:[],
    formName: 'form1',
};

document.addEventListener("DOMContentLoaded",function () {
    initTaskContainer();
});

function printNoTasks() {
    coreInsertLiToList({task: "Дел нет."})
}

function updateLocalStorage(varName,objData) {
    //window.localStorage.setItem(varName,objData);
    var tmp = JSON.stringify(objData);
    localStorage.setItem(varName,tmp);
    return true;
}

function getDataFromLocalStorage(varName) {
    return JSON.parse(localStorage.getItem(varName)) || [];
}

function initTaskContainer() {
    let data = STATE[TASKS_NAME] = getDataFromLocalStorage(TASKS_NAME);
    let keysCount = data.length || 0;//Object.keys(data).length || 0;

    if (!keysCount) {
        printNoTasks();
    }
    else {
        for (let i = 0; i < keysCount; i++) {
            coreInsertLiToList(data[i],true,i);
        }
    }
}

function insertItemToList() {
    let task = document.getElementById('task_data').value;
    let errCounter = 0;
    task = task.trim();
    if (!task.length) {
        printErrorHelper('task_data','Нужно ввести задание!',true);
        errCounter++;
    }
    let reminder = document.getElementById('reminder_date').value;
    reminder = reminder.trim();
    if (!reminder.length) {
        printErrorHelper('reminder_data','Нужно ввести дату!',true);
        errCounter++;
    }
    let check = document.getElementById('important_check').checked;
    if (errCounter) {
        return false;
    }
    STATE[TASKS_NAME].push({task, reminder, check});
    updateFormAndState();
    return true;
}

function updateFormAndState() {
    updateLocalStorage(TASKS_NAME,STATE[TASKS_NAME]);
    clearForm();
    document.getElementById('task_list').innerHTML = '';
    initTaskContainer();
}

function printErrorHelper(id, msg, err = false) {
    let errorHelper = document.getElementById(id + '_help');
    errorHelper.innerText = msg;
    if (err) {
        errorHelper.classList.add('text-danger');
    }
    else {
        errorHelper.classList.remove('text-danger');
    }
}

function coreInsertLiToList(data, task = false, itemIndex = null) {
    let list = document.getElementById('task_list');
    let newListNode = document.createElement('li');
    newListNode.classList.add('list-group-item');
    if (itemIndex != null) {
        newListNode.setAttribute('data-index',itemIndex);
    }
    let emptyItem = getEmptyItemFromList(list);
    if (emptyItem !== null) {
        emptyItem.remove();
    }
    if (task) {
        newListNode.innerHTML = (data.check?'<i class="text-danger fa fa-exclamation-triangle"></i> ':'') + data.task +
            '<br /><span class="text-muted"><small>' + data.reminder + '</small></span>' +
            '<span class="delete-ico"><i class="fas fa-times-circle" onclick="deleteNode(' + itemIndex + ')"></i></span>';
        newListNode.setAttribute('data-type','task');
    }
    else {
        newListNode.innerHTML = data.task;
        newListNode.setAttribute('data-type','empty');
    }
    list.appendChild(newListNode);
    return true;
}

function deleteNode(itemIndex) {
    // let listItems = document.getElementById('task_list').childNodes;
    // for (let i = 0; i < listItems.length; i++) {
    //     if (dataId === listItems[i].getAttribute('data-index')) {
    //         listItems[i].remove();
    //     }
    // }
    //
    // if (listItems.length === 0) {
    //     printNoTasks();
    // }

    STATE[TASKS_NAME].splice(itemIndex,1);
    updateFormAndState();
}

function getEmptyItemFromList(list) {
    for (let i = 0; i < list.childNodes.length; i++) {
        if (typeof list.childNodes[i].getAttribute === "function" && list.childNodes[i].getAttribute('data-type') == 'empty') {
            return list.childNodes[i];
        }
    }
    return null;
}

function clearForm() {
    document.getElementById(STATE.formName).reset();
    printErrorHelper('task_data',"Введите название занятия");
    printErrorHelper('reminder_date',"Введите дату и время напоминания");
}

function clearTasks() {
    STATE[TASKS_NAME] = [];
    updateFormAndState();
    printNoTasks();
}

function openCalendar() {
    var calendarPosition = document.getElementById('calendar_button').getBoundingClientRect();
    var calendar = document.createElement('div');
    calendar.classList.add('calendar');
    calendar.innerText = 'here goes the calendar';
    calendar.style.cssText = 'top:' + (calendarPosition.top - 130) + ';left:' + (calendarPosition.left - 130) + ';';
    document.body.appendChild(calendar);
}