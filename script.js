class QuestionGroup {

  constructor(name, data) {

    this.name = name;
    this.database = data;
    this.questionList = [];
    this.scoreTotals = {"1": 0, "2" : 0, "3": 0, "4" : 0, "5": 0};
    this.numScores = 0;

    for(let key in data) {
      this.questionList.push(key);
      this.scoreTotals["1"] += data[key]["1"];
      this.scoreTotals["2"] += data[key]["2"];
      this.scoreTotals["3"] += data[key]["3"];
      this.scoreTotals["4"] += data[key]["4"];
      this.scoreTotals["5"] += data[key]["5"];
    }
    this.numScores = this.scoreTotals["1"]+this.scoreTotals["2"]+this.scoreTotals["3"]+this.scoreTotals["4"]+this.scoreTotals["5"];
    const template = document.getElementById('question-group-template');

    this.displayObject = template.content.cloneNode(true);
    this.displayObject.querySelector('.title').textContent = this.name;
    
    this.displayRotatorObject = this.displayObject.querySelector('.text-rotator');
    this.displayRotatorObject.textContent = this.questionList[0];
    this.index = 0;
    setInterval(() => this.rotateText(), 5000);

    this.pieChart = this.displayObject.querySelector('.pie-chart');


    document.getElementById('container').appendChild(this.displayObject);

    this.determineAgreeNums();
    this.createPieChart();    

    this.rotateText();
  }

  determineAgreeNums() {

    if(this.scoreTotals["5"] / this.numScores > 0.5) {

      this.strongAgreeLabel = 'Strongly Agree';
      this.strongDisagreeLabel = 'Unsure or Disagree';
      this.milderFeelilngLabel = 'Agree';

      this.strongAgreeNum = this.scoreTotals["5"];
      this.milderFeelingNum = this.scoreTotals["4"];
      this.strongDisagreeNum = this.scoreTotals["1"] + this.scoreTotals["2"] + this.scoreTotals["3"];
    }

    else {
      
      this.strongAgreeLabel = 'Unsure or Agree';
      this.strongDisagreeLabel = 'Strongly Disagree';
      this.milderFeelilngLabel = 'Disagree';

      this.strongAgreeNum = this.scoreTotals["5"] + this.scoreTotals["4"] + this.scoreTotals["3"];
      this.milderFeelingNum = this.scoreTotals["2"];
      this.strongDisagreeNum = this.scoreTotals["1"];
    }
  }

  rotateText() {
    // Fade out
    this.displayRotatorObject.style.opacity = 0;
  
    setTimeout(() => {
      // Change text
      this.displayRotatorObject.textContent = "\"" + this.questionList[this.index] + "\"";
      // Fade in
      this.displayRotatorObject.style.opacity = 1;
  
      // Move to the next message
      this.index = (this.index + 1) % this.questionList.length;
    }, 500); // Matches CSS transition duration
  }

  createPieChart() {

    const ctx = this.pieChart.getContext('2d');
    const pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [this.strongDisagreeLabel, this.strongAgreeLabel, this.milderFeelilngLabel],
        datasets: [{
          label: 'My Pie Chart',
          data: [this.strongDisagreeNum, this.strongAgreeNum, this.milderFeelingNum],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: {
          animateScale: true
        }
      }
    });
  
    return pieChart;
  }
}

//const ctx = document.getElementById('myPieChart').getContext('2d');

//const myPieChart = createPieChart(80, 15,5, "myPieChart")

//const rotator = document.getElementById('text-rotator');
const messages = [
  "My therapist seemed warm, supportive, and concerned",
  "My therapist seemed trustworthy",
  "My therapist treated me with respect",
  "My therapist did a good job listening",
  "My therapist understood how I felt inside"
];

