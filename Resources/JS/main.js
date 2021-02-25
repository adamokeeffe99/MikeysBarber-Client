//Global Variable Declarations and Functions Defintions
const appointment_Details = {}
url = "https://mikeysbarber.herokuapp.com/";
let appointments_Saved = []
appointments_Data = []
clinic_Data = []
errMessage = []

const getData = async() => {
    const apptContainer = document.querySelector('.appointment_display_container_inner'),
    print_btn = document.querySelector('.print_btn')
    id = new URLSearchParams(new URL(window.location.href).search).get("id"),
    {data: userDetails} = await axios.get('${url}api/v1/appointments/${id}'),
    appointmentData = 
    userDetails.Appointments.map(appt =>
        <div class ="appointment_container">
            <div class="first_container">
                <div class="data_square">
                    <h5>${appt.Month}</h5>
                    ${appt.DayDate}
                </div>
                <div class="user_details_container">
                    <div class="name_container">
                        <h2>Name: ${userDetails.firstName} ${userDetails.Surname}</h2>
                    </div>
                    <div class="Mobile_container">
                        <h2>Mobile No: ${userDetails.mobile}</h2>
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
        

        );

        apptContainer.insertAdjacentHTML('beforeend',appointmentsData)
        $(document.querySelector('.deletebtn')).click(e => { 
            e.preventDefault();
            deleteAppointment(e.currentTarget.dataset.appt, userDetails._id, "Client")
        })
        printPage(print_btn)
    }

    const printPage = button => {
        $(button).click(() => {
            windown.print()
        })
    }

    // Setting up the code for displaying the dates, days and times on the appointment booking page
    const displayPastMonths = place => {
        const monthToday = new Date().getMonth()
        const months = [...document.querySelectorAll('.month')]
        months.filter(month => month.dataset.month < monthToday).map(month => month.classList.add('disabled'))
        document.querySelector(`.month[data-month="${monthToday}"]`).getElementsByClassName.background = "green"
        displayPastDays(months , document.querySelector(`.month[data-month="${monthToday}"]`) , place)
    }

    const displayPastDays = (months,startMonth , place) => {
        // Get month Selected Info, adds it to appointment details
        let monthSelected = clickMonth(months, startMonth);
        appointment_Details["Month"] = monthSelected.DayName

        //Display Calendar and Days that are closed to appointments
        let days = fillInCalendar(monthSelected.Number, monthSelected.NumOfDays,monthSelected.WeekDayNameOfFirstDay, monthSelected.Name),
        dayStarted = new Date().getDate();
        if (place === "Clinic")addClinicDays(days)
        else dealWithDays(days)
        
        displayDaysIrrelevant(days , dayStarted)

       // Getting the form Data and filling it to Appointment Details

       appointment_Details["firstName"] = formData.get('firstName')
       appointment_Details["Surname"] = formData.get('Surname')
       appointment_Details["Mobile"] = formData.get('Mobile')
       appointment_Details["Email"] = formData.get('Email')

       displayAppointmentPopup(appointment_Details)
       dealWithFormSubmit()
    }

    const validateBookingDetails = () => {
        return appointment_Details["Month"] !== undefined && appointment_Details["DayDate"] !== undefined && appointment_Details["Time"] !== undefined
}

const displayAppointmentPopup = appointment_Details => {
    let modal = fillinModalDetails(appointment_Details)
    document.querySelector('.appointment_made_modal').innerHTML = modal;
    document.querySelector('.appointment_made_modal').style.display = "block"
    cancelModal(document.querySelector('.appointment_made_modal'))

}

const cancelModal = modal => {
    const cancel_btn = document.querySelector('.cancelApptBtn')
    $(cancel_btn).click(() => {
        modal.style.display = "none"
} )
}

