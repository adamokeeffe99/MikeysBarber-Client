// Setting up the Global Variable Declarations and Function Definitions
const appointment_Details = {},
    url = "https://mikeysbarber.herokuapp.com/";
let appointments_Saved = [],
    appointments_Data = [],
    barber_Data = [],
    errMessage = []

// https://stackabuse.com/making-asynchronous-http-requests-in-javascript-with-axios/ article I used to learn about the use of http requests with axios
const getData = async () => {
    let res = await axios.get(`${url}api/v1/appointments`),
        { data } = res
    appointments_Saved = data
    appointments_Data = appointments_Saved
    barber_Data = await getbarberData()
}

const userViewInit = () => {
    displayUserView()
}

//Displaying the appointment for the clients after they confirm their bookings
//Allows the option to delete the appointment after making
const displayUserView = async () => {
    const apptContainer = document.querySelector('.appointment_display_container_inner'),
        print_btn = document.querySelector('.print_btn')
    id = new URLSearchParams(new URL(window.location.href).search).get("id"),
        { data: userDetails } = await axios.get(`${url}api/v1/appointments/${id}`),
        appointmentsData =
        userDetails.Appointments.map(appt =>
            `<div class="appointment_container">
            <div class="first_container">
                <div class="date_square">
                    <h5>${appt.Month}</h5>
                    ${appt.DayDate}
                </div>
                <div class="user_details_container">
                    <div class="name_container">
                        <h2>Name: ${userDetails.firstName} ${userDetails.Surname}</h2>
                    </div>
                </div>
            </div>
            <div class="second_container">
                <div class="appointment_details">
                    <div class="date_container">
                        <h2>Date: ${appt.DayName} ${appt.DayDate} ${appt.Month}</h2>
                    </div>
                    <div class="time_container">
                        <h2>Time: ${appt.Time}</h2>
                    </div>
                </div>
                <div class="buttons_container">
                    <a class="update_btn action_btn" href="edit.html?id=${appt._id}&userId=${userDetails._id}">Edit</a>
                    <div class="delete_btn action_btn" data-appt="${appt._id}">Cancel</div>
                </div>
            </div>
        </div>
        `
        );
    apptContainer.insertAdjacentHTML('beforeend', appointmentsData)
    $(document.querySelector('.delete_btn')).click(e => {
        e.preventDefault();
        deleteAppointment(e.currentTarget.dataset.appt, userDetails._id, "Client")
    })
    printPage(print_btn)
}

// Allows the option to print off appointment for clients
const printPage = button => {
    $(button).click(() => {
        window.print()
    })
}

// Display the months of the year and todays date
const displayPastMonths = place => {
    const monthToday = new Date().getMonth()
    const months = [...document.querySelectorAll('.month')]
    months.filter(month => month.dataset.month < monthToday).map(month => month.classList.add('disabled'))
    document.querySelector(`.month[data-month="${monthToday}"]`).style.background = "green"
    displayPastDays(months, document.querySelector(`.month[data-month="${monthToday}"]`), place)
}

const displayPastDays = (months, startMonth, place) => {
    // Get month Selected Info , adds it to appointment details
    let monthSelected = clickMonth(months, startMonth);
    appointment_Details["Month"] = monthSelected.Name

    // Display Calendar and Days That are closed
    let days = fillInCalendar(monthSelected.Number, monthSelected.NumOfDays, monthSelected.WeekDayNameOfFirstDay, monthSelected.Name),
        dayStarted = new Date().getDate();
    if (place === "barber") addbarberDays(days)
    else dealWithDays(days)

    displayDaysIrrelevant(days, dayStarted)
}

// If booking is incomplete error message shows
const dealWithFormUpdate = async () => {
    const formUpdate = document.querySelector('.form_Update'),
        user_id = new URLSearchParams(new URL(window.location.href).search).get("userId"),
        appointment_id = new URLSearchParams(new URL(window.location.href).search).get("id");
    // { data: userDetails } = await axios.get(`${url}api/v1/appointments/${user_id}`);
    $(formUpdate).submit(e => {
        e.preventDefault()
        let bookingDetailsValidated = validateBookingDetails()
        if (!bookingDetailsValidated) {
            alert("Please pick a valid month, date and time before progressing")
            return
        }
        appointment_Details["userId"] = user_id
        updateAppointment(appointment_id)
    })
}

// Creates appointment if appointment available
const dealWithFormSubmit = () => {
    const actual_create_btn = document.querySelector('.see_all_appointments_btn');
    let submitted = false
    $(actual_create_btn).click(e => {
        /**
         * Because of await making the call stack perform same thing again
         * This was making it send two requests and insert two records into the DB
         * This is a fix for this, 
         * Look for info or something that should have a value already from the first time
         */
        if (submitted) return
        submitted = true

        // Calls the method to perform the async function to post my data 
        makeAppointment()
    })
}

// Allows the client to edit their booking if they change their mind on time or date
const updateAppointment = async (appt_id) => {
    try {
        const { data: Users_Appointments } = await axios.put(`${url}api/v1/appointments/${appt_id}`, appointment_Details)
        window.location = `userview.html?id=${Users_Appointments._id}`
    } catch (error) {
        console.log(error)
    }
}

