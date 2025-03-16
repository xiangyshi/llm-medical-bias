import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const files = [
    "data/acute_cancer_responses.csv",
    "data/acute_non_cancer_responses.csv",
    "data/chronic_cancer_responses.csv",
    "data/chronic_non_cancer_responses.csv",
    "data/post_op_responses.csv"
];

// Set up dimensions
const margin = { top: 120, right: 30, bottom: 50, left: 60 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Create a dropdown menu
const dropdown = d3.select("#scatterIndividualDrop")
    .append("select")
    .attr("id", "fileSelector")
    .on("change", function() {
        updateChart(this.value);
    });

// Populate dropdown options
dropdown.selectAll("option")
    .data(files)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => formatTitle(d));

// Create an SVG container for the scatter plot
const svgContainer = d3.select("#scatterIndividualChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Function to format title
function formatTitle(filename) {
    return filename.split("/")[1].split("_").join(" ").split(".")[0]
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to update the scatter plot based on selected file
function updateChart(file) {
    d3.csv(file).then(data => {
        // Clear previous chart
        svgContainer.selectAll("*").remove();

        // Set the x and y scales (e.g., "race" and "gpt3.5_answer")
        const xScale = d3.scaleBand()
            .domain(data.map(d => d["race"]))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => parseFloat(d["prob_gpt3.5_yes"]))])
            .nice()
            .range([height, 0]);

        // Add title
        svgContainer.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", 30)
            .attr("class", "scatter-container")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text(formatTitle(file));

        // Subtitle
        svgContainer.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", 55)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Scatter Plot of Response Confidence by Race");

        const svg = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scatter plot circles
        svg.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", d => xScale(d["race"]) + xScale.bandwidth() / 2)
          .attr("cy", d => yScale(d["prob_gpt3.5_yes"]))
          .attr("r", 5)
          .attr("fill", "steelblue");


        // X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // X-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .text("Race");

        // Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .text("Response Confidence");

        // Legend
        const legend = svgContainer.append("g")
            .attr("transform", `translate(${width - 100}, ${margin.top - 50})`);

        legend.selectAll("rect")
            .data(["prob_gpt3.5_yes"])
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "steelblue");

        legend.selectAll("text")
            .data(["prob_gpt3.5_yes"])
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d => "Response Confidence")
            .style("font-size", "12px");

    }).catch(error => {
        console.error(`Error loading ${file}:`, error);
    });
}

// Load the first dataset initially
updateChart(files[0]);

// Function to process the data for summary plot
async function createSummaryPlot() {
    let combinedData = {};

    // Load and process each dataset
    for (const file of files) {
        const data = await d3.csv(file);

        data.forEach(d => {
            if (!combinedData[d["race"]]) {
                combinedData[d["race"]] = { response_time: 0, count: 0 };
            }
            combinedData[d["race"]].response_time += parseFloat(d["prob_gpt3.5_yes"]);
            combinedData[d["race"]].count += 1;
        });
    }

    // Convert to an array for D3
    const summaryData = Object.entries(combinedData).map(([race, values]) => ({
        race,
        avg_response_time: values.response_time / values.count
    }));

    // Create summary scatter plot
    const summarySvg = d3.select("#scatterSummaryChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(summaryData.map(d => d.race))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(summaryData, d => d.avg_response_time)])
        .nice()
        .range([height, 0]);

    // Title
    summarySvg.append("text")
        .attr("x", width / 2)
        .attr("y", -90)
        .attr("class", "scatter-container")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Average Response Confidence Across All Race");

    // Scatter plot circles in summary plot
    summarySvg.selectAll("circle")
        .data(summaryData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.race) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.avg_response_time))
        .attr("r", 5)
        .attr("fill", "steelblue");

    // X-axis
    summarySvg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Y-axis
    summarySvg.append("g")
        .call(d3.axisLeft(yScale));

    // X-axis label
    summarySvg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Race");

    // Y-axis label
    summarySvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Average Response Confidence");
}

// Call the function to create the summary plot
createSummaryPlot();
