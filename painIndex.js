// painIndex.js
// Make sure D3.js and d3-simple-slider are included in your HTML before this script.
document.addEventListener("DOMContentLoaded", function () {
  // Set dimensions for the SVG container
  const width = 1200;
  const height = 450;

  // Create an SVG canvas in the .pain_index container and add a CSS class for responsiveness
  const svg = d3.select(".pain_index")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "responsive-svg");

  // Define an array with pain levels, descriptions, image paths, and HTML-formatted scenarios
  const painData = [
    { level: 0, description: "No pain", image: "images/level0.jpg",
      scenarioHTML: "<p><strong>No pain at all.</strong> You feel completely comfortable; nothing hinders your activities.</p>" },
    { level: 1, description: "Light pain: Minor scratch", image: "images/level1.jpg",
      scenarioHTML: "<p><strong>Light pain.</strong> It feels like a tiny scratch—barely noticeable during your day.</p>" },
    { level: 2, description: "Light pain: Small bruise", image: "images/level1.jpg",
      scenarioHTML: "<p><strong>Light pain.</strong> A small bruise may distract you momentarily, but it doesn't affect your routine.</p>" },
    { level: 3, description: "Light pain: Mild discomfort", image: "images/level1.jpg",
      scenarioHTML: "<p><strong>Light pain.</strong> Mild discomfort that occasionally makes you aware of it, but you continue with daily tasks.</p>" },
    { level: 4, description: "Moderate pain: Noticeable ache", image: "images/level2.jpg",
      scenarioHTML: "<p><strong>Moderate pain.</strong> A noticeable ache, similar to a mild headache, that might slow you down at times.</p>" },
    { level: 5, description: "Moderate pain: Persistent discomfort", image: "images/level2.jpg",
      scenarioHTML: "<p><strong>Moderate pain.</strong> Persistent discomfort forces you to take occasional breaks during the day.</p>" },
    { level: 6, description: "Moderate pain: Disruptive pain", image: "images/level2.jpg",
      scenarioHTML: "<p><strong>Moderate pain.</strong> The pain is disruptive, making it hard to concentrate and limiting physical activity.</p>" },
    { level: 7, description: "Severe pain: Intense and distracting", image: "images/level3.jpg",
      scenarioHTML: "<p><strong>Severe pain.</strong> Intense pain distracts you significantly; you may need strong pain relievers and frequent rest.</p>" },
    { level: 8, description: "Severe pain: Debilitating discomfort", image: "images/level3.jpg",
      scenarioHTML: "<p><strong>Severe pain.</strong> Debilitating discomfort greatly limits your work, social life, and daily tasks.</p>" },
    { level: 9, description: "Severe pain: Excruciating and overwhelming", image: "images/level3.jpg",
      scenarioHTML: "<p><strong>Severe pain.</strong> Excruciating, overwhelming pain forces you to cancel plans and rest completely.</p>" },
    { level: 10, description: "Worst pain possible: Unbearable agony", image: "images/level4.jpg",
      scenarioHTML: "<p><strong>Worst pain possible.</strong> Unbearable agony incapacitates you, making it impossible to function normally.</p>" }
  ];

  // Append a text element for the pain description (positioned at the top of the SVG)
  const painDescription = svg.append("text")
    .attr("x", 50)
    .attr("y", 50)
    .attr("font-size", "20px")
    .attr("fill", "#333")
    .attr("class", "pain_description");

  // Append a group for the pain image so that it can be centered easily
  const imageGroup = svg.append("g")
    .attr("class", "image-group")
    .attr("transform", `translate(${width / 2}, 150)`);

  const painImage = imageGroup.append("image")
    .attr("width", 140)
    .attr("height", 160)
    // Center the image by translating -width/2 and -height/2
    .attr("x", -70)
    .attr("y", -80)
    .attr("href", "images/level0.jpg")
    .attr("class", "pain_image");

  // Append an SVG foreignObject for the narrative (to include HTML formatted content)
  const narrativeFO = svg.append("foreignObject")
    .attr("class", "narrative")
    .attr("x", 150)   // Centered with width=600
    .attr("y", height / 2 + 30)   // Just below the image (imageGroup center is at height/2; image height is 160)
    .attr("width", 600)
    .attr("height", 100);

  // Insert HTML content into the foreignObject using an XHTML div element.
  narrativeFO.append("xhtml:div")
    .html("<p><strong>Scenario:</strong> Use the slider below to see how different pain levels affect your daily life.</p>");

  // Function to update the description, image, and narrative scenario based on the selected pain level
  function updatePainVisualization(val) {
    const painLevel = painData.find(d => d.level === val);
    if (painLevel) {
      painDescription.text(`Level ${painLevel.level} - ${painLevel.description}`);
      painImage.attr("href", painLevel.image);
      // Update the narrative content inside the foreignObject
      narrativeFO.select("div").html(painLevel.scenarioHTML);
    }
  }

  // Create a horizontal slider using d3-simple-slider
  const slider = d3.sliderBottom()
    .min(0)
    .max(10)
    .step(1)
    .width(600)
    .displayValue(true)
    .on("onchange", val => updatePainVisualization(val));

  // Append the slider to the SVG (positioned near the bottom) and add a custom CSS class
  const gSlider = svg.append("g")
    .attr("class", "slider-container")
    .attr("transform", `translate(${width / 2 - 300}, 400)`)
    .call(slider);

  // OPTIONAL: Create an SVG linear gradient for the slider track (green to red)
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "sliderGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "green");
  
  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "yellow");
  
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "red");
  
  // Apply the gradient to the slider track.
  // d3-simple-slider creates a line with the class "track"
  gSlider.select(".track")
    .attr("stroke", "url(#sliderGradient)")
    .attr("stroke-width", "6px");

  // OPTIONAL: Add a tooltip for additional interactivity on the slider handle
  const tooltip = d3.select(".pain_index")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#f8f8f8")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px");

  gSlider.selectAll(".parameter-value")
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
             .text(`Pain Level: ${slider.value()}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY - 10) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

  // Initialize visualization with pain level 0
  updatePainVisualization(0);
});