// Allows client to delete appointment once booked and reopens appointment slot
const deleteAppointment = async (id, userID, place) => {
    try {
        const { data: Users_Appointments } = await axios.delete(`${url}api/v1/appointments/${id}?userId=${userID}`)
        if (place === "Client") window.location = `userView.html?id=${Users_Appointments._id}`
        else window.location = `adminhome.html`
    } catch (error) {
        console.log(error)
    }
}

// Deals with the making of appointments
const makeAppointment = async () => {
    try {
        const { data: Users_Appointments } = await makeRequest()
        window.location = `userView.html?id=${Users_Appointments._id}`
        return appointment
    } catch (error) {
        console.log(error)
    }
}

//Deals with the appointment booking making sure it is valid and time is available 
const createAppointmentBtnClick = () => {
    const form = document.querySelector('form');
    $(form).submit(e => {
        e.preventDefault()

        let bookingDetailsValidated = validateBookingDetails()
        if (!bookingDetailsValidated) {
            alert("Please pick a valid month, date and time before progressing")
            return
        }

        // Getting the form Data and filling it to appointment_Details
        let formData = getFormData(form)
        if (errMessage.length !== 0) {
            errMessage.filter((error, index) => errMessage.lastIndexOf(error) === index)
                .map(error => alert(error))
            errMessage = []
            return
        }
        appointment_Details["firstName"] = formData.get('firstName')
        appointment_Details["Email"] = formData.get('Email')
        appointment_Details["Surname"] = formData.get('Surname')
        

        displayAppointmentPopup(appointment_Details)
        dealWithFormSubmit()
    })
}

const validateBookingDetails = () => {
    return appointment_Details["Month"] !== undefined && appointment_Details["DayDate"] !== undefined && appointment_Details["Time"] !== undefined
}

// Displays details of appointment for client before confirmation is complete
const displayAppointmentPopup = appointment_Details => {
    let modal = fillinModalDetails(appointment_Details)
    document.querySelector('.appointment_made_modal').innerHTML = modal;
    document.querySelector('.appointment_made_modal').style.display = "block"
    cancelModal(document.querySelector('.appointment_made_modal'))
}

// Another cancellation option before completion of booking 
const cancelModal = modal => {
    const cancel_btn = document.querySelector('.cancelApptBtn')
    $(cancel_btn).click(() => {
        modal.style.display = "none"
    })
}

// shows details selected in appointment page
const fillinModalDetails = appointment_made_details => {
    return `<div class="appointment_made_modal_content">
                <h2>Hi ${appointment_made_details.firstName} ${appointment_made_details.Surname},</h2>
                <h4>You requested an appointment for</h4>
                <div class="date_time_container">
                    <h3><strong>Date :</strong> ${appointment_made_details.DayName} ${appointment_made_details.DayDate} ${appointment_made_details.Month}</h3>
                    <h3><strong>Time :</strong> ${appointment_made_details.Time}</h3>
                </div>
                <div class="btns_container">
                    <a class="see_all_appointments_btn">Confirm</a>
                    <a class="cancelApptBtn">Cancel</a>
                </div>
            </div>`
}



const makeRequest = () => {
    return axios.post(`${url}api/v1/appointments`, appointment_Details)
}



const getFormData = form => {
    let formData = new FormData(form)
    return formData
}

const dealWithMonths = (place, barberData, barberDataSingle) => {
    const months = [...document.querySelectorAll('.month')];
    months.map(month => {
        $(month).click(e => {
            // Get month Selected Info , adds it to appointment details
            let monthSelected = clickMonth(months, e.target);
            appointment_Details["Month"] = monthSelected.Name

            // Display Calendar and Days That are closed
            let days = fillInCalendar(monthSelected.Number, monthSelected.NumOfDays, monthSelected.WeekDayNameOfFirstDay, monthSelected.Name)
            if (monthSelected.Name === nameOfMonth(new Date().getMonth())) {
                displayDaysIrrelevant(days, new Date().getDate())
            } else {
                displayDaysIrrelevant(days)
            }


            if (place === "barber") {
                addbarberDays(days)
                checkSlots(barberData)
                if (barberDataSingle !== undefined) getEditingSlot(barberDataSingle)
            }
            else dealWithDays(days)

        })
    })

}

const clickMonth = (months, target) => {
    // Styles the month selected and ones that aren't accordingly
    months.filter(month => month !== target).map(month => {
        month.style.background = "aliceblue"
        month.style.color = "black"
    })
    target.style.background = "green"
    target.style.color = "#fff"

    // Get month Selected Info and returns info
    let monthSelected = getMonthSelected(target.dataset.month)
    return monthSelected
}




const dealWithDays = days => {
    days.map(day => {
        $(day).click(e => {
            // Get day Selected Info, adds it to appointment details
            let daySelected = clickDay(days, e.target)
            appointment_Details["DayName"] = daySelected.day
            appointment_Details["DayDate"] = daySelected.date

            // Deal with times now
            dealWithTimes()
        })
    })
}

const clickDay = (days, target) => {
    // Styles the month selected and ones that aren't accordingly
    days.filter(day => day !== target && day.dataset.day !== "Sunday").map(day => {
        $(day).css('background', 'aliceblue')
        $(day).css('color', 'black')
    })
    target.style.background = "green"
    target.style.color = "white"

    // Get day Selected Info and returns info
    let daySelected = getDaySelected(target)
    return daySelected
}

