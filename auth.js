function store(){
    let username = document.getElementById("user").value;
    window.localStorage.setItem("current_user", String(username));
    console.log(String(username));
    console.log(1);
}