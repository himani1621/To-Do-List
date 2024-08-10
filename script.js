document.addEventListener('DOMContentLoaded', loadTasks);

document.querySelector('.addButton').addEventListener('click', function() {
    const input = document.querySelector('.input').value;
    const date = document.querySelector('.date').value;
    const workType = document.querySelector('.workType').value;

    if (input === '') {
        alert('Please enter a task.');
        return;
    }

    const taskDate = new Date(date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (taskDate < today) {
        alert('Oops, you can’t add tasks for past dates.');
        return;
    }

    const columnId = getColumnId(taskDate, workType);

    if (!columnId) {
        alert('Invalid date. You can add tasks for only three days.');
        return;
    }

    const column = document.getElementById(columnId);
    const item = createTaskElement(input, date, workType);

    column.appendChild(item);
    resetInputFields();
    startTimer(item.querySelector('.timer'));
    updateCompletionMessage();
    saveTasks();
});

function getColumnId(taskDate, workType) {
    const today = new Date().toISOString().split('T')[0];
    if (taskDate === today) return `today${capitalizeFirstLetter(workType)}`;
    if (isTomorrow(taskDate)) return `tomorrow${capitalizeFirstLetter(workType)}`;
    if (isDayAfterTomorrow(taskDate)) return `dayAfterTomorrow${capitalizeFirstLetter(workType)}`;
    return null;
}

function isTomorrow(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return date === tomorrow.toISOString().split('T')[0];
}

function isDayAfterTomorrow(date) {
    const today = new Date();
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    return date === dayAfterTomorrow.toISOString().split('T')[0];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createTaskElement(input, date, workType){
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
        <span class="item_input">${input}</span>
        <span class="date_span">${date}</span>
        <span class="timer">Timer: 0s</span>
        <button class="editButton" onclick="editTask(this)">Edit</button>
        <button class="completedButton" onclick="completeTask(this)">Complete</button>
        <button class="removeButton" onclick="removeTask(this)">Remove</button>
    `;
    return item;
}

function resetInputFields() {
    document.querySelector('.input').value = '';
    document.querySelector('.date').value = '';
    document.querySelector('.workType').value = 'work';
}

function completeTask(button) {
    const item = button.closest('.item');
    item.querySelector('.item_input').classList.add('completed');
    item.querySelector('.completedButton').disabled = true;
    updateCompletionMessage();
    saveTasks();
}

function editTask(button) {
    const item = button.closest('.item');
    const input = prompt('Edit your task:', item.querySelector('.item_input').textContent);
    if (input !== null) {
        item.querySelector('.item_input').textContent = input;
        saveTasks();
    }
}

function updateCompletionMessage() {
    const completedCount = document.querySelectorAll('.item_input.completed').length;
    const totalTasks = document.querySelectorAll('.item_input').length;
    const message = document.getElementById('message');
    const sparkle = document.getElementById('sparkle');
    const celebrationSound = document.getElementById('celebrationSound');

    if (completedCount === totalTasks && totalTasks > 0) {
        sparkle.classList.remove('hidden');
        let sparkleElements = [];
        for (let i = 0; i < 10; i++) {
            let sparkleElement = document.createElement('div');
            sparkleElement.className = 'sparkle-fall';
            sparkleElement.textContent = '✨';
            sparkleElement.style.left = `${Math.random() * 100}%`;
            sparkleElement.style.animationDuration = `${Math.random() * 2 + 2}s`;
            sparkle.appendChild(sparkleElement);
            sparkleElements.push(sparkleElement);
        }

        setTimeout(() => {
            sparkleElements.forEach(element => element.remove());
            sparkle.classList.add('hidden');
        }, 3000);

        celebrationSound.play();
        message.innerHTML = 'Woohoo! You completed all tasks for today!🎊🎉';
    } else if (completedCount === 1) {
        message.innerText = 'Yay! You completed 1 task';
    } else if (completedCount === 2) {
        message.innerText = 'Yay! You completed 2 tasks';
    } else if (completedCount > 2) {
        message.innerText = `Yay! You completed ${completedCount} tasks`;
    }
}

function removeTask(button) {
    const item = button.closest('.item');
    item.remove();
    updateCompletionMessage();
    saveTasks();
}

function startTimer(timerElement) {
    let seconds = 0;
    const interval = setInterval(() => {
        seconds++;
        timerElement.textContent = `Timer: ${seconds}s`;
    }, 1000);

    timerElement.closest('.item').querySelector('.completedButton').addEventListener('click', () => {
        clearInterval(interval);
    });
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.item').forEach(item => {
        const input = item.querySelector('.item_input').textContent;
        const date = item.querySelector('.date_span').textContent;
        const timer = item.querySelector('.timer').textContent;
        const completed = item.querySelector('.item_input').classList.contains('completed');
        tasks.push({ input, date, timer, completed });
    });
    console.log('Saving tasks:', tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log('Loaded tasks:', tasks);
    tasks.forEach(task => {
        const { input, date, timer, completed } = task;

        const columnId = getColumnId(date, 'work');  

        if (!columnId) return;

        const column = document.getElementById(columnId);
        const item = createTaskElement(input, date, 'work');  

        item.querySelector('.timer').textContent = timer;

        if (completed) {
            item.querySelector('.item_input').classList.add('completed');
            item.querySelector('.completedButton').disabled = true;
        }

        column.appendChild(item);
        startTimer(item.querySelector('.timer'));
    });
    updateCompletionMessage();
}
