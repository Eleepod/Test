const TASKS_NAME = 'tasks';
const STATE = {
    [TASKS_NAME]:[],
    formName: 'form1',
    calendar: 'calendar',
    calendarDate: new Date(),
    showCalendar: false,
    //TODO может запоминать выбранную дату и закрашивать ее при листании месяцев, а так же открывать календарь с позицианированием на выбранной дате??
    chosen: null,
};

document.addEventListener("DOMContentLoaded",function () {
    buildCalendar();
    initTaskContainer();
    document.getElementById('calendar_left_arrow').addEventListener('click', function (event) {
        event.stopPropagation();
        calendarSwitchMonth(-1);
    });
    document.getElementById('calendar_right_arrow').addEventListener('click', function (event) {
        event.stopPropagation();
        calendarSwitchMonth(1);
    });
});

document.body.addEventListener('click', function(event){
    // let calendarPosition = document.getElementById('calendar').getBoundingClientRect();
    // if (calendarPosition.bottom >= event.clientY && calendarPosition.top <= event.clientY &&
    //     calendarPosition.left <= event.clientX && calendarPosition.right >= event.clientX) {
    //     event.stopPropagation();
    //     return 0;
    // }
    if (event.target.closest('#calendar')) {
        event.stopPropagation();
        return 0;
    }
    hideCalendar(event);
});

function printNoTasks() {
    coreInsertLiToList({task: "Дел нет."})
}

function updateLocalStorage(varName,objData) {
    //window.localStorage.setItem(varName,objData);
    let tmp = JSON.stringify(objData);
    localStorage.setItem(varName,tmp);
    return true;
}

function getDataFromLocalStorage(varName) {
    return JSON.parse(localStorage.getItem(varName)) || [];
}

function initTaskContainer() {

    document.getElementById('task_list').innerHTML = '';

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
        printErrorHelper('reminder_date','Нужно ввести дату!',true);
        errCounter++;
    }
    let check = document.getElementById('important_check').checked;
    if (errCounter) {
        alert("Ошибки ввода на странице!");
        return false;
    }
    STATE[TASKS_NAME].push({task, reminder, check});
    updateFormAndState();
    return true;
}

function updateFormAndState() {
    updateLocalStorage(TASKS_NAME,STATE[TASKS_NAME]);
    clearForm();
    initTaskContainer();
}

