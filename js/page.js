import { surveyJson } from "./survey.js";
import {
  BASE_URL,
  EMAIL_REGEX,
  THANK_LOTTIE,
  fetch,
  buildOptionsByToken,
} from "./utils.js";

const SURVEY_RESPOND_JSON = {
  pages: [],
};
var Survey = window?.Survey || {};

let timerInterval;
let milliseconds = 0;
let seconds = 0;
let minutes = 0;
var isActive = false;

function startTimer(startAt) {
  clearInterval(timerInterval);

  const {
    minutes: min = 0,
    seconds: sec = 0,
    milliseconds: ms = 0,
  } = startAt || {};

  minutes = parseInt(min, 10);
  seconds = parseInt(sec, 10);
  milliseconds = parseInt(ms, 10);

  timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  milliseconds = 0;
  seconds = 0;
  minutes = 0;
  updateTimer();
}

function updateTimer() {
  milliseconds += 10;
  if (milliseconds >= 1000) {
    milliseconds = 0;
    seconds++;
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
    }
  }

  const formattedMilliseconds = pad(milliseconds, 3);
  const formattedSeconds = pad(seconds, 2);
  const formattedMinutes = pad(minutes, 2);

  document.getElementById(
    "timer"
  ).innerText = `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;

  return {
    minutes: formattedMinutes,
    seconds: formattedSeconds,
    milliseconds: formattedMilliseconds,
  };
}

function pad(number, width) {
  return String(number).padStart(width, "0");
}

$("document").ready(function () {
  $(".sd-btn sd-navigation__next-btn");
  if (isActive) {
    startTimer();
  } else {
    stopTimer();
  }
});

$(function () {
  // First Part Identify the user:
  const email = $("#email");
  const btnSubmit = $("#submit-btn");

  btnSubmit.on("click", function () {
    if (email.val() === "" || !EMAIL_REGEX.test(email.val())) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "The Email is incorrect, please introduce a valid email",
      });
      return;
    }

    fetch(
      `${BASE_URL}/begin`,
      {
        method: "POST",
        body: {
          email: email.val(),
          survey: surveyJson.title,
        },
      },
      function (response) {
        Survey.token = response.data.token;
        $("#main-section").hide();
        SurveyInit();
      }
    );
  });
});

// Survey Handlers

function SurveyInit() {
  const surveyEl = document.createElement("div");
  surveyEl.id = "surveyContainer";
  $(surveyEl).insertAfter("#main-section");

  const survey = new Survey.Model(surveyJson);

  survey.onProcessHtml.add((survey, options) => {
    options.html = `
      <div class="survey-thank">${THANK_LOTTIE}<p>Thank you for your Time! :)</p></div>
    `;
  });

  survey.onAfterRenderQuestion.add((survey, question) =>
    registering(survey, question)
  );

  survey.onCurrentPageChanging.add((survey, options) => {
    const previousQuestionTime = updateTimer();
    stopTimer();
    const { currentPageNo } = survey;
    const formattedPage = parseInt(currentPageNo);
    const { oldCurrentPage } = options || {};

    SURVEY_RESPOND_JSON.pages[formattedPage] = {
      ...oldCurrentPage.jsonObj,
      time: previousQuestionTime,
    };

    resetTimer();
  });

  survey.onComplete.add((sender, options) => {
    const { data: values, jsonObj } = sender;
    const { pages } = jsonObj;
    const lastQuestion = pages.pop();
    const getLastQuestionTime = updateTimer();
    stopTimer();
    resetTimer();

    //Append last page time
    SURVEY_RESPOND_JSON.pages.push({
      ...lastQuestion,
      time: getLastQuestionTime,
    });

    const valuesFormatted = Object.entries(values);

    SURVEY_RESPOND_JSON.pages = SURVEY_RESPOND_JSON.pages.map(
      (question, indx) => {
        const [questionNumber, value] = valuesFormatted[indx] ?? [];
        const q = question;
        delete q.elements;
        return {
          ...q,
          value,
          name: questionNumber,
        };
      }
    );
    const opts = buildOptionsByToken(Survey.token, "POST", SURVEY_RESPOND_JSON);
    fetch(
      `${BASE_URL}/registerAnswer`,
      opts,
      function (data) {
        console.log("Success:", data);
      },
      function (err) {
        console.error("Error:", err);
      }
    );
  });

  //Init Survey
  $("#surveyContainer").Survey({ model: survey });
}

//Start Counting the time when the question is showed!
const registering = (survey, question) => {
  const { currentPageNo } = survey;
  const page = parseInt(currentPageNo);
  const previousTime =
    typeof page === "number" && SURVEY_RESPOND_JSON?.pages?.[page]?.time
      ? SURVEY_RESPOND_JSON.pages[page]?.time
      : undefined;
  startTimer(previousTime);
};
