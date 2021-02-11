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
                    <a class="update_btn action_btn" href="edit.html?
                    id=${appt._id}&userId=${userDetails._id}">Edit</a>
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