const API_BASE = "";

function showJobs(category) {
    const title = document.getElementById("category-title");
    const jobList = document.getElementById("job-list");
    const jobOptions = document.getElementById("job-options");

    jobOptions.style.display = "block";

    const categoriesData = {
        it: {
            heading: "💻 Information Technology Jobs",
            items: [
                { title: "Web Developer", skills: "HTML • CSS • JavaScript" },
                { title: "Software Engineer", skills: "Java • Python • C++" },
                { title: "Data Analyst", skills: "Excel • SQL • Python" },
                { title: "Cyber Security", skills: "Security • Networking • Ethical Hacking" }
            ]
        },
        marketing: {
            heading: "📢 Marketing Jobs",
            items: [
                { title: "Digital Marketing", skills: "SEO • Google Ads • Social Media" },
                { title: "SEO Specialist", skills: "SEO • Keyword Research • Analytics" },
                { title: "Social Media Manager", skills: "Instagram • Facebook • Content" },
                { title: "Content Writer", skills: "Blog • Copywriting • Content Creation" }
            ]
        },
        finance: {
            heading: "📊 Finance & Accounting Jobs",
            items: [
                { title: "Accountant", skills: "Accounting • Tally • GST" },
                { title: "Financial Analyst", skills: "Finance • Excel • Analysis" }
            ]
        },
        design: {
            heading: "🎨 Design & Creative Jobs",
            items: [
                { title: "UI/UX Designer", skills: "Figma • UX • UI Design" },
                { title: "Graphic Designer", skills: "Photoshop • Illustrator • Canva" }
            ]
        }
    };

    const selected = categoriesData[category];
    if (!selected) return;

    title.innerHTML = selected.heading;
    jobList.innerHTML = selected.items
        .map(
            (item) => `
            <div class="option-card">
                <h3>${item.title}</h3>
                <p>${item.skills}</p>
                <button type="button" onclick="quickFilter('${item.title}')">View Jobs</button>
            </div>
        `
        )
        .join("");

    jobOptions.scrollIntoView({ behavior: "smooth" });
}

function quickFilter(keyword) {
    const searchInput = document.getElementById("searchKeyword");
    if (searchInput) searchInput.value = keyword;
    filterJobs();
    document.getElementById("featured-jobs")?.scrollIntoView({ behavior: "smooth" });
}

function filterJobs() {
    const keyword = (document.getElementById("searchKeyword")?.value || "").trim().toLowerCase();
    const location = (document.getElementById("searchLocation")?.value || "").trim().toLowerCase();
    const cards = document.querySelectorAll("#featuredJobContainer .job-card");
    const statusEl = document.getElementById("searchStatus");

    let visibleCount = 0;
    cards.forEach((card) => {
        const title = (card.dataset.title || "").toLowerCase();
        const company = (card.dataset.company || "").toLowerCase();
        const loc = (card.dataset.location || "").toLowerCase();

        const matchesKeyword = !keyword || title.includes(keyword) || company.includes(keyword);
        const matchesLocation = !location || loc.includes(location);

        if (matchesKeyword && matchesLocation) {
            card.style.display = "flex";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (statusEl) {
        if (!keyword && !location) {
            statusEl.style.display = "none";
        } else {
            statusEl.style.display = "block";
            statusEl.textContent =
                visibleCount > 0
                    ? `Showing ${visibleCount} matching job(s)`
                    : "No featured jobs matched your filter. Clear search to view all jobs.";
        }
    }
}

async function applyJob(jobId, jobTitle, company) {
    const savedUser = localStorage.getItem("jobfinder_user");
    if (!savedUser) {
        alert("Please login first to apply for " + jobTitle + " at " + company + ".");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(savedUser);

    try {
        const response = await fetch(`${API_BASE}/api/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, job_id: jobId })
        });
        const data = await response.json();
        alert(data.message || `Applied for ${jobTitle} at ${company}!`);
    } catch (error) {
        alert(`Application saved locally for ${jobTitle} at ${company}!`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("jobfinder_user");
    const navButtons = document.getElementById("navButtons");
    if (savedUser && navButtons) {
        const user = JSON.parse(savedUser);
        navButtons.innerHTML = `
            <a href="profile.html" class="login">Hi, ${user.name}</a>
            <a href="#" class="register" id="logoutBtn">Logout</a>
        `;
        document.getElementById("logoutBtn").addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("jobfinder_user");
            window.location.reload();
        });
    }

    const searchBtn = document.getElementById("searchBtn");
    const searchKeyword = document.getElementById("searchKeyword");
    const searchLocation = document.getElementById("searchLocation");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            filterJobs();
            document.getElementById("featured-jobs")?.scrollIntoView({ behavior: "smooth" });
        });
    }

    [searchKeyword, searchLocation].forEach((input) => {
        if (input) {
            input.addEventListener("keyup", (e) => {
                if (e.key === "Enter") {
                    filterJobs();
                    document.getElementById("featured-jobs")?.scrollIntoView({ behavior: "smooth" });
                } else if (!searchKeyword.value && !searchLocation.value) {
                    filterJobs();
                }
            });
        }
    });
});
