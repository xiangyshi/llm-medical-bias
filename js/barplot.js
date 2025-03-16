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
const dropdown = d3.select("#barIndividualDrop")
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

// Create an SVG container
const svgContainer = d3.select("#barIndividualChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Function to format title
function formatTitle(filename) {
    return filename.split("/")[1].split("_").join(" ").split(".")[0]
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to update the chart based on selected file
function updateChart(file) {
    d3.csv(file).then(data => {
        // Clear previous chart
        svgContainer.selectAll("*").remove();

        // Count "yes" and "no" responses per category
        const groupedData = d3.rollup(
            data,
            values => ({
                yes: values.filter(d => d["gpt3.5_answer"] === "Yes.").length,
                no: values.filter(d => d["gpt3.5_answer"] === "No.").length
            }),
            d => d["race"]
        );

        // Convert to an array for D3 processing
        const processedData = Array.from(groupedData, ([B, counts]) => ({ B, ...counts }));

        // Add title
        svgContainer.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", 30)
            .attr("class", "bar-container")
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
            .text("Number of Yes and No Responses by Race");

        const svg = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(processedData.map(d => d.B))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => Math.max(d.yes, d.no))])
            .nice()
            .range([height, 0]);

        // Subgroup scale for "yes" and "no"
        const subgroupScale = d3.scaleBand()
            .domain(["yes", "no"])
            .range([0, xScale.bandwidth()])
            .padding(0.05);

        // Colors for yes/no bars
        const colorScale = d3.scaleOrdinal()
            .domain(["yes", "no"])
            .range(["lightgreen", "coral"]);

        // Draw bars
        svg.selectAll("g")
            .data(processedData)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${xScale(d.B)}, 0)`)
            .selectAll("rect")
            .data(d => ["yes", "no"].map(key => ({ key, value: d[key] })))
            .enter()
            .append("rect")
            .attr("x", d => subgroupScale(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", subgroupScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", d => colorScale(d.key));

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
            .text("Number of Responses");

        // Legend
        const legend = svgContainer.append("g")
            .attr("transform", `translate(${width - 100}, ${margin.top - 50})`);

        legend.selectAll("rect")
            .data(["yes", "no"])
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => colorScale(d));

        legend.selectAll("text")
            .data(["yes", "no"])
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 12)
            .text(d => d)
            .style("font-size", "12px");

    }).catch(error => {
        console.error(`Error loading ${file}:`, error);
    });
}

// Load the first dataset initially
updateChart(files[0]);

// Create an SVG container for the summary chart
const summarySvg = d3.select("#barSummaryChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Function to process a single dataset
function processData(file) {
    return d3.csv(file).then(data => {
        const groupedData = d3.rollup(
            data,
            values => ({
                yes: values.filter(d => d["gpt3.5_answer"] === "Yes.").length,
                no: values.filter(d => d["gpt3.5_answer"] === "No.").length
            }),
            d => d["race"]
        );

        return Array.from(groupedData, ([B, counts]) => ({ B, ...counts }));
    });
}

// Function to load all datasets and create the summary plot
async function createSummaryPlot() {
    let combinedData = {};

    // Load and process each dataset
    for (const file of files) {
        const data = await processData(file);

        data.forEach(d => {
            if (!combinedData[d.B]) {
                combinedData[d.B] = { yes: 0, no: 0 };
            }
            combinedData[d.B].yes += d.yes;
            combinedData[d.B].no += d.no;
        });
    }

    // Convert to an array for D3
    const summaryData = Object.entries(combinedData).map(([B, counts]) => ({
        B,
        ...counts
    }));

    // Scales
    const xScale = d3.scaleBand()
        .domain(summaryData.map(d => d.B))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(summaryData, d => Math.max(d.yes, d.no))])
        .nice()
        .range([height, 0]);

    const subgroupScale = d3.scaleBand()
        .domain(["yes", "no"])
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    const colorScale = d3.scaleOrdinal()
        .domain(["yes", "no"])
        .range(["lightgreen", "coral"]);

    // Title
    summarySvg.append("text")
        .attr("x", width / 2)
        .attr("y", -90)
        .attr("class", "bar-container")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Summary of Responses Across All Categories");

    // Bars
    summarySvg.selectAll("g")
        .data(summaryData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xScale(d.B)}, 0)`)
        .selectAll("rect")
        .data(d => ["yes", "no"].map(key => ({ key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", d => subgroupScale(d.key))
        .attr("y", d => yScale(d.value))
        .attr("width", subgroupScale.bandwidth())
        .attr("height", d => height - yScale(d.value))
        .attr("fill", d => colorScale(d.key));

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
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Race");

    // Y-axis label
    summarySvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Total Responses");

    // Legend
    const legend = summarySvg.append("g")
        .attr("transform", `translate(${width - 100}, ${-margin.top / 2})`);

    legend.selectAll("rect")
        .data(["yes", "no"])
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    legend.selectAll("text")
        .data(["yes", "no"])
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => d)
        .style("font-size", "12px");
}

// Call the function to create the summary plot
createSummaryPlot();
