const editTask = document.getElementById('editTask')
const editBtn = document.getElementById('editBtn')
const editError = document.getElementById('editError')

edit()

async function edit() {
    const urlParams = new URLSearchParams(window.location.search);
    const editID = urlParams.get('editID');
    
    const responseGET = await fetch(`http://localhost:3000/${editID}`)
    const resultGET = await responseGET.json()

    // Show previous edit name at input
    editTask.value = resultGET.task.taskName

    // Edit task name when click
    editBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        const responsePUT = await fetch(`http://localhost:3000/${editID}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                // Input value
                task: editTask.value
            })
        })
        const resultPUT = await responsePUT.json()

        if (resultPUT.status === 406) {
            editError.innerHTML = resultPUT.error
        } else {
            location.replace('/')
        }
    })
}