const dealWithTimes = () => {
    /**
     * Get time now, round it to the nearest 10 make timeslots and return the timeslot Containers
     */
    // let time_now = new Date(),
    // newRoundedTime = roundMinutes(time_now),
    let timeSlots = makeTimeslots(moment().startOf('day').add(9, 'h'), [], 10),
        timeSlotContainers = displayTimeslots(timeSlots);
    timeSlotContainers.map(timeSlot => {
        $(timeSlot).click(e => {
            // Get time Selected Info, adds it to appointment details
            let timeSelected = clickTime(timeSlotContainers, e.target)
            checkTime(new Date().getHours(), timeSlotContainers)
            checkAgainstAppointments()
            appointment_Details["Time"] = timeSelected
        })
    })
}


const clickTime = (timeSlotContainers, target) => {
    // Styles the time selected and ones that aren't accordingly
    timeSlotContainers.filter(timeSlot => timeSlot !== target && !timeSlot.classList.contains('disabled')).map(timeSlot => {
        timeSlot.style.background = "aliceblue"
        timeSlot.style.color = "black"
    })
    target.style.background = "green"
    target.style.color = "white"

    // Get time Selected Info and returns info
    let timeSelected = target.innerHTML
    return timeSelected
}


const getMonthSelected = monthNo => {
    let monthSelected = {
        "LastDayNum": getLastDayNum(new Date().getFullYear(), Number(monthNo)),
        "WeekDayNumOfFirstDay": getWeekDayNum(new Date().getFullYear(), Number(monthNo), 1),
        "WeekDayNameOfFirstDay": nameOfDay(getWeekDayNum(new Date().getFullYear(), Number(monthNo), 1)),
        "NumOfDays": getNumOfDays(1, getLastDayNum(new Date().getFullYear(), Number(monthNo))),
        "Name": nameOfMonth(Number(monthNo)),
        "Number": monthNo
    }
    return monthSelected
}

const getDaySelected = target => {
    let daySelected = {
        "date": target.innerHTML,
        "day": target.dataset.day
    }
    return daySelected
}

const makeTimeslots = (startTime, timeSlots, interval) => {
    let completed = false
    timeSlots.push(`${startTime.hours()}:${startTime.minutes()}`)
    if (!completed) {
        if (startTime.hours() === 19 && startTime.minutes() === 30) {
            completed = true
            return [...timeSlots]
        } else {
            if (Array.isArray(makeTimeslots(startTime.add(interval, 'm'), timeSlots, interval))) return timeSlots
            timeSlots.push(makeTimeslots(startTime.add(interval, 'm'), timeSlots, interval))
        }
    }
}

const displayTimeslots = timeSlots => {
    document.querySelector('.time_slot_container_m').style.display = "block"
    let timeSlotContainer = document.querySelector('.time_slot_container')
    timeSlots = timeSlots.map(timeSlot =>
        `<div class="timeslot" data-time="${timeSlot}">${timeSlot}</div>`
    ).join("")
    timeSlotContainer.innerHTML = timeSlots
    let timeSlotContainers = getTimeslotContainers()
    checkTime(new Date().getHours(), timeSlotContainers)
    checkAgainstAppointments()
    return timeSlotContainers
}

const checkAgainstAppointments = () => {
    // This just checks if the date picked is within the date slots that the barber picks
    // 1) If it is - filters the timeslots availability by Capacity of equal or more than the number of providers * 1 (for now as mikey is a sole barber)
    // 2) Else - filters the timeslots availability by Capacity of equal or more than 2
    appointments_Saved
        .map(appointment_s => {
            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.remove("original_bg_timeslot")
            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("disabled")
            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("orange_disabled")
        })
    for (barberDataSingle of barber_Data)
        if (appointment_Details["Month"] == barberDataSingle.Month) {
            timeslotsContainers = getTimeslotContainers()
            for (date of barberDataSingle.Dates)
                if (appointment_Details["DayDate"] == date) {
                    for (hour of barberDataSingle.Hours) {
                        timeslotsContainers
                            .filter(appt => appt.innerHTML == hour)
                            .map(appointment_s => {
                                appointment_s.classList.add("original_bg_timeslot")
                                appointment_s.classList.remove("disabled")
                                appointment_s.classList.remove("orange_disabled")
                            })
                    }
                    appointments_Saved
                        .filter(appointment => appointment.DayDate == date)
                        .filter(appointment => appointment.Capacity.length >= parseInt(barberDataSingle.Providers))
                        .map(appointment_s => {
                            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.remove("original_bg_timeslot")
                            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("disabled")
                            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("full_disabled")
                        })
                }
            // else {
            //     appointments_Saved
            //         .filter(appointment => appointment.DayDate != date)
            //         .filter(appointment => appointment.Capacity.length >= 2)
            //         .map(appointment_s => {
            //             document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.remove("original_bg_timeslot")
            //             document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("disabled")
            //             document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("full_disabled")
            //         })
            // }
        }
}

