var popup = null;
var base_url;
if (typeof document.dev_env != "undefined") {
  base_url = document.dev_env;
}
else {
  //get resources off of github to not inflate the jsdelivr stats
  base_url = "https://raw.githubusercontent.com/Zaidbaidadekalb/edpuzzle-answers/main";
}

function http_get(url, callback, headers=[], method="GET", content=null) {
  var request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);

  if (window.__EDPUZZLE_DATA__ && window.__EDPUZZLE_DATA__.token) {
    headers.push(["authorization", window.__EDPUZZLE_DATA__.token]);
  }
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  
  request.send(content);
}

function init() {
  if (window.location.hostname == "edpuzzle.hs.vc") {
    alert("To use this, drag this button into your bookmarks bar. Then, run it when you're on an Edpuzzle assignment.");
  }
  else if ((/https{0,1}:\/\/edpuzzle.com\/assignments\/[a-f0-9]{1,30}\/watch/).test(window.location.href)) {
    getAssignment();
  }
  else if (window.canvasReadyState) {
    handleCanvasURL();
  }
  else if (window.schoologyMoreLess) {
    handleSchoologyURL();
  }
  else {
    alert("Please run this script on an Edpuzzle assignment. For reference, the URL should look like this:\nhttps://edpuzzle.com/assignments/{ASSIGNMENT_ID}/watch");
  }
}

function handleCanvasURL() {
  let location_split = window.location.href.split("/");
  let url = `/api/v1/courses/${location_split[4]}/assignments/${location_split[6]}`;
  http_get(url, function(){
    let data = JSON.parse(this.responseText);
    let url2 = data.url;

    http_get(url2, function() {
      let data = JSON.parse(this.responseText);
      let url3 = data.url;

      alert(`Please re-run this script in the newly opened tab. If nothing happens, then allow popups on Canvas and try again.`);
      open(url3);
    });
  });
}

function handleSchoologyURL() {
  let assignment_id = window.location.href.split("/")[4];
  let url = `/external_tool/${assignment_id}/launch/iframe`;
  http_get(url, function() {
    alert(`Please re-run this script in the newly opened tab. If nothing happens, then allow popups on Schoology and try again.`);

    //strip js tags from response and add to dom
    let html = this.responseText.replace(/<script[\s\S]+?<\/script>/, ""); 
    let div = document.createElement("div");
    div.innerHTML = html;
    let form = div.querySelector("form");
    
    let input = document.createElement("input")
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "ext_submit");
    input.setAttribute("value", "Submit");
    form.append(input);
    document.body.append(div);

    //submit form in new tab
    form.setAttribute("target", "_blank");
    form.submit();
    div.remove();
  });
}

function getAssignment(callback) {
  var assignment_id = window.location.href.split("/")[4];
  if (typeof assignment_id == "undefined") {
    alert("Error: Could not infer the assignment ID. Are you on the correct URL?");
    return;
  }
  var url1 = "https://edpuzzle.com/api/v3/assignments/"+assignment_id;

  http_get(url1, function(){
    var assignment = JSON.parse(this.responseText);
    if ((""+this.status)[0] == "2") {
      openPopup(assignment);
    }
    else {
      alert(`Error: Status code ${this.status} received when attempting to fetch the assignment data.`)
    }
  });
}

