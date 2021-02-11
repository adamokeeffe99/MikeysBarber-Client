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
    // This just checks if the date picked is within the date slots that the clinic picks
    // 1) If it is - filters the timeslots availability by Capacity of equal or more than the number of providers * 2
    // 2) Else - filters the timeslots availability by Capacity of equal or more than 2

    //Disable first , then enable as needs be
    appointments_Saved
        .map(appointment_s => {
            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.remove("original_bg_timeslot")
            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("disabled")
            document.querySelector(`.timeslot[data-time="${appointment_s.Time}"]`).classList.add("orange_disabled")
        })
    for (clinicDataSingle of clinic_Data)
        if (appointment_Details["Month"] == clinicDataSingle.Month) {
            timeslotsContainers = getTimeslotContainers()
            for (date of clinicDataSingle.Dates)
                if (appointment_Details["DayDate"] == date) {
                    for (hour of clinicDataSingle.Hours) {
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
                        .filter(appointment => appointment.Capacity.length >= parseInt(clinicDataSingle.Providers) * 2)
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
                        .map(timeslotContainer => {
                            timeslotContainer.classList.remove('disabled')
                            timeslotContainer.classList.add('original_bg_timeslot')
                        })
                }
            }
    })

}

const getTimeslotContainers = () => {
    return timeslotPills = [...document.querySelectorAll('.timeslot')]
}

const displayDaysIrrelevant = (days , dayStarted) => {
    if(dayStarted !== null) {
        days.filter(day => day.innerHTML < dayStarted).map(day => day.classList.add('disabled'))
    }
    days.filter(day => day.dataset.day === "Sunday" && day.dataset.day === "Monday").map(day => {
        day.style.background = "orange" 
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
        return `<div class="day" data-day= "${dayOfWeek}" data-month="${monthSelectedName}">${day}</div>`
    }).join("")
    calendarContainer.innerHTML= daysOfWeek + margin + numberOfDays
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
        if (e.target === document.querySelector('.terms_and_c_modal')) closeModal()
    })  
    //For mobile
    $(window).on('tap' , e => {
        if (e.target === document.querySelector('.terms_and_c_modal')) closeModal()
    })
}

const closeModal = () => {
    document.querySelector('.terms_and_c_modal').style.display = "none" 
}

const fillInTermsModal = () => {
    return `<div class="terms_and_c_modal_content">
                <h2>Terms and Conditions Apply</h2>
                <p>I consent to receiving vaccination and I'm aware of the risks and side effects as per patient information leaflet at <a href="https://www.medicines.org.uk/emc/search?q=%22Influenza+vaccine%22">https://www.medicines.org.uk/InfluenzaVaccine</a></p>
            </div>`
}
