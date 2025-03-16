let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    // Prevent going back to the last slide from the first slide
    if (slideIndex === 1 && n < 0) return; // Prevent backward navigation from the first slide
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
} 
document.getElementById('saveButton').addEventListener('click', function() {
    const name = document.getElementById('nameInput').value;
    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    const race = document.getElementById('race').value;
    const medicalContext = document.getElementById('medicalContext').value;

    // Validation check for empty name and age
    if (!name || !age) {
        alert("Please fill in both the name and age fields.");
        return; // Stop further execution
    }

    // Update character description
    document.getElementById('characterDescription').innerText = 
        `Meet ${name}, a ${age}-year-old ${sex === 'Male' ? 'male' : 'female'} patient suffering from ${medicalContext}.`;

    // Change character body color based on sex
    const bodyColor = sex === 'Male' ? 'lightblue' : 'pink';
    document.querySelector('.body').style.backgroundColor = bodyColor;

    // Change hair color based on age
    const hairColor = age > 55 ? 'lightgrey' : '#8B4513'; // Default brown hair color

    const hairElements = document.querySelectorAll('.hair');
    hairElements.forEach(hairElement => {
        hairElement.style.backgroundColor = hairColor; // Set the hair color for each element
    });

    // New code to append hair strands for female patients
    if (sex === 'Female') {
        const hairStrand1 = document.createElement('div');
        hairStrand1.className = 'hair-strand';
        hairStrand1.style.position = 'absolute';
        hairStrand1.style.left = '22px'; // Adjust position as needed
        hairStrand1.style.top = '15px'; // Adjust position as needed
        hairStrand1.style.width = '10px';
        hairStrand1.style.height = '60px';
        hairStrand1.style.backgroundColor = hairColor;
        hairStrand1.style.borderTopLeftRadius = '10px'; // Round the top left corner
        hairStrand1.style.borderTopRightRadius = '10px'; // Round the top right corner

        const hairStrand2 = document.createElement('div');
        hairStrand2.className = 'hair-strand';
        hairStrand2.style.position = 'absolute';
        hairStrand2.style.right = '22px'; // Adjust position as needed
        hairStrand2.style.top = '15px'; // Adjust position as needed
        hairStrand2.style.width = '10px';
        hairStrand2.style.height = '60px';
        hairStrand2.style.backgroundColor = hairColor;
        hairStrand2.style.borderTopLeftRadius = '10px'; // Round the top left corner
        hairStrand2.style.borderTopRightRadius = '10px'; // Round the top right corner

        document.querySelector('.character').appendChild(hairStrand1);
        document.querySelector('.character').appendChild(hairStrand2);
    } else {
        const hairStrands = document.querySelectorAll('.hair-strand');
        hairStrands.forEach(strand => strand.remove());
    }
    const painData = [
        { level: 0, description: "No pain", image: "images/level0.jpg",
          scenarioHTML: "<p><strong>No pain at all.</strong> Imagine a perfect day when you feel completely at ease—no discomfort or interruptions, just pure comfort.</p>" },
        { level: 1, description: "Light pain: Mosquito bite", image: "images/level1.jpg",
          scenarioHTML: "<p><strong>Light pain.</strong> A brief sting from a mosquito bite that quickly fades away.</p>" },
        { level: 2, description: "Light pain: Small bruise", image: "images/level1.jpg",
          scenarioHTML: "<p><strong>Light pain.</strong> You accidentally bump your arm against a doorframe, leaving a small bruise that distracts you for a moment without interrupting your day.</p>" },
        { level: 3, description: "Light pain: Bruises from falling off a bike", image: "images/level1.jpg",
          scenarioHTML: "<p><strong>Light pain.</strong> You take a small tumble off your bike and end up with a few bruises. The pain is noticeable but doesn't affect your ability to continue with your day.</p>" },
        { level: 4, description: "Moderate pain: Noticeable ache", image: "images/level2.jpg",
          scenarioHTML: "<p><strong>Moderate pain.</strong> Imagine a steady, dull ache, like a mild headache that intermittently distracts you and slightly hampers your focus.</p>" },
        { level: 5, description: "Moderate pain: Persistent discomfort", image: "images/level2.jpg",
          scenarioHTML: "<p><strong>Moderate pain.</strong> Consider chronic joint pain that forces you to pause and stretch periodically, mildly interfering with your daily activities.</p>" },
        { level: 6, description: "Moderate pain: Disruptive pain", image: "images/level2.jpg",
          scenarioHTML: "<p><strong>Moderate pain.</strong> A flare-up in your lower back makes it difficult to sit or walk continuously, requiring you to frequently adjust your position.</p>" },
        { level: 7, description: "Severe pain: Intense and distracting", image: "images/level3.jpg",
          scenarioHTML: "<p><strong>Severe pain.</strong> Imagine a severe migraine with intense, pulsating pain that demands your full attention and forces you to rest, often requiring strong medication.</p>" },
        { level: 8, description: "severe pain with debilitating discomfort", image: "images/level3.jpg",
          scenarioHTML: "<p><strong>Severe pain.</strong> Picture the sharp, debilitating pain of kidney stones that makes even simple movements agonizing, greatly limiting your daily activities.</p>" },
        { level: 9, description: "Severe pain: Excruciating and overwhelming", image: "images/level3.jpg",
          scenarioHTML: "<p><strong>Severe pain.</strong> Think of the excruciating pain following a major surgery—so overwhelming that it confines you to bed, unable to manage even basic tasks without assistance.</p>" },
        { level: 10, description: "Worst pain possible: Giving birth", image: "images/level4.jpg",
          scenarioHTML: "<p><strong>Worst pain possible.</strong> The intense pain experienced during childbirth, often described as all-consuming and requiring immediate, intensive care.</p>" }
    ];
    d3.csv("data/response.csv").then(data => {
        // Function to get race and gender percentages
        function getAveragePercentages(selectedContext) {
            // Filter data by the selected medical context
            const filteredData = data.filter(d => d.context === selectedContext);
            console.log(filteredData);
            // Group by sex and calculate average percentages
            const sexGroups = d3.group(filteredData, d => d.gender);
            const sexAverages = {};
            console.log(sexGroups);
            sexGroups.forEach((values, key) => {
                const avgNo = d3.mean(values, d => +d.prob_gpt3_5_no) * 100; // Average for "No"
                sexAverages[key] = avgNo;
            });
            console.log(sexAverages);
    
            // Group by race and calculate average percentages
            const raceGroups = d3.group(filteredData, d => d.race);
            const raceAverages = {};
            console.log(raceGroups);
            raceGroups.forEach((values, key) => {
                const avgNo = d3.mean(values, d => +d.prob_gpt3_5_no) * 100; // Average for "No"
                raceAverages[key] = avgNo;
            });
            console.log(raceAverages);

            const confidence = d3.mean(filteredData, d => +d.prob_gpt3_5_yes) * 100; // Calculate average for "Yes"
            return {sexAverages, raceAverages, confidence};
        }
        const { sexAverages, raceAverages, confidence } = getAveragePercentages(medicalContext);
        updateLastSlide(name, race, raceAverages[race], sex, sexAverages[sex === "Male" ? "man" : "woman"], confidence, medicalContext, painData[8]["description"]);
    });
    
});

function updateLastSlide(name, race, racePercentage, sex, genderPercentage, confidencePercentage, medicalContext, painContext) {
    const lastSlide = document.querySelectorAll('.mySlides')[6];
    
    lastSlide.innerHTML = `
        <h2>Based on real data obtained from LLM, ${name} is denied medication:</h2>
        <p style="font-size: 24px;"><strong>${racePercentage.toFixed(2)}%</strong> of the time based on their race - <strong>${race}</strong>.</p>
        <p style="font-size: 24px;"><strong>${genderPercentage.toFixed(2)}%</strong> of the time based on their sex - <strong>${sex}</strong>.</p>
        <p style="font-size: 24px;">The AI has an <strong>${confidencePercentage.toFixed(2)}%</strong> average confidence when prescribing medication for <strong>${name}</strong>.</p>
        <p style="font-size: 24px;">Their <strong>${medicalContext}</strong> is often equivalent to <strong>${painContext}</strong>.</p>
    `;
}