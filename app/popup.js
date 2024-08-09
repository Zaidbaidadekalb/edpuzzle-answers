var video_script = null;

if (typeof base_url == "undefined") {
  var base_url = "https://raw.githubusercontent.com/Zaidbaidadekalb/edpuzzle-answers/main";
}

function http_get(url, callback, headers=[], method="GET", content=null) {
  var request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);

  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  
  request.send(content);
}

function http_exec(url) {
  http_get(url, function(){
    eval(this.responseText);
  });
}

function skip_video() {
  var button = document.getElementById("skipper");
  button.disabled = true; 
  button.textContent = "Downloading script...";

  http_exec(base_url+"/app/skipper.js");
  showNotification("Video skip initiated", "info");
}

function answer_questions() {
  var skipper = document.getElementById("skipper");
  var button = document.getElementById("answers_button");
  skipper.disabled = true;
  button.disabled = true; 
  button.textContent = "Downloading script...";

  http_exec(base_url+"/app/autoanswers.js");
  showNotification("Answering questions...", "info");
}

function showNotification(message, type = "info") {
  const container = document.getElementById("notification-container");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, 3000);
  }, 100);
}

function video_speed() {
  var speed_dropdown = document.getElementById("speed_dropdown");
  var custom_speed = document.getElementById("custom_speed");
  var custom_speed_label = document.getElementById("custom_speed_label");
  
  if (speed_dropdown.value == "-1") {
    custom_speed.classList.remove("hidden");
    custom_speed_label.classList.remove("hidden");
    custom_speed_label.textContent = custom_speed.value + "x";
  }
  else {
    custom_speed.classList.add("hidden");
    custom_speed_label.classList.add("hidden");
  }
  
  var speed = parseFloat(speed_dropdown.value == "-1" ? custom_speed.value : speed_dropdown.value);
  if (video_script) {
    video_script.set_speed(speed);
    showNotification(`Video speed set to ${speed}x`, "success");
  }
}

function toggle_unfocus() {
  var checkbox = document.getElementById("pause_on_focus");
  if (video_script) {
    video_script.toggle_unfocus(checkbox.checked);
    showNotification(checkbox.checked ? "Video will not pause on unfocus" : "Video will pause on unfocus", "info");
  }
}

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Add fade-in animation to questions
function animateQuestions() {
  const questions = document.querySelectorAll('.question-container');
  questions.forEach((question, index) => {
    setTimeout(() => {
      question.classList.add('fade-in');
    }, index * 100);
  });
}

// Call this function after questions are loaded
document.addEventListener('DOMContentLoaded', animateQuestions);