const checkTime = (timeNow, timeSlotContainers) => {
    // This does four checks to find the available slots for clients 
    /**
     * 1) Checks the date is equal to the date the user specifies 
     * 2) Checks against the barber hours 
     * 3) Checks and filters the disabled timeSlots by hour 
     * - Equal to the hour then checks the minutes and sees if minutes now are more than the time user is using the app
     * - More than the hour 
     * 4) This ensures that when the user logs on they should only see available slots 
     * and not one's that are not available because of barber hours, not available because they have passed 
     * in minutes or hours for that matter  
     */
    // if(new Date().getDate()  === Number(appointment_Details["DayDate"])) {
    //         timeSlotContainers.filter(timeSlot =>  (timeSlot.innerHTML.split(":")[0] == timeNow + 1 && timeSlot.innerHTML.split(":")[1] < new Date().getMinutes()) || timeSlot.innerHTML.split(":")[0] < timeNow + 1)
    //         .map(timeslotContainer => {
    //             timeslotContainer.classList.add('disabled')
    //             timeslotContainer.style.background = "orange"
    //             timeslotContainer.style.color = "black";
    //         })
    // }
    // timeSlotContainers
    // .filter(timeSlot =>  (timeSlot.innerHTML.split(":")[0] == timeNow + 1 && timeSlot.innerHTML.split(":")[1] < new Date().getMinutes()) || timeSlot.innerHTML.split(":")[0] < timeNow + 1)
    // .map(timeslotContainer => {
    //     timeslotContainer.classList.add('disabled')
    //     timeslotContainer.style.background = "orange"
    //     timeslotContainer.style.color = "black";
    // })
    timeSlotContainers
        .map(timeslotContainer => {
            timeslotContainer.classList.add('disabled')
            timeslotContainer.classList.add('orange_disabled')
        })
    barber_Data.map(barber_Dets => {
        for (date of barber_Dets.Dates)
            if (Number(date) === Number(appointment_Details["DayDate"])) {
                for (hour of barber_Dets.Hours) {
                    timeSlotContainers.filter(timeSlot => timeSlot.innerHTML === hour)
                        .map(timeslotContainer => {
                            timeslotContainer.classList.remove('disabled')
                            timeslotContainer.classList.add('original_bg_timeslot')
                        })
                }
            }
    })

}

// Setting up time slots
const getTimeslotContainers = () => {
    return timeslotPills = [...document.querySelectorAll('.timeslot')]
}


const displayDaysIrrelevant = (days, dayStarted) => {
    if (dayStarted !== null) {
        days.filter(day => day.innerHTML < dayStarted).map(day => day.classList.add('disabled'))
    }
    days.filter(day => day.dataset.day === "Sunday").map(day => {
        day.style.background = "orange"
        day.classList.add('disabled')
    })
}

//Sets up the calendar for display
const fillInCalendar = (monthSelectedNum, numberOfDays, firstDay, monthSelectedName) => {
    document.querySelector('.calendar_container_m').style.display = "block"
    let calendarContainer = document.querySelector('.calendar_container'),
        daysOfWeek = `
            <h3 class= "dayOfWeek">Monday</h3>
            <h3 class= "dayOfWeek">Tuesday</h3>
            <h3 class= "dayOfWeek">Wednesday</h3>
            <h3 class= "dayOfWeek">Thursday</h3>
            <h3 class= "dayOfWeek">Friday</h3>
            <h3 class= "dayOfWeek">Saturday</h3>
            <h3 class= "dayOfWeek">Sunday</h3>
        `,
        margin = ``;
    if (firstDay !== "Monday")
        margin = `<div class="margin"></div>`
    numberOfDays = numberOfDays.map(day => {
        let dayOfWeek = getWeekDayNum(new Date().getFullYear(), monthSelectedNum, day)
        dayOfWeek = nameOfDay(dayOfWeek);
        return `<div class="day" data-day= "${dayOfWeek}" data-month="${monthSelectedName}">${day}</div>`
    }).join("")
    calendarContainer.innerHTML = daysOfWeek + margin + numberOfDays
    getSpan(firstDay)
    let dayContainers = getDayContainers()
    return dayContainers
}

// Deals with the terms and conditions section
const dealWithTerms = () => {
    const terms_btn = document.querySelector('.open_terms_btn')
    $(terms_btn).click(e => {
        openModal()
    })
}

const openModal = () => {
    const modal = fillInTermsModal()
    document.querySelector('.terms_and_c_modal').innerHTML = modal;
    document.querySelector('.terms_and_c_modal').style.display = "block"
    $(window).click(e => {
        if (e.target === document.querySelector('.terms_and_c_modal')) closeModal()
    })
    //For use on mobile devices

    $(window).on('tap', e => {
        if (e.target === document.querySelector('.terms_and_c_modal')) closeModal()
    })
}

const closeModal = () => {
    document.querySelector('.terms_and_c_modal').style.display = "none"
}

const fillInTermsModal = () => {
    return `<div class="terms_and_c_modal_content">
                <h2>Terms and Conditions Apply</h2>
                <p>I consent to my information being stored for Barber Appointment reasons</p>
            </div>`
}


