const loginForm = document.getElementById("loginForm");
const forgotLink = document.getElementById("forgotPasswordLink");

if (forgotLink) {
    forgotLink.addEventListener("click", (event) => {
        event.preventDefault();
        alert("Please register a new account or contact support to reset your password.");
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("jobfinder_user", JSON.stringify(data.user));
                alert("Login successful! Welcome " + data.user.name);
                window.location.href = "index.html";
            } else {
                alert(data.message || "Invalid email or password.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Unable to connect to the server. Please try again later.");
        }
    });
}