function printErrorHelper(id, msg, err = false) {
    let errorHelper = document.getElementById(id + '_help');
    errorHelper.innerText = msg;
    if (err) {
        errorHelper.classList.add('text-danger');
        errorHelper.classList.remove('text-muted');
    }
    else {
        errorHelper.classList.remove('text-danger');
        errorHelper.classList.add('text-muted');
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
    STATE[TASKS_NAME].splice(itemIndex,1);
    updateFormAndState();
}

function getEmptyItemFromList(list) {
    for (let i = 0; i < list.childNodes.length; i++) {
        if (typeof list.childNodes[i].getAttribute === "function" && list.childNodes[i].getAttribute('data-type') === 'empty') {
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

function showCalendar(event) {
    event.stopPropagation();
    if( STATE.showCalendar) {
        return false;
    }

    let calendar = document.getElementById(STATE.calendar);
    let button = document.getElementById('calendar_opener').getBoundingClientRect();

    calendar.style.top = "" + button.bottom;
    calendar.style.left = "" + button.left;
    calendar.style.display = "block";
    STATE.showCalendar = true;
}

function hideCalendar(event) {
    event.stopPropagation();
    let calendar = document.getElementById(STATE.calendar);
    if( !STATE.showCalendar) {
        return false;
    }
    calendar.style.display = "none";
    STATE.showCalendar = false;
    return true;
}

function buildCalendar() {

    let year = STATE.calendarDate.getFullYear();
    let month = STATE.calendarDate.getMonth();
    calendarPrintMonthHeader(year, month);

    let calendar = document.getElementById('calendar_table');
    calendar.innerHTML = '';
    //calendarAddHeaders(calendar);

    let today = new Date();
    let todayInThisMonth = today.getFullYear() === year && today.getMonth() === month;
    let todayMonthDifference = today.getMonth() - month + (today.getFullYear() - year) * 12;
    let todayDate = today.getDate();
    let monthData = getMonthData(year, month);
    let weekCounter = 1; //счетчик недель
    let dayCounter = 1;

    let lastDayOfPreviousMonth = getLastDayOfMonth(monthData.year,monthData.month - 1);
    while (weekCounter < 7) {
        let tr = document.createElement("tr");
        for (let i = 1; i < 8; i++) {
            let td = document.createElement("td");
            let currentDay = dayCounter;
            if (weekCounter === 1 && monthData.firstDayWeek > i) {
                currentDay = lastDayOfPreviousMonth - monthData.firstDayWeek + i + 1;
                td.classList.add('not_current');
                if (todayMonthDifference >= 0) {
                    td.classList.add('not_allowed');
                }
                td.setAttribute('data-month-shift',"-1");
            }
            else if (dayCounter > monthData.lastDay) {
                currentDay = dayCounter - monthData.lastDay;
                td.classList.add('not_current');
                if (todayMonthDifference > 0) {
                    td.classList.add('not_allowed');
                }
                td.setAttribute('data-month-shift',"1");
                dayCounter++;
            }
            else {

                if (todayInThisMonth && dayCounter === todayDate) {
                    td.classList.add('today');
                }
                if (todayMonthDifference > 0 || todayMonthDifference === 0 && currentDay < todayDate) {
                    td.classList.add('not_allowed');
                }
                td.setAttribute('data-month-shift',"0");
                dayCounter++;
            }
            td.innerText = "" + currentDay;
            if (!td.classList.contains('not_allowed')) {
                td.onclick = calendarDateClick;
            }
            tr.appendChild(td);
        }
        calendar.appendChild(tr);
        if (dayCounter > monthData.lastDay) { //в феврале может быть 4 недели
            break;
        }
        weekCounter++;
    }
}

function calendarDateClick(event) {
    let year = STATE.calendarDate.getFullYear();
    let month = STATE.calendarDate.getMonth() + Number(event.target.getAttribute('data-month-shift'));
    let day = Number(event.target.innerText);
    let chosenDate = new Date(year, month, day);
    STATE.chosen ? STATE.chosen.classList.remove('chosen') : null;
    event.target.classList.add('chosen');
    document.getElementById('reminder_date').value = chosenDate.toLocaleString('ru',{day : 'numeric', month: 'long', year: 'numeric'});
    STATE.chosen = event.target;
}

function calendarSwitchMonth(shift) {
    STATE.calendarDate = new Date(STATE.calendarDate.getFullYear(),STATE.calendarDate.getMonth() + shift,1);
    buildCalendar();
}

// function calendarAddHeaders(calendar) {
//     let daysArray = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
//     let tr = document.createElement("tr");
//     for (let i = 0; i < daysArray.length; i++) {
//         let th = document.createElement('th');
//         th.innerText = daysArray[i];
//         tr.appendChild(th);
//     }
//     calendar.appendChild(tr);
// }

function calendarPrintMonthHeader(year, month) {
    let monthArray = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    let calendarHeader = document.getElementById('calendar_header');
    calendarHeader.innerText = monthArray[month] + " " + year;
}

function getMonthData(year, month) {
    let firstDayOfMonth = new Date(year, month,1);
    let firstDayWeek = firstDayOfMonth.getDay();
    let lastDay = getLastDayOfMonth(year, month);
    firstDayWeek = !firstDayWeek ? 7 : firstDayWeek; //нумерация дней идет с 0 (ВС), поэтому вместо 0 ставим 7
    return {
        month,
        year,
        firstDayWeek, //день недели первого дня месяца
        lastDay,
    }
}

function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}