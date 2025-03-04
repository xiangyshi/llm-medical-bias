d3.csv("data/response.csv").then(data => {
    const contexts = [...new Set(data.map(d => d.context))];
    const races = [...new Set(data.map(d => d.race))];
    const genders = [...new Set(data.map(d => d.gender))];

    function populateDropdown(id, options) {
        const select = d3.select(`#${id}`);
        options.forEach(option => select.append("option").text(option).attr("value", option));
    }

    populateDropdown("context", contexts);
    populateDropdown("race", races);
    populateDropdown("gender", genders);

    d3.selectAll("select").on("mouseover", function (event) {
        const tooltipText = {
            "context": "📍 Choose a medical scenario AI is analyzing.",
            "race": "🌎 Select a racial group to see AI's decision patterns.",
            "gender": "⚧️ Select a gender to explore AI's uncertainty."
        };
    
        d3.select(".tooltip")
            .style("display", "block")
            .html(tooltipText[this.id])
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }).on("mouseout", function () {
        d3.select(".tooltip").style("display", "none");
    });
    
    d3.selectAll("select").on("change", updateVisualization);

    function updateVisualization() {
        const context = d3.select("#context").property("value");
        const race = d3.select("#race").property("value");
        const gender = d3.select("#gender").property("value");

        const filteredData = data.find(d => d.context === context && d.race === race && d.gender === gender);

        updateRadialChart("#radialChart1", filteredData, "prob_gpt3_5_yes", "prob_gpt3_5_no", ["Yes", "No"]);
        updateRadialChart("#radialChart2", filteredData, "prob_gpt3_5_high", "prob_gpt3_5_low", ["High", "Low"]);
        updateHeatmap(data);
    }

    function updateRadialChart(svgId, filteredData, prob1Key, prob2Key, labels) {
        const svg = d3.select(svgId)
            .attr("viewBox", "0 0 400 400")  // Ensures automatic scaling
            .attr("preserveAspectRatio", "xMidYMid meet")  // Keeps proportions
            .classed("responsive-svg", true);  // Adds a class for CSS styling

        svg.selectAll("*").remove();

        const width = 300, height = 300, radius = Math.min(width, height) / 2;
        const arc = d3.arc().innerRadius(50).outerRadius(radius);
        const pie = d3.pie().value(d => d.value);

        const data = [
            { label: labels[0], value: filteredData[prob1Key] },
            { label: labels[1], value: filteredData[prob2Key] }
        ];

        const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

        const paths = g.selectAll("path")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => i === 0 ? "#2ecc71" : "#e74c3c")
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                let tooltipText = "";
                if (svgId === "#radialChart1") {
                    tooltipText = d.data.label === "Yes"
                        ? `${filteredData.race} ${filteredData.gender} with ${filteredData.context} are approved medication ${(filteredData[prob1Key] * 100).toFixed(2)}% of the time.`
                        : `${filteredData.race} ${filteredData.gender} with ${filteredData.context} are denied medication ${(filteredData[prob2Key] * 100).toFixed(2)}% of the time.`;
                } else {
                    tooltipText = d.data.label === "High"
                        ? `${filteredData.race} ${filteredData.gender} with ${filteredData.context} are prescribed high dosage of medication ${(filteredData[prob1Key] * 100).toFixed(2)}% of the time.`
                        : `${filteredData.race} ${filteredData.gender} with ${filteredData.context} are prescribed low dosage of medication ${(filteredData[prob2Key] * 100).toFixed(2)}% of the time.`;
                }

                d3.select(".tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(tooltipText);
            })
            .on("mouseout", () => d3.select(".tooltip").style("display", "none"));

        paths.transition()
            .duration(800)
            .attrTween("d", function (d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function (t) {
                    return arc(i(t));
                };
            });
    }

    function updateHeatmap(data) {
        const svg = d3.select("#heatmap");
        svg.selectAll("*").remove();

        // Ensure container exists before getting dimensions
        const container = document.querySelector(".heatmap-section");
        if (!container) {
            console.error("Error: .heatmap_section not found!");
            return;
        }

        const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

        const margin = { top: 50, right: 50, bottom: 100, left: 150 }; // More space for y-axis
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .domain([...new Set(data.map(d => d.race + " " + d.gender))])
            .range([0, width])
            .padding(0);

        const y = d3.scaleBand()
            .domain([...new Set(data.map(d => d.context))])
            .range([0, height])
            .padding(0);

        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([d3.min(data, d => d.prob_gpt3_5_high - d.prob_gpt3_5_low), 
                d3.max(data, d => d.prob_gpt3_5_high - d.prob_gpt3_5_low)]);

        svg.attr("width", containerWidth)
            .attr("height", containerHeight);

        const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.race + " " + d.gender))
            .attr("y", d => y(d.context))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.prob_gpt3_5_high - d.prob_gpt3_5_low))
            .attr("rx", 5)
            .attr("ry", 5)
            .on("mouseover", function (event, d) {
                d3.select(".tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(
                        `Context: ${d.context}<br>
                         Race: ${d.race}<br>
                         Gender: ${d.gender}<br>
                         Uncertainty: ${(d.prob_gpt3_5_high - d.prob_gpt3_5_low).toFixed(2)}`
                    );
            })
            .on("mouseout", () => d3.select(".tooltip").style("display", "none"));

        // Add Axes
        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px");

        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "12px");

        // Axis Labels
        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", containerHeight - 40) // Move x-axis label higher
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Race & Gender");

        svg.append("text")
            .attr("x", -height / 2 - margin.top)
            .attr("y", 15) // Move y-axis label further left
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "16px")
            .text("Medical Context");
    }


    updateVisualization();
});
