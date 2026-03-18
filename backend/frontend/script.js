const BASE_URL = "http://127.0.0.1:5000/api/auth";

function showAlert(message, type) {
  const alertBox = document.getElementById("alert");
  alertBox.className = "alert show " + (type === "success" ? "alert-success" : "alert-error");
  alertBox.innerText = message;
}

// ✅ Auto-fill referral code from URL
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && document.getElementById("referralCode")) {
    document.getElementById("referralCode").value = ref;
  }
}); // ✅ closed here

async function register() {
  const btn = document.getElementById("btn");
  btn.innerHTML = '<span class="spinner"></span> Creating...';
  btn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username:     document.getElementById("username").value,
        email:        document.getElementById("email").value,
        password:     document.getElementById("password").value,
        referralCode: document.getElementById("referralCode")?.value || ""
      })
    });

    const data = await res.json();

    if (res.ok) {
      showAlert(data.message, "success");
      localStorage.setItem("token", data.token);
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
    } else {
      showAlert(data.message, "error");
    }

  } catch (err) {
    console.log("Fetch error:", err);
    showAlert("Network error ❌", "error");
  }

  btn.innerHTML = "Create Account";
  btn.disabled = false;
}

async function login() {
  const btn = document.getElementById("btn");
  btn.innerHTML = '<span class="spinner"></span> Logging in...';
  btn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:    document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });

    const data = await res.json();

    if (res.ok) {
      showAlert(data.message, "success");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
    } else {
      showAlert(data.message, "error");
    }

  } catch (err) {
    console.log("Fetch error:", err);
    showAlert("Network error ❌", "error");
  }

  btn.innerHTML = "Login";
  btn.disabled = false;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}