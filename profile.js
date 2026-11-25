const profileForm = document.getElementById("profileForm");

document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("jobfinder_user");
    if (savedUser) {
        const user = JSON.parse(savedUser);
        const parts = (user.name || "").split(" ");
        if (parts[0]) document.getElementById("firstName").value = parts[0];
        if (parts.length > 1) document.getElementById("lastName").value = parts.slice(1).join(" ");
        if (user.email) document.getElementById("profileEmail").value = user.email;
    }
});

if (profileForm) {
    profileForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const resumeInput = document.getElementById("resumeFile");
        const resumeName = resumeInput && resumeInput.files.length > 0 ? resumeInput.files[0].name : "";

        const payload = {
            first_name: document.getElementById("firstName").value.trim(),
            last_name: document.getElementById("lastName").value.trim(),
            email: document.getElementById("profileEmail").value.trim(),
            phone: document.getElementById("profilePhone").value.trim(),
            location: document.getElementById("profileLocation").value.trim(),
            job_title: document.getElementById("jobTitle").value.trim(),
            experience: document.getElementById("experience").value,
            skills: document.getElementById("skills").value.trim(),
            education: document.getElementById("education").value.trim(),
            about: document.getElementById("about").value.trim(),
            resume_name: resumeName
        };

        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            alert(data.message || "Profile saved successfully!");
        } catch (error) {
            localStorage.setItem("jobfinder_profile", JSON.stringify(payload));
            alert("Profile saved locally (offline mode).");
        }
    });
}