// Setting up Mikeys admin log in
// This video https://www.youtube.com/watch?v=PkxA6m-NNCY&t=1s was just a basic walk through of a login in which i incoroparted along with w3Schools to make this login.
const adminLogin = () => {
    const loginForm = document.querySelector('.login_form')
    $(loginForm).submit(e => {
        let loginDetails = {
            Username: $('#username_input').val(),
            Password: $('#password_input').val()
        }
        e.preventDefault()
        if (!isValidLogin(loginDetails)) {
            alert("Your username or password is invalid")
            return
        }
        sessionStorage.setItem("Admin", "LoggedIn");
        window.location = "adminhome.html"
    })
}

//Admin log out and where it brings you to
const adminLogout = () => {
    const logout_btn = document.querySelector('.logout')
    $(logout_btn).click(() => {
        sessionStorage.removeItem("Admin");
        window.location = "adminlogin.html"
    })
}

//The set up on the where the appointments will be displayed on the admin portal
const adminInit = () => {
    type = "Appointments"
    $(`.options_container h1:contains("${type}")`)[0].style.background = "#fff"
    dealWithTabs()
    setDateTimeLocal(document.querySelector('#date_picker_input'))
    dealWithDateChange(document.querySelector('#date_picker_input'))
    const SelectedDateTime = getDateTime()
    displayData(filterSavedAppointments(appointments_Saved, SelectedDateTime))
    dealWithSearch()
    getAppointmentDataFromTable()
    const print_btn = document.querySelector('.print_btn');
    printPage(print_btn)
}

// This will deal with the options container on the admin page and where they will lead to
const dealWithTabs = () => {
    const tabs = [...document.querySelectorAll('.options_container h1')]
    tabs.map(tab => $(tab).click(e => {
        if (e.target.innerHTML === "barber") window.location = "adminshophome.html"
        else if (e.target.innerHTML === "Appointments") window.location = "adminhome.html"
        tabs.filter(tab => tab != e.target).map(tab => tab.style.background = "")
        e.target.style.background = "#fff"
    }))
}

// Displaying appointments made
const filterSavedAppointments = (appointments, dateDetails) => {
    return appointments.filter(appointment => parseInt(appointment.DayDate) === parseInt(dateDetails.Date) && appointment.Month === dateDetails.MonthName)
}

//Displaying the time and date of appointments 
const getDateTime = () => {
    const dateDetails = {
        Year: document.querySelector('#date_picker_input').value.split("-")[0],
        Month: document.querySelector('#date_picker_input').value.split("-")[1],
        MonthName: nameOfMonth(parseInt(document.querySelector('#date_picker_input').value.split("-")[1]) - 1),
        Date: document.querySelector('#date_picker_input').value.split("-")[2].split("T")[0],
        Time: document.querySelector('#date_picker_input').value.split("-")[2].split("T")[1]
    }
    return dateDetails
}

//Deals with the changing of appointment details
const dealWithDateChange = date_picker => {
    $(date_picker).on('change', e => {
        document.querySelector('.main_container_m').innerHTML = `
                <div class="headings">
                    <h4 class="container_sm">Time(inc.Date)</h4>
                    <h4 class="container_sm">First Name(s)</h4>
                    <h4 class="container_sm">Surname(s)</h4>
                </div>
        `
        const SelectedDateTime = getDateTime()
        displayData(filterSavedAppointments(appointments_Saved, SelectedDateTime))
    })
}

const setDateTimeLocal = date_picker => {
    date_picker.value = moment().format(moment.HTML5_FMT.DATETIME_LOCAL).toString()
}

// Allows mikey to download his appointments as a CSV
const getAppointmentDataFromTable = () => {
    const download_btn = document.querySelector('.download_csv_btn');
    $(download_btn).click(e => {
        const csvData = objectToCSV(appointments_Data)
        downloadCSV(csvData)
    })
}

const getDetails = appointments => {
    let details = []
    appointments.map(appt => details.push(`"${escapeSlashAndQuotes(appt.firstName)}"`, `"${escapeSlashAndQuotes(appt.Surname)}"`))
    return [...details]
}

const objectToCSV = appointments_Data => {
    const csvRows = [],

        // Get the headers  
        headers = [`"Date"`, `"Time"`, `"First Name(s)"`, `"Surname(s)"`]
    csvRows.push(headers.join(","))

    // Loop over the rows and get values for each of the headers  
    // form escaped comma seperated values  
    let values = appointments_Data.map(appointment => [`"${escapeSlashAndQuotes(appointment.DayDate)} ${escapeSlashAndQuotes(appointment.Month)}"`, `"${escapeSlashAndQuotes(appointment.Time)}"`, ...getDetails(appointment.Capacity)])
    values.map(value => csvRows.push(value.join(",")))

    return csvRows.join("\n")
}

const downloadCSV = csvData => {
    // Make a blob file 
    const blob = new Blob([csvData], { type: 'text/csv' }),
        blobURL = window.URL.createObjectURL(blob),
        a_tag = `<a href="${blobURL}" class="blob_link" hidden download="Mikeys_Appointments.csv"></a>`;
    document.body.insertAdjacentHTML('beforeend', a_tag)
    let a_tag_element = document.querySelector('.blob_link')
    $('.blob_link')[0].click()
    document.body.removeChild(a_tag_element)
}