function processExcelData(excelData) {
  console.log(excelData);
  const toReturn = {};
  var currSectionBlock = {};

  var sectionName = excelData[1]["Unnamed: 0"];
  

  const questionData = excelData[1];
  const questionName = questionData[" "];

  currSectionBlock[questionName] = 
    {
      "1": questionData["1"],
      "2": questionData["2"],
      "3": questionData["3"],
      "4": questionData["4"],
      "5": questionData["5"],
    };

  var commentIndex = 0;
  for(var i = 2; i < excelData.length && sectionName !== "Open ended/ "; i++) {
    const nextSectionName = excelData[i]["Unnamed: 0"];
    
    if(nextSectionName !== "") {
      toReturn[sectionName] = currSectionBlock;
      
      currSectionBlock = {}
      sectionName = nextSectionName;
    }

    if(sectionName === "Open ended/ ") {
      commentIndex = i;
    }

    else {
      const questionData = excelData[i];
      const questionName = questionData[" "];
      
      if(questionData["1"] !== "" || questionData["N/A"] !== "") {
        currSectionBlock[questionName] = 
        {
          "1": questionData["1"],
          "2": questionData["2"],
          "3": questionData["3"],
          "4": questionData["4"],
          "5": questionData["5"],
        };
      }
    }
  }
  console.log(commentIndex);
  commentSection = {}
  sectionName = excelData[commentIndex][" "];
  currSectionBlock = [commentIndex["N/A"]];

  for(var i = commentIndex; i < excelData.length; i++) {

    const nextSectionName = excelData[i][" "];
    
    if(nextSectionName !== "") {

      commentSection[sectionName] = currSectionBlock;
      
      currSectionBlock = []
      sectionName = nextSectionName;
      
    }
    const comment = excelData[i]["N/A"];
    messageEndRegex = /[^a-zA-Z0-9\/&\s-]/;
    var message = comment.substring(0, comment.search(messageEndRegex)).trim();
    var num = parseInt(comment.substring(comment.indexOf("(") + 1, comment.indexOf(")")));

    if(message === "" && isNaN(num)) {

      message = "N/A";
      num = 0;
    }
    currSectionBlock.push({"comment": message, "tally": num});
  }

  commentSection[sectionName] = currSectionBlock;

  toReturn["Comments"] = commentSection;

  console.log(toReturn);
  
  return toReturn;
}

questionGroupReferences = [{},{},{},{},{},{},{}]

async function createQuestionGroups(data) {

  var i = 0
  for (const [key, value] of Object.entries(data)) {
    if(key === "Comments") {
      questionGroupReferences[i] = createCommentSection(data[key]["What did you like the best about the sessions/ process?"]);
    }
    else {
      
      questionGroupReferences[i] =  new QuestionGroup(key, value, "placeholder");
      i++;
    }
  }
}

async function getDataFromBackend() {
  var data = {}
  const dataUrl = "/api/get-excel-data";
  excelData = fetch(dataUrl)
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  return response.json()
                })
                .then(data => {
                  console.log(data);  // Handle the data from the API
                  createQuestionGroups(processExcelData(data));
                })
                .catch(error => {
                  console.error('There was a problem with the fetch operation:', error);
                  console.error('If open, try closing input_data.xlsx on the backend');
                });
}

getDataFromBackend();

let currentIndex = 0;
let intervalId = true;
var commentElement;
var rotatorElement;
var texts = []
// List of texts to rotate through
function createCommentSection(data) {
  console.log(data);
  texts = [];
  for(var i = 0; i < data.length; i++) {

    texts.push(data[i]["comment"]);
  }
  console.log("texts");
  console.log(texts);

  commentElement = document.getElementById('comment-template').content.cloneNode(true);
  rotatorElement = commentElement.querySelector('.rotator');
  document.getElementById('container').appendChild(commentElement);

  // Stop the rotation when clicked and let the user take control
  rotatorElement.addEventListener('click', function() {
    if (intervalId) {
        clearInterval(intervalId); // Stop the auto rotation
        intervalId = false;
    }
    changeText(); // Manually change text when clicked
  });
}

// Function to change the text
function changeText() {
    console.log("change!");
    currentIndex = (currentIndex + 1) % texts.length;
    rotatorElement.textContent = texts[currentIndex];
}

// Start automatic rotation
function startRotation() {
    
    intervalId = setInterval(changeText, 3000);
}



//used to manually enter info
document.getElementById('excel-file').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Read first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // header: 1 for array of arrays

    convertedJson = [];
    
    json.forEach(line => {
      toAdd = {};

      toAdd[1] = line[3] === undefined ? "": line[3];
      toAdd[2] = line[4] === undefined ? "": line[4];
      toAdd[3] = line[5] === undefined ? "": line[5];
      toAdd[4] = line[6] === undefined ? "": line[6];
      toAdd[5] = line[7] === undefined ? "": line[7];
      toAdd[ ' '] = line[1] === undefined ? "": line[1];
      toAdd["N/A"] = line[2] === undefined ? "": line[2];
      toAdd["Unnamed: 0"] = line[0] === undefined ? "": line[0];

      convertedJson.push(toAdd);
    });
    convertedJson.shift();
    

    lastElement = convertedJson[convertedJson.length - 1];
    
    while(lastElement[" "] === "" && lastElement[1] === "" && lastElement[2] === "" && lastElement[3] === "" &&
          lastElement[4] === "" && lastElement[5] === "" && lastElement["N/A"] === "" && lastElement["Unnamed: 0"] === "") {
      convertedJson.pop()
      lastElement = convertedJson[convertedJson.length - 1];
    }

    console.log(convertedJson);
    createQuestionGroups(processExcelData(convertedJson));
  };
  reader.readAsArrayBuffer(file);
});

// Start the rotation on page load
startRotation();