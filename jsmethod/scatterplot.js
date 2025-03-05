import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
const files = [
    "data/acute_cancer_responses.csv",
    "data/acute_non_cancer_responses.csv",
    "data/chronic_cancer_responses.csv",
    "data/chronic_non_cancer_responses.csv",
    "data/post_op_responses.csv"
  ];
  
  // Set up dimensions for the charts
  const margin = {top: 120, right: 30, bottom: 50, left: 60},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

//Scatter Plot

  function drawScatterPlot(svgElement, rawData) {
    // Create an x-scale: use a band scale for categorical data (races)
    // Ensure the domain contains unique races from the data
    const xScale = d3.scaleBand()
      .domain(Array.from(new Set(rawData.map(d => d.race))))
      .range([0, width])
      .padding(0.3);

    // Create a y-scale for the numeric values
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(rawData, d => d["prob_gpt3.5_high"])])
      .nice()
      .range([height, 0]);

    // Append a group for the chart content translated by the margins
    const svg = svgElement.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Plot each data point as a circle; add a small random horizontal jitter
    svg.selectAll("circle")
      .data(rawData)
      .enter()
      .append("circle")
      .attr("cx", d => {
        // Calculate center of band and add jitter of up to ±(bandwidth/4)
        return xScale(d.race) + xScale.bandwidth() / 2 + (Math.random() - 0.5) * (xScale.bandwidth() / 2);
      })
      .attr("cy", d => yScale(d["prob_gpt3.5_high"]))
      .attr("r", 4)
      .attr("fill", "tomato");

    // Add the x-axis
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Add the y-axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .text("Race");

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .text("Probability");
  }

  // ==========================
  // 1. Individual File Scatter Plots
  // ==========================
  files.forEach(file => {
    d3.csv(file).then(data => {
      // Convert "prob_gpt3.5_yes" to a number using bracket notation
      data.forEach(d => {
        d["prob_gpt3.5_high"] = +d["prob_gpt3.5_high"];
      });

      // Create a container for this scatter plot and add a file title
      const container = d3.select("#scatterPlotContainer")
        .append("div")
        .attr("class", "chart-container");

      // Append an SVG for the scatter plot
      const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("overflow", "visible");  // Allow any overflow
      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(file)
      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 60)   // Adjust this value as needed
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Probability that Gpt3.5 Said High vs. Race");
      // Draw the scatter plot
      drawScatterPlot(svg, data);
    })
    .catch(error => {
      console.error(`Error loading ${file}:`, error);
    });
  });

  // ==========================
  // 2. Combined Scatter Plot
  // ==========================
  Promise.all(files.map(file => d3.csv(file)))
    .then(dataArrays => {
      // Merge all data arrays into one
      const combinedData = dataArrays.flat();

      // Convert "prob_gpt3.5_yes" to a number for all records
      combinedData.forEach(d => {
        d["prob_gpt3.5_high"] = +d["prob_gpt3.5_high"];
      });

      // Select the combined scatter plot SVG container and set dimensions
      const svgCombined = d3.select("#scatterPlotContainer")
      .append("div")
        .attr("class", "chart-container");
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        // .style("overflow", "visible");  // Allow any overflow
        const svg = svgCombined.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("overflow", "visible");  // Allow any overflow
      // Add title text
      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 30)   // Adjust this value as needed
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Combined Response From Gpt3.5");

      // Add subtitle text
      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 60)   // Adjust this value as needed
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Probability that Gpt3.5 Said High vs. Race");
      // Draw the combined scatter plot
      drawScatterPlot(svg, combinedData);
    })
    .catch(error => {
      console.error("Error loading combined data:", error);
    });