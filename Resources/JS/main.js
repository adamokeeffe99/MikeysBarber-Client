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


const isValidLogin = details => details.Username === "mikey1234" && details.Password === "barbershop1"

