// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Create a function to generate a unique task id
function generateTaskId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Create a function to create a task card
function createTaskCard(task) {
    let taskCard = `
        <div class="task-card card mb-3 draggable" id="${task.id}">
            <div class="card-title strong mt-2">
                <h4><strong>${task.taskTitle}</strong></h4>
            </div>
            <div class="form-control hasDatePicker bg-transparent">
                <p>Date: ${task.taskDate}</p>
            </div>
            <div class="card-body">
                <p>${task.taskDescription}</p>
            </div>
            <div class="align-items-center mb-3">
                <button class="btn col-4 .m-3 btn-danger delete-btn border-light">Delete</button>
            </div>
        </div>
    `;

    //Alter Color Based on Due Date
    const dueDate = new Date(task.taskDate);
    const currentDate = new Date();
    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
        taskCard = $(taskCard).addClass("bg-danger border-danger text-white");
    } else if (daysDiff <= 3) {
        taskCard = $(taskCard).addClass("bg-warning border-warning text-white");
    }

    // Check if the task is in "Done" status and apply white background
    if (task.status === "done") {
        taskCard = $(taskCard).addClass("bg-light border-light");
    }

    return taskCard;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards").empty();
    $("#in-progress-cards").empty();
    $("#done-cards").empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard);
    });

    $(".delete-btn").click(function () {
        const cardId = $(this).closest(".task-card").attr("id");
        taskList = taskList.filter(task => task.id !== cardId);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        $(this).closest(".task-card").remove();
    });

    // Destroy existing draggable behavior and reapply it to reset snapping behavior
    $(".draggable").draggable({
        snap: true,
        snapMode: "inner",
        snapTolerance: 20,
        zIndex: 1000
    });
}

// Create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    let taskTitle = $("#taskTitleInput").val().trim();
    let taskDate = $("#taskDateInput").val().trim();
    let taskDescription = $("#taskDescriptionInput").val().trim();

    if(taskTitle && taskDate && taskDescription) {

        let taskData = {
            id: generateTaskId(),
            taskTitle: taskTitle,
            taskDate: taskDate,
            taskDescription: taskDescription,
            status: "todo"
        };

        taskList.push(taskData);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
        $("#formModal").modal("hide");
    }    
}

// Create a function to handle deleting a task
function handleDeleteTask(){
    $(".delete-btn").click(function () {
        const cardId = $(this).closest(".task-card").attr("id");
        taskList = taskList.filter(task => task.id !== cardId);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        $(this).closest(".task-card").remove();
    });
}

// Create a function to handle dragging and dropping a task into a new status lane
function handleDrop(event, ui) {
    const draggedCard = ui.draggable;
    console.log('draggedCard', draggedCard) //I'm not sure you're targeting the right element of the dragged card, something to look at
    const changedLaneId = $(this).attr("id");
    const taskId = draggedCard.attr("id");
    const taskIndex = taskList.findIndex(task => task.id === taskId);
    const newStatus = event.target.id; //you're not actually using this -- might be able to set task.status = newStatus or something if needed

    //Test log to see if it recognizes lane or not also testing if it knows new Status
    console.log("Task dropped. Lane ID:", changedLaneId);
    console.log("new STatus", newStatus)

    if (taskIndex !== -1) {
        const currentStatus = taskList[taskIndex].status;
        taskList[taskIndex].status = changedLaneId.replace("-cards", "");

        localStorage.setItem("tasks", JSON.stringify(taskList));

        console.log("Current Status:", currentStatus);
        console.log("New Status:", taskList[taskIndex].status);

        // Update the UI immediately after dropping the card
        renderTaskList();
    }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    $("#addTaskButton").click(handleAddTask);
    handleDeleteTask();

    // Add event listeners for handling task drops into new status lanes
    $(".lane").droppable({
        accept: ".draggable",
        drop: handleDrop
    });
});