// Need to keep it in the array of appointments_Saved to be passed into this func
// Had to sort the times by their hours first of all and then their minutes in ascending order
const displayData = appointments => {
    const runningTotal = appointments.map(appt => appt.Capacity.length).reduce((a, b) => a + b, 0),
        overallTotal = appointments_Saved.map(appt => appt.Capacity.length).reduce((a, b) => a + b, 0)
    appointments_Data = appointments.sort((now, next) => now.Time.split(":")[0] - next.Time.split(":")[0] || now.Time.split(":")[1] - next.Time.split(":")[1])
    const appointmentsHTML =
        appointments_Data.map(appointment => {
            if (appointment.Capacity.length >= 2) {
                return `  
                <div class="appointment_details span" data-id="${appointment._id}">
                    <h3 class="time" data-capacity="${appointment.Capacity.length}"><little>${appointment.DayDate} / ${numOfmonth(appointment.Month)}</little>${appointment.Time}</h3>
                    ${getUserDetails(appointment.Capacity, appointment._id)}
                </div>
                `
            } else {
                return `  
                <div class="appointment_details" data-id="${appointment._id}">
                    <h3 class="time" data-capacity="${appointment.Capacity.length}"><little>${appointment.DayDate} / ${numOfmonth(appointment.Month)}</little>${appointment.Time}</h3>
                    ${getUserDetails(appointment.Capacity, appointment._id)}
                </div>
                `
            }
        }).join("");
    document.querySelector('.main_container_m').insertAdjacentHTML('beforeend', appointmentsHTML)
    document.querySelector('.numberOfUsers').innerHTML = `Number Of Clients: ${runningTotal}`
    document.querySelector('.numberOfAppointments').innerHTML = `Overall No. Of Appointments: ${overallTotal}`
    checkCapacity(appointments)
    checkDelete()
}

const checkDelete = () => {
    const delete_btns = [...document.querySelectorAll('.delete')]
    delete_btns.map(delete_btn =>
        $(delete_btn).click(e => {
            deleteAppointment(e.target.dataset.apptid, e.target.dataset.userid, "Backend")
        })
    )
}

const checkCapacity = appointments => {
    appointments.map(appointment => {
        if (appointment.Capacity.length >= 2) {
            $('.span').css('grid-template-rows', `repeat(${appointment.Capacity.length},1fr)`);
            [...document.querySelectorAll('.time')]
                .map(time => $(time).css('grid-row', `span ${time.dataset.capacity}`))
        }
    })
}

const getUserDetails = (userDetails, appID) => {
    userDetails = userDetails.map(user =>
        `   <h4 class="container_sm">${user.firstName}</h4>
        <h4 class="container_sm">${user.Surname}</h4> 
        <h4 class="delete" data-userID="${user._id}" data-apptID="${appID}">X</h4>
    `).join("")
    return userDetails
}


// Deals with the search bar in the appointment section where Mikey can look up clients via their name
const dealWithSearch = () => {
    const searchInput = document.querySelector('#search_input')
    $(searchInput).on('input change', e => {
        
        document.querySelector('.main_container_m').innerHTML = `
                <div class="headings">
                    <h4 class="container_sm">Time(inc.Date)</h4>
                    <h4 class="container_sm">First Name(s)</h4>
                    <h4 class="container_sm">Surname(s)</h4>
                </div>
        `
        let filteredAppointments = checkSearchAgainst(e.target.value)
        if (filteredAppointments.length === 0) displayData(appointments_Saved)
        else displayData(filteredAppointments)
    })
}

const checkSearchAgainst = searchValue => {
    return appointments_Saved.filter(appointment => appointment.Time.includes(searchValue) || loopUsers(appointment.Capacity, searchValue))
}

const loopUsers = (users, searchValue) => {
    let matches = []
    users.map(user => matches.push(user._id.includes(searchValue), user.firstName.includes(searchValue), user.Surname.includes(searchValue), user.firstName + user.Surname === searchValue))
    return matches.includes(true)
}

const getbarberData = async () => {
    let res = await axios.get(`${url}api/v1/barbers`),
        { data: barberData } = res
    return barberData
}

// Deals with the barber section of the admin side and displays all slots opened by the barber
const adminshophomeInit = async () => {
    const barberData = await getbarberData()
    $(`.options_container h1:contains("barber")`)[0].style.background = "#fff"
    dealWithTabs()
    displayAllSlots(barberData)
    const delete_btns = [...document.querySelectorAll('.delete_btn')]
    delete_btns.map(delete_btn => $(delete_btn).click(e => deletebarberSlot(e.target.dataset.barber_id)))
}

// Code for displaying all the times and dates opened by the barber for appointments

const displayAllSlots = barberData => {
    const slot_container = document.querySelector('.barber_slots_container'),
        contents = barberData.map(barber_slot =>
            `
        <div class="slot_entry_container">
            <div class="date_square_container">
                <div class="date_square">${barber_slot.Month.slice(0, 3)}</div>
            </div>
            <div class="slot_details_container">
                <h2><strong>Hours (Not Available):</strong> ${barber_slot.Hours.join(", ")}</h2>
                <h2><strong>Providers:</strong> ${barber_slot.Providers}</h2>
                <h2><strong>Dates:</strong> ${barber_slot.Dates.join(", ")}</h2>
            </div>
            <div class="manipulate_slot_buttons_container">
                <a class="update_btn action_btn" href="AdminbarberUpdate.html?id=${barber_slot._id}">Edit</a>
                <div class="delete_btn action_btn" data-barber_id="${barber_slot._id}">Delete</div>
            </div>
        </div>
    `).join("")
    slot_container.insertAdjacentHTML('beforeend', contents)
}

const checkDateEnd = dates => {
    return dates.length === 1 ? dates[0] : dates[dates.length - 1]
}

// Deals with the opening of new slots for the barber and pushes them to the client side 
const adminbarberAddInit = async () => {
    const barberData = await getbarberData(),
        timeSlots = makeTimeslots(moment().startOf('day').add(9, 'h'), [], 10),
        submit_btn = document.querySelector('.addbarberSlotBtn');
    $(`.options_container h1:contains("barber")`)[0].style.background = "#fff"
    dealWithTabs()
    displayPastMonths("barber")
    dealWithMonths("barber", barberData)
    checkSlots(barberData)
    const timeSlotsContainers = displaybarberTimeslots(timeSlots)
    addbarberTimes(timeSlotsContainers)
    barberSubmitBtnClick(submit_btn, "Post")
    // displayMonthAndDates(barberData)
}

const checkSlots = barberData => {
    for (const barberSlot of barberData)
        [...document.querySelectorAll('.day')]
            .filter(day => barberSlot.Month === day.dataset.month)
            .filter(day => barberSlot.Dates.includes(day.innerHTML))
            .map(day => {
                day.classList.add('disabled')
                day.classList.add('slot_taken')
            })
}

// Allows the barber to edit the slots of the days he's selected
const getEditingSlot = barberSingle => {
    [...document.querySelectorAll('.day')]
        .filter(day => barberSingle.Month === day.dataset.month)
        .filter(day => barberSingle.Dates.includes(day.innerHTML))
        .map(day => {
            day.classList.remove('disabled')
            day.classList.remove('slot_taken')
            day.classList.toggle('daySelected')
        })
}

// Allows the barber to edit the times of the days hes opened
const getEditingTimeslot = barberSingle => {
    [...document.querySelectorAll('.timeslot_barber')]
        .filter(slot => barberSingle.Hours.includes(slot.innerHTML))
        .map(slot => {
            slot.classList.toggle('selected')
        })
}

// Deals with the time slots the barber choices to open
const addbarberTimes = timeSlots => {
    timeSlots.map(timeSlot => {
        $(timeSlot).click(e => {
            e.target.classList.toggle('selected')
        })
    })
}
// Deals with the days selceted by the barber to open
const addbarberDays = days => {
    days.map(day => {
        $(day).click(e => {
            e.target.classList.toggle('daySelected')
        })
    })
}

// Pushes the times and days choosen to open to the barber side of the admin and then adds to client side once everything is selceted correctly
const barberSubmitBtnClick = (submit_btn, method, id) => {
    $(submit_btn).click(() => {
        let provider_value = getProvidersValue(),
            hours_array = [...document.querySelectorAll('.timeslot_barber.selected')].map(timeslot => timeslot.innerHTML),
            dates_array = [...document.querySelectorAll('.day.daySelected')].map(date => date.innerHTML);
        if (dates_array.length === 0 || hours_array.length === 0) {
            errMessage.push("You must select date(s) and hour(s)")
        } else if (!provider_value) {
            errMessage.push("You must indicate how many providers are needed")
        }
        if (errMessage.length !== 0) {
            errMessage.filter((message, index) => errMessage.lastIndexOf(message) === index).map(msg => alert(msg))
            return errMessage = []
        }
        new_barber_slot = {
            Month: appointment_Details["Month"],
            Dates: dates_array,
            Hours: hours_array,
            Providers: provider_value
        }
        if (method === "Post") makebarberPost(new_barber_slot)
        else if (method === "Update") makebarberUpdate(new_barber_slot, id)
    })
}

//Allows for edits to be made to slots opened by the barber
const adminbarberEditInit = async () => {
    const barberDataAll = await getbarberData(),
        id = new URLSearchParams(new URL(window.location.href).search).get("id"),
        barberDataSingle = await getbarberSlotSingle(id),
        timeSlots = makeTimeslots(moment().startOf('day').add(9, 'h'), [], 10),
        submit_btn = document.querySelector('.addbarberSlotBtn');
    $(`.options_container h1:contains("barber")`)[0].style.background = "#fff"
    dealWithTabs()
    displayPastMonths("barber")

    document.querySelector(`.month[data-month="${numOfmonth(barberDataSingle.Month) - 1}"]`).style.background = "green"
    displayPastDays([...document.querySelectorAll('.month')], document.querySelector(`.month[data-month="${numOfmonth(barberDataSingle.Month) - 1}"]`), "barber")


    dealWithMonths("barber", barberDataAll, barberDataSingle)
    checkSlots(barberDataAll)
    getEditingSlot(barberDataSingle)
    const timeSlotsContainers = displaybarberTimeslots(timeSlots)
    getEditingTimeslot(barberDataSingle)
    document.querySelector('#providers_input').value = barberDataSingle.Providers
    addbarberTimes(timeSlotsContainers)
    barberSubmitBtnClick(submit_btn, "Update", id)
}