function openPopup(assignment) {
  var media = assignment.medias[0];
  var teacher_assignment = assignment.teacherAssignments[0];
  var assigned_date = new Date(teacher_assignment.preferences.startDate);
  var date = new Date(media.createdAt);
  thumbnail = media.thumbnailURL;
  if (thumbnail.startsWith("/")) {
    thumbnail = "https://"+window.location.hostname+thumbnail;
  }
  
  var deadline_text;
  if (teacher_assignment.preferences.dueDate == "") {
    deadline_text = "no due date"
  }
  else {
    deadline_text = "due on "+(new Date(teacher_assignment.preferences.dueDate)).toDateString();
  }
  
  var base_html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Answers for: ${media.title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      :root {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --primary-color: #4fc3f7;
        --secondary-color: #81c784;
        --accent-color: #ff4081;
      }
      * {box-sizing: border-box; margin: 0; padding: 0;}
      body {
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.6;
        color: var(--text-color);
        background-color: var(--bg-color);
        transition: background-color 0.3s ease;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }
      .thumbnail {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 20px;
      }
      .title-info h1 {
        font-size: 24px;
        margin-bottom: 10px;
      }
      .title-info p {
        font-size: 14px;
        color: #9e9e9e;
      }
      .note {
        font-style: italic;
        margin-top: 10px;
      }
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
      }
      button, select {
        background-color: var(--primary-color);
        color: #ffffff;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.1s;
      }
      button:hover, select:hover {
        background-color: #3ba8d9;
      }
      button:active, select:active {
        transform: scale(0.98);
      }
      button:disabled, select:disabled {
        background-color: #616161;
        cursor: not-allowed;
      }
      .hidden {
        display: none;
      }
      #speed_container, #options_container {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      #custom_speed {
        width: 100%;
        margin-top: 10px;
      }
      .question-container {
        background-color: #2d2d2d;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }
      .question-container:hover {
        transform: translateY(-2px);
      }
      .question-header {
        display: flex;
        align-items: baseline;
        margin-bottom: 10px;
      }
      .timestamp {
        font-size: 14px;
        color: #9e9e9e;
        margin-right: 10px;
      }
      .question-content {
        font-size: 16px;
        font-weight: 500;
      }
      .choices {
        list-style-type: none;
        padding-left: 20px;
      }
      .choice {
        margin-bottom: 5px;
        transition: color 0.3s ease;
      }
      .choice-correct {
        color: var(--secondary-color);
      }
      footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #9e9e9e;
      }
      footer a {
        color: var(--primary-color);
        text-decoration: none;
      }
      footer a:hover {
        text-decoration: underline;
      }
      #notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }
      .notification {
        background-color: #333;
        color: #fff;
        padding: 12px 20px;
        border-radius: 4px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateX(50px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      .notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      .notification.success {
        background-color: var(--secondary-color);
      }
      .notification.error {
        background-color: var(--accent-color);
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
    </style>
    <script>
      var base_url = "${base_url}";
    </script>
  </head>
  <body>
    <div class="container">
      <header>
        <img src="${thumbnail}" alt="Thumbnail" class="thumbnail">
        <div class="title-info">
          <h1>${media.title}</h1>
          <p>Uploaded by ${media.user.name} on ${date.toDateString()}</p>
          <p>Assigned on ${assigned_date.toDateString()}, ${deadline_text}</p>
          <p class="note">Correct choices are <u>underlined</u>.</p>
        </div>
      </header>
      <div class="controls">
        <button id="skipper" onclick="skip_video();" disabled>Skip Video</button>
        <button id="answers_button" onclick="answer_questions();" disabled>Answer Questions</button>
        <div id="speed_container" class="hidden">
          <label for="speed_dropdown">Video speed:</label>
          <select name="speed_dropdown" id="speed_dropdown" onchange="video_speed()">
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>Normal</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2">2x</option>
            <option value="-1">Custom</option>
          </select>
          <label id="custom_speed_label" for="custom_speed"></label>
          <input type="range" id="custom_speed" name="custom_speed" value="1" min="0.1" max="16" step="0.1" oninput="video_speed()" class="hidden">
        </div>
        <div id="options_container">
          <label for="pause_on_focus">
            <input type="checkbox" id="pause_on_focus" name="pause_on_focus" onchange="toggle_unfocus();">
            Don't pause on unfocus
          </label>
        </div>
      </div>
      <main id="content">
        <p id="loading_text"></p>
      </main>
      <footer>
        <p>Made by: <a href="https://github.com/ading2210" target="_blank">ading2210</a> on Github | Website: <a href="https://edpuzzle.hs.vc" target="_blank">edpuzzle.hs.vc</a> | Source code: <a href="https://github.com/ading2210/edpuzzle-answers" target="_blank">ading2210/edpuzzle-answers</a></p>
        <p>Licenced under the <a href="https://github.com/ading2210/edpuzzle-answers/blob/main/LICENSE" target="_blank">GNU GPL v3</a>. Do not reupload or redistribute without abiding by those terms.</p>
        <p>Available now from our <a href="https://edpuzzle.hs.vc/discord.html" target="_blank">Discord server</a>: <i>An open beta of a completely overhauled GUI, with proper mobile support, ChatGPT integration for open-ended questions, and more.</i></p>
      </footer>
    </div>
    <div id="notification-container"></div>
  </body>
  </html>`;
  
  popup = window.open("", "Answers", "width=600, height=400, top=100, left=100");
  popup.document.write(base_html);
  popup.document.close();
  
  http_get(base_url+"/app/popup.js", function(){
    popup.eval(this.responseText);
  });
  
  var content = popup.document.getElementById("content");
  var loading_text = popup.document.getElementById("loading_text");
  
  function get_question_data() {
    var tasks = assignment.teacherAssignments[0].tasks;
    var questions = [];
    for (let i=0; i<tasks.length; i++) {
      let task = tasks[i];
      if (task.type == "multiple-choice") {
        questions.push(task);
      }
    }
    return questions;
  }
  
  function format_question(question) {
    var text = question.body[0].text;
    var html = `<p>${text}</p>`;
    return html;
  }
  
  function format_choices(choices, correct_answer) {
    var html = "";
    for (let i=0; i<choices.length; i++) {
      let choice = choices[i];
      if (i == correct_answer) {
        html += `<li class="choice choice-correct"><u>${choice}</u></li>`;
      }
      else {
        html += `<li class="choice">${choice}</li>`;
      }
    }
    return html;
  }
  
  function parseQuestions(questions) {
    var counter = 0;
    var counter2 = 0;
    content.innerHTML = "";
    
    for (let i=0; i<questions.length; i++) {
      let question = questions[i];
      let choices_html = format_choices(question.choices, question.correctAnswer);
      let question_html = format_question(question);
      counter++;
      
      let minutes = Math.floor(question.time/60);
      let seconds = question.time%60;
      if (seconds < 10) {
        seconds = "0"+seconds;
      }
      let timestamp = minutes+":"+seconds;
      
      if (typeof question.choices != "undefined") {
        let table = `
        <div class="question-container">
          <div class="question-header">
            <span class="timestamp">[${timestamp}]</span>
            <div class="question-content">${question_html}</div>
          </div>
          <ul class="choices">
            ${choices_html}
          </ul>
        </div>
        `;
        
        content.innerHTML += table;
        counter2++;
      }
    }
    
    loading_text.innerHTML = `Found ${counter2}/${counter} questions.`;
    popup.document.getElementById("skipper").disabled = false;
    popup.document.getElementById("answers_button").disabled = false;
    popup.document.getElementById("speed_container").classList.remove("hidden");
    
    popup.animateQuestions();
    popup.showNotification("Questions loaded successfully!", "success");
  }
  
  parseQuestions(get_question_data());
}

init();
