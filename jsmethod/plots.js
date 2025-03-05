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
  
  files.forEach(file => {
    // Load each CSV file
    d3.csv(file).then(data => {
      // Convert "prob_gpt3.5_yes" to a number (using bracket notation because of the dot in the column name)
      data.forEach(d => {
        d["prob_gpt3.5_yes"] = +d["prob_gpt3.5_yes"];
      });
      
      // Group data by column "B" and calculate the median of "prob_gpt3.5_yes" for each group
      const groupedData = d3.rollup(
        data,
        values => d3.mean(values, d => d["prob_gpt3.5_yes"]),
        d => d["race"]
      );
      
      // Convert grouped data to an array format for D3 processing
      const processedData = Array.from(groupedData, ([B, median]) => ({ B, median }));
      
      // Create a container for the chart
      const container = d3.select("body")
        .append("div")
        .attr("class", "chart-container");
      
      
      // Create an SVG for the chart
      const svgcontainer = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

      svgcontainer.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(file);
  
      // Add the subtitle
      svgcontainer.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Probability that Gpt3.5 Said Yes vs Race");
      const svg = svgcontainer.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      // Create scales
      const xScale = d3.scaleBand()
        .domain(processedData.map(d => d.B))
        .range([0, width])
        .padding(0.2);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.median)])
        .nice()
        .range([height, 0]);
      
      // Draw bars
      svg.selectAll("rect")
        .data(processedData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.B))
        .attr("y", d => yScale(d.median))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.median))
        .attr("fill", "steelblue");
      
      // Add X-axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
      
      // Add Y-axis
      svg.append("g")
        .call(d3.axisLeft(yScale));
      
      // Add X-axis label
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Race");
      
      // Add Y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Probability");
      
    }).catch(error => {
      console.error(`Error loading ${file}:`, error);
    });
  });

  Promise.all(files.map(file => d3.csv(file)))
  .then(dataArrays => {
    // Combine all CSV data arrays into a single array
    const combinedData = dataArrays.flat();

    // Convert "prob_gpt3.5_yes" to numeric values using bracket notation
    combinedData.forEach(d => {
      d["prob_gpt3.5_yes"] = +d["prob_gpt3.5_yes"];
    });

    // Group combined data by column "B" (e.g., race) and compute the median of "prob_gpt3.5_yes"
    const groupedData = d3.rollup(
      combinedData,
      values => d3.mean(values, d => d["prob_gpt3.5_yes"]),
      d => d["race"]
    );

    // Convert the grouped data into an array suitable for D3
    const processedData = Array.from(groupedData, ([B, mean]) => ({ B, mean }));

    // Create the SVG container for the combined chart
    const svgContainer = d3.select("#combinedChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    // Add the title
    svgContainer.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Combined Data Bar Plot Title");

    // Add the subtitle
    svgContainer.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Subtitle describing the plot or dataset");

    // Append the chart group with a translation to account for margins and title space
    const svg = svgContainer.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    // Set up scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.B))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.mean)])
      .nice()
      .range([height, 0]);

    // Draw bars for each category
    svg.selectAll("rect")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.B))
      .attr("y", d => yScale(d.mean))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.mean))
      .attr("fill", "steelblue");

    // Add the X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Add the Y-axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .text("Race");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .text("Probability");

  })
  .catch(error => {
    console.error("Error loading files:", error);
  });