const getbarberSlotSingle = async (id) => {
    let res = await axios.get(`${url}api/v1/barbers/${id}`),
        { data: barberDataSingle } = res
    return barberDataSingle
}

const makebarberPost = async (newbarberSlot) => {
    try {
        await axios.post(`${url}api/v1/barbers`, newbarberSlot)
        window.location = "adminshophome.html"
    } catch (error) {
        console.log(error)
    }
}

const deletebarberSlot = async (id) => {
    try {
        await axios.delete(`${url}api/v1/barbers/${id}`)
        window.location = "adminshophome.html"
    } catch (error) {
        console.log(error)
    }
}

const makebarberUpdate = async (barber_updated_data, id) => {
    try {
        await axios.put(`${url}api/v1/barbers/${id}`, barber_updated_data)
        window.location = "adminshophome.html"
    } catch (error) {
        console.log(error)
    }
}

const getProvidersValue = () => {
    return document.querySelector('#providers_input').value !== "" ? document.querySelector('#providers_input').value : document.querySelector('#providers_input').value !== ""
}

const displaybarberTimeslots = timeSlots => {
    let timeSlotContainer = document.querySelector('.barberTimeslotsContainerInner')
    timeSlots = timeSlots.map(timeSlot =>
        `<div class="timeslot_barber" data-time="${timeSlot}">${timeSlot}</div>`
    ).join("")
    timeSlotContainer.innerHTML = timeSlots
    const timeSlotContainers = [...document.querySelectorAll('.timeslot_barber')]
    return timeSlotContainers
}

// const displayCurrentPickedSlots = (barberData, timeSlotContainers) => {
//     for(const barberDataSingle of barberData){
//         barberDataSingle.Hours.map(hour => {$(`.timeslot_barber:contains(${hour})`)[0].style.background = "orange"})
//         document.querySelector('#providers_input').value = barberDataSingle.Providers
//     }
//     timeSlotContainers.map(timeslot => timeslot.classList.add('disabled'))
//     document.querySelector('#providers_input').classList.add('disabled')

// }

// Helper Function with CSV 
const escapeSlashAndQuotes = csvValue => {
    return csvValue.replace(/"/g, '\\"')
}

// Helper Function 
const getLastDayNum = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
}

// Helper Function of week in question
const getWeekDayNum = (year, month, day) => {
    return new Date(year, month, day).getDay()
}

// Helper Function of todays date
const getDayContainers = () => {
    return days = [...document.querySelectorAll('.day')];
}

// Helper Function of this month
const nameOfMonth = month => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return months[month]
}

// Helper Function
const numOfmonth = month => {
    const months = {
        "December": 0,
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11
    }
    return months[month]
}

// Helper Function
const nameOfDay = firstDay => {
    const days = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    }
    return days[firstDay]
}

// Helper Function
const getNumOfDays = (startDay, endDay) => {
    if (startDay === endDay) return [startDay];
    return [startDay, ...getNumOfDays(startDay + 1, endDay)];
}

// Helper Function
const getSpan = firstDay => {
    const margin = document.querySelector('.margin'),
        days = {
            "Tuesday": "span 1",
            "Wednesday": "span 2",
            "Thursday": "span 3",
            "Friday": "span 4",
            "Saturday": "span 5",
            "Sunday": "span 6"
        };
    $(margin).css('grid-column', days[firstDay])
}

// Helper Function
const roundMinutes = (time_now) => {
    // const roundDownTo = roundTo => x => Math.floor(x / roundTo) * roundTo;
    const roundUpTo = roundTo => x => Math.ceil(x / roundTo) * roundTo;
    const roundUpTo5Minutes = roundUpTo(1000 * 60 * 10);

    const ms = roundUpTo5Minutes(time_now)
    return `${new Date(ms).getHours()}:${new Date(ms).getMinutes()}`
}

const isValidLogin = details => details.Username === "mikeysbarbers" && details.Password === "barbershop1"

// Initialization Methods

$(document).ready(async () => {
    switch (true) {
        case window.location.pathname === "/" || window.location.pathname === "/Client/":
            getData()
            displayPastMonths()
            createAppointmentBtnClick()
            dealWithMonths()
            dealWithTerms()
            break
        case window.location.pathname.includes("index"):
            getData()
            displayPastMonths()
            createAppointmentBtnClick()
            dealWithMonths()
            dealWithTerms()
            break
        case window.location.pathname.includes("userview"):
            userViewInit()
            break
        case window.location.pathname.includes("edit"):
            getData()
            displayPastMonths()
            dealWithFormUpdate()
            dealWithMonths()
            break
        case window.location.pathname.toLowerCase().includes("adminlogin"):
            adminLogin()
            break
        case window.location.pathname.toLowerCase().includes("adminhome"):
            await getData()
            adminInit()
            adminLogout()
            break
        case window.location.pathname.toLowerCase().includes("adminshophome"):
            adminshophomeInit()
            adminLogout()
            break
        case window.location.pathname.toLowerCase().includes("adminshopadd"):
            adminbarberAddInit()
            adminLogout()
            break
        case window.location.pathname.toLowerCase().includes("adminshopupdate"):
            adminbarberEditInit()
            adminLogout()
            break

    }
})