const fillinModalDetails = appointment_made_details => {
    return `<div class="appointment_made_modal_content">
    <h2>Hi ${appointment_made_details.firstName} ${appointment_made_deatils.Surname},</h2>
    <h4>You requested an appointetment for</h4>
    <div class="date_time_container">
    <h3><strong>Date :</strong> ${appointment_made_details.DayName} ${appointment_made_details.DayDate} ${appointment_made_details.Month} </h3>
    
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
    let formData = newFormData(form)
    return formData
}

const dealWithMonths = (place, clinciData, clinicDataSingle) => {
    const months = [...document.querySelectorAll('.month')];
    months.map(month => {
        $(month).click(e => {

            // Get Month Selected Information, adds it to the appointment details
            let monthSelected = clickMonth(months , e.target);
            appointment_Details["Months"] = monthSelected.Name

            //Display Calendar and Days that are closed
            let days = fillInCalendar(monthSelected.Number, monthSelected, monthSelected.NumOfDays, monthSelected.WeekDayNameOfFirstDay, monthSelected.Name )
            if (monthSelected.Name === nameOfMonth(new Date().getMonth())) {
                displayDaysIrrelevant(days, new Date().getDate())
            } else {
                displayDaysIrrelevant(days)
            }

            if(place === "Clinic") {
                addClinicDays(days)
                checkSlots(clinicData)
                if(clinicDateSingle !== undefined ) getEditingSlot(clinicDataSingle)
            }

            else dealWithDays(days)
        })
    })
}

const clickMonth = (months, target) => {
    // Styles the month selected and ones that arent accordinly
    months.filter(month => month !== target).map(month => {
        month.style.background = "aliciablue"
        month.style.color = "black"
    })
    target.style.background = "green"
    target.style.color = "fff"

    // Get month Selected Information and returns Information
    let monthSelected = getMonthSelected(target.dataset.month)
    return monthSelected 
}

const dealWithDays = days => {
    days.map(day => {
        $(day).click(e => {

            //Get Day Selector Information and adds it to appointment details
            let daySelected = clickDay(days, e.target)
            appointment_Details["DayName"] = daySelected.day 
            appointment_Details["DayDate"] = daySelected.Date

            // Dealing with the times
            dealWithTimes()
    })

})
}


const clickDay = (days, target) => {

    //Style the month selected and ones that aren't accordingly
    days.filter(day => day !== target && day.dataset.day !== "Sunday").map(day =>{
        $(day).css('background', 'aliceblue')
        $(day).css('color', 'black')
    })
    target.style.background = "green"
    target.style.color = "white"

    // Get day selected Information and returns Information
    let daySelected = getDaySelected(target)
    return daySelected 
}

const dealWithTimes = () => {

    //** Get current time, round it to the nearest 10, make time slot and return the timeslot Containers
    
    // let time_now = new Date(),
    // newRoundedTime = roundMinutes(time_now),

    let timeSlots = makeTimeslots(moment().startOf('day').add(9,'h'), [] , 10)

    timeSlotContainers = displayTimeslots(timeSlots);
    timeSlotContainers.map(timeSlot => {
        $(timeSlot).click(e => {

            // Get the time selected information and add it to the appointment details
            let timeSelected = clickTime(timeSlotContainers, e.target)
            checkTime(new Date().getHours(), timeSlotContainers)
            checkAgainstAppointments()
            appointment_Details["Time"] = timeSelected
        })
    })


}

const clickTime = (timeSlotContainers , target) => {
    // Style the time selected and ones that arent accordingly
    timeSlotContainers.filter(timeSlot => timeSlot !== target && !timeSlot.classList.contains('disabled')).map(timeSlot => {
        timeSlot.style.background = "aliciablue"
        timeSlot.style.color = "black"
    })
    target.style.background = "green"
    target.style.color = "white"

    // Get time selected information and returns information
    let timeSelected = target.innerHTML
    return timeSelected
}

const getMonthSelected = monthNo => {
    let monthSelected = {
        "LastDayNum": getLastDayNum(new Date().getFullYear(), Number(monthno)),
        "WeekdayNumOfFirstDay": getWeekDayNum(new Date().getFullYear(), Number(monthNo), 1),
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

const makeTimeslots = (startTime, timeSlots , interval) => {
    let completed = falsetimeSlots.push(`${startTime.hours()}:${startTime.minutes()}`)
    if(!completed){
        if(startTime.hours() === 18 && startTime.minutes() === 0){
            completed = true
            return [...timeSlots]
        } else {
            if (Array.isArray(makeTimeslots(startTime.add(interval, 'm'), timeSlots, interval)))
            return timeSlots
            timeSlots.push(makeTimeslots(startTime.add(interval, 'm'), timeSlots, interval))
        }
    }
}

const displayTimeSlots = timeSlots => {
    document.querySelector('.time_slot_container_m').style.display = "block"
    let timeSlotContainer = document.querySelector('.time_slot_container')
    timeSlots = timeSlots.map(timeSlot =>
        `<div class="timeslot" data-time="${timeSlot}">${timeSlot}</div>`
    ).join("")

    timeSlotContainer.innerHTML = timeSlots
    let timeSlotContainers = getTimeContainers()
    checkTime(new Date().getHours(), timeSlotContainers)
    checkAgainstAppointments()
    return timeSlotContainers
        
}

const checkAgainstAppointments = () => {

    //This just checks if the date picked is within the date slots that Mikey has picked
    // 1) If it is - filters the timeslots available by capacity of equal or more than the number of equal or more than of * 2
    // 2) Else - filters the timeslots availbe by capacity of equal or more than 2

    //Disable first, then enable as needs be
    appointments_Saved
    .map(appointment_s => {
        document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.remove("original_bg_timeslot")
        document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("disabled")
        document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("orange_disabled")
    })
    for (clinicDataSingle of clinic_Data)
    if (appointment_Details["Month"] == clinicDataSingle.Month) {
        timeSlotsContainer = getTimeslotContainers()
        for (date of clinicDataSingle.Dates)
        if (appointment_Details["DayDate"] == date) {
            for (hour of clinicDataSingle.Hours) {
                timeSlotsContainers
                .filter(appt => appt.innerHTML == hour)
                .map(appointment_s => {
                    appointment_s.classList.add("original_bg_timeslot")
                    appointment_s.classList.remove("disabled")
                    appointment_s.classList.remove("orange_disabled")

                })

            }
            appointments_Saved
            .filter(appointment => appointment.DayDate == date)
            .filter(appointment => appointment.Capacity.length >= parseInt(clinicDataSingle.Providers) * 2)
            .map(appointment_s => {
                document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.remove("original_bg_timeslot")
                document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("disabled")
                document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("full_disabled")
            })
        }
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


const checkTime = (timeNow, timeSlotContainers) => {
    // This does four checks to find the available slots for clients 
    /**
     * 1) Checks the date is equal to the date the user specifies 
     * 2) Checks against the clinic hours 
     * 3) Checks and filters the disabled timeSlots by hour 
     * - Equal to the hour then checks the minutes and sees if minutes now are more than the time user is using the app
     * - More than the hour 
     * 4) This ensures that when the user logs on they should only see available slots 
     * and not one's that are not available because of clinic hours, not available because they have passed 
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
    clinic_Data.map(clinic_Dets => {
        for (date of clinic_Dets.Dates)
        if (Number(date) === Number(appointment_Details["DayDate"])) {
            for (hour of clinic_Dets.Hours) {
                timeSlotContainers.filter(timeSlot => timeSlot.innerHTML === hour)
                .map(timeSlotContainer => {
                    timeSlotContainer.classList.remove('disabled')
                    timeSlotContainer.classList.add('original_bg_timeslot')
                })
            }
        }
    })

}

const getTimeslotContainers = () => {
    return timeslotPills = [...document.querySelectorAll(`.timeslot`)]
}

const displayDaysIrrelevant = (days , dayStarted) => {
    if(dayStarted !== null){
        days.filter(day => day.innerHTML < dayStarted).map(day => day.classList.add('disabled'))
    }
    days.filter(day => day.dataset.day === "Sunday" && day.dataset.day === "Monday").map(day => {
        day.tyle.background = "orange"
        day.classList.add('disabled')
    })
}

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
        if(firstDay !== "Monday")
        margin = `<div class="margin"></div>`
        numberOfDays = numberOfDays.map(day => {
            let dayOfWeek = getWeekDayNum(new Date().getFullYear(), monthSelectedNum, day)
            dayOfWeek = nameOfDay(dayOfWeek);
            return`<div class="day" data-day= "${dayOfWeek}" data-month="${monthSelectedName}">${day}</div>`
        }).join("")
        calendarContainer.innerHTML = daysOfWeek + margin + numberOfDays
        getSpan(firstDay)
        let dayContainers = getDayContainers()
        return dayContainers
}

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
        if (e.target === document.querySelector('.terms_and_c_modal')) 
        closeModal()
    })
    //For Mobile
    $(window).on('tap' , e => {
        if (e.target === document.querySelector('.terms_and_c_modal'))
        CloseModal()
    })
}

const closeModal = () => {
    document.querySelector('.terms_and_c_modal').style.display = "none"
}

const fillInTermsModal = () => {
    return `<div class="terms_and_c_modal_content">
    <h2>Terms and Conditions Apply</h2>
    <p>I consent to having my data stored for business reasons in line with GDPR</p>
    </div>`
}

const adminLogin = () => {
    const loginForm = document.querySelector('.login_form')
    $(loginForm).submit(e => {
        let loginDetails = {
            Username: $('#username_input').val(),
            Password: $('#password_input').val()
        }
        e.preventDefault()
        if(!isValidLogin(loginDetails)) {
            alert("Your username or password is invalid")
            return
        }
        sessionStorage.setItem("Admin", "LoggedIn");
        window.location = "adminhome.html"
    })
}

const adminLogout = () => {
    const logout_btn = document.querySelector('.logout')
    $(logout_btn).click(()=> {
        sessionStorage.removeItem("Admin");
        window.location = "adminlogin.html"
    })
}

const adminInit = () => {
    type = "Appointments"
    $(`.options_container h1:contains("${type}")`)[0].style.background = "#fff"
    dealWithTabs()
    setDateTimeLocal(document.querySelector('#date_picker_input'))
    DealWithDateChange(document.querySelector('#date_picker_input'))
    const SelectedDateTime = getDateTime()
    displayData(filterSavedAppointments(appointments_Saved, SelectedDateTime))
    dealWithSearch()
    getAppointmentDataFromTable()
    const print_btn = document.querySelector('.print_btn');
    printPage(print_btn)
}

const dealWithTabs = () => {
    const tabs = [...document.querySelectorAll('.options_container h1')]
    tabs.map(tab => $(tab).click(e => {
        if(e.target.innerHTML === "Barber Shop") window.location = "adminshophome.html"
        else if(e.target.innerHTML === "Appointemnts") window.location = "adminhome.html"
        tabs.filter(tab => tab != e.target).map(tab => tab.style.background = "")
        e.target.style.background = "#fff"
    }))
}

const filterSavedAppointments = (appointments , dateDetails) => {
    return appointments.filter(appointment => parseInt(appointment.DayDate) === parseInt(dateDetails.Date) && appointment.Month === dateDetails.MonthName)
}

const getDateTime = () => {
    const dateDetails = {
        Year: document.querySelector('#date_picker_inner').value.split("-")[0],
        Month: document.querySelector('#date_picker_input').value.split("-")[1],
        MonthName: nameOfMonth(parseInt(document.querySelector('#date_picker_input').value.split("-")[1]) - 1),
        Date: document.querySelector('#date_picker_input').value.split("-")[2].split("T")[0],
        Time: document.querySelector('#date_picker_input').value.split("-")[2].split("T")[1]
    }
    return dateDetails
}

const dealWithDateChange = date_picker => {
    $(date_picker).on('change', e => {
        document.querySelector('.main_container_m').innerHTML = `
        <div class="headings">
        <h4 class="container_sm">Time(incDate)</h4>
        <h4 class="container_sm">First Name(s)</h4>
        <h4 class="container_sm">Surname(s)</h4>
        <h4 class="container_sm">Mobile No.</h4>
        <h4 class="container_sm">Email</h4>
        </div>
        `
        const SelectedDateTime = getDateTime()
        displayData(filterSavedAppointments(appointments_Saved, SelectedDateTime))
    })
}

const setDateTimeLocal = date_picker => {
    date_picker.value = moment().format(moment.HTML5_FMT.DATETIME_LOCAL).toString()
}

const getAppointmentDataFromTable = () => {
    const download_btn = document.querySelector('.download_csv_btn');
    $(download_btn).click(e => {
        const csvData = objectToCSV(appointments_Data)
        downloadCSV(csvData)
    })
}

const getDetails = appointments => {
    let details = []
    appointments.map(appt => details.push(`"${escapeSlashAndQuotes(appt.firstName)}"`, `"${escapeSlashAndQuotes(appt.Surname)}"`, `"${escapeSlashAndQuotes(appt.Mobile_Number)}"` , `"${escapeSlashAndQuotes(appt.Email)}"`))
        // appointments.map(appt => details.push(`"${escapeSlashAndQuotes(appt.firstName)}"`, `"${escapeSlashAndQuotes(appt.Surname)}"`, `"${escapeSlashAndQuotes(appt.Mobile_Number)}"` , `"${escapeSlashAndQuotes(appt.Email)}"`))
        return [...details]
}

const objectToCSV = appointments_Data => {
    const csvRows = [],

    // Get the headers 
    headers = [`"Date"`, `"Time"`, `"First Name(s)"`, `"Surname(s)"`, `"Mobile No"`, `"Email"`]
    // headers = [`"Date"`, `"Time"`, `"First Name(s)"`, `"Surname(s)"`, `"Mobile No"`, `"Email"`]
    csvRows.push(headers.join(","))

    // Loop over the rows and get values for each of the headers
    // form escaped comma seperated values

    let values = appointments_Data.map(appointment => [`"${escapeSlashAndQuotes(appointment.DayDate)} ${escapeSlashAndQuotes(appointment.Month)}"`, `"${escapeSlashAndQuotes(appointment.Time)}"` , ...getDetails(appointment.Capacity)])
    values.map(value => csvRows.push(value.join(",")))

    return csvRows.join("\n")
}

const downloadCSV = csvData => {
    //Make a blob file
    const blob = new Blob([csvData], {type: 'text/csv'}),
    blobURL = window.URL.createObjectiveURL(blob),
    a_tag = `<a href="${blobURL}" class="blob_link" hidden download="Mikeys_Appointments.csv"></a>`;
    document.body.insertAdjacentHTML('beforeend' , a_tag)
    let a_tag_element = document.querySelector('.blob_link')

    $('.blob_link')[0].click()
    document.body.removeChild(a_tag_element)
    
}