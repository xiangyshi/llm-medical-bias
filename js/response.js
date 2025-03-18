// Define an array with pain levels, descriptions, image paths, and HTML-formatted scenarios
const painData = [
    {
        level: 0, description: "No pain", image: "images/level0.jpg",
        scenarioHTML: "<p><strong>No pain at all.</strong> Imagine a perfect day when you feel completely at ease—no discomfort or interruptions, just pure comfort.</p>"
    },
    {
        level: 1, description: "Light pain: Minor scratch", image: "images/level1.jpg",
        scenarioHTML: "<p><strong>Light pain.</strong> Picture a tiny scratch from brushing against a thorn—a brief, barely noticeable sting that quickly fades.</p>"
    },
    {
        level: 2, description: "Light pain: Small bruise", image: "images/level1.jpg",
        scenarioHTML: "<p><strong>Light pain.</strong> You accidentally bump your arm against a doorframe, leaving a small bruise that distracts you for a moment without interrupting your day.</p>"
    },
    {
        level: 3, description: "Light pain: Mild discomfort", image: "images/level1.jpg",
        scenarioHTML: "<p><strong>Light pain.</strong> After a long day, a mild discomfort in your back lingers—enough to remind you it's there but not enough to slow you down.</p>"
    },
    {
        level: 4, description: "Moderate pain: Noticeable ache", image: "images/level2.jpg",
        scenarioHTML: "<p><strong>Moderate pain.</strong> Imagine a steady, dull ache, like a mild headache that intermittently distracts you and slightly hampers your focus.</p>"
    },
    {
        level: 5, description: "Moderate pain: Persistent discomfort", image: "images/level2.jpg",
        scenarioHTML: "<p><strong>Moderate pain.</strong> Consider chronic joint pain that forces you to pause and stretch periodically, mildly interfering with your daily activities.</p>"
    },
    {
        level: 6, description: "Moderate pain: Disruptive pain", image: "images/level2.jpg",
        scenarioHTML: "<p><strong>Moderate pain.</strong> A flare-up in your lower back makes it difficult to sit or walk continuously, requiring you to frequently adjust your position.</p>"
    },
    {
        level: 7, description: "Severe pain: Intense and distracting", image: "images/level3.jpg",
        scenarioHTML: "<p><strong>Severe pain.</strong> Imagine a severe migraine with intense, pulsating pain that demands your full attention and forces you to rest, often requiring strong medication.</p>"
    },
    {
        level: 8, description: "Severe pain: Debilitating discomfort", image: "images/level3.jpg",
        scenarioHTML: "<p><strong>Severe pain.</strong> Picture the sharp, debilitating pain of kidney stones that makes even simple movements agonizing, greatly limiting your daily activities.</p>"
    },
    {
        level: 9, description: "Severe pain: Excruciating and overwhelming", image: "images/level3.jpg",
        scenarioHTML: "<p><strong>Severe pain.</strong> Think of the excruciating pain following a major surgery—so overwhelming that it confines you to bed, unable to manage even basic tasks without assistance.</p>"
    },
    {
        level: 10, description: "Worst pain possible: Unbearable agony", image: "images/level4.jpg",
        scenarioHTML: "<p><strong>Worst pain possible.</strong> In the event of a catastrophic injury, the pain becomes all-consuming, rendering you completely incapacitated and in need of immediate, intensive care.</p>"
    }
];

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
            .attr("viewBox", "0 0 400 300")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .classed("responsive-svg", true);

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

        // Add Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 100}, ${height - 100})`);

        const legendData = [
            { color: "#2ecc71", label: "Yes" },
            { color: "#e74c3c", label: "No" }
        ];

        const legendItem = legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(130, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.color);

        legendItem.append("text")
            .attr("x", 22)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(d => d.label)
            .style("font-size", "12px");

        

        // Load CSV and compute the average pain level for the current context.
        d3.csv("data/response.csv").then(csvData => {
            // Filter the CSV data to only include entries for the current context.
            const currentContext = filteredData.context;
            const contextData = csvData.filter(d => d.context === currentContext);

            // Compute the average pain level.
            const avgPain = d3.mean(contextData, d => +d.pain);

            // Append a div with class "real-world" below the SVG container.
            // Here we assume the svg is wrapped in a container so we can append the div as a sibling.
            d3.select("#radial-section").select(".real-world").remove();

            // Append a new .real-world div with the updated content
            d3.select("#radial-section")
                .append("div")
                .attr("class", "real-world")
                .html(`
                    <p>Real-world average pain level for <strong>${currentContext}</strong>: ${avgPain.toFixed(2)}</p>
                `);
        });
    }


    function updateHeatmap(data) {
        const svg = d3.select("#heatmap");
        svg.selectAll("*").remove();

        const container = document.querySelector(".heatmap-section");
        if (!container) {
            console.error("Error: .heatmap_section not found!");
            return;
        }

        const margin = { top: 50, right: 50, bottom: 100, left: 150 };
        const width = 1200 - margin.left - margin.right;
        const height = 800 - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 1200 800`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .classed("responsive-svg", true);

        const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

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
            .attr("y", 780)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Race & Gender");

        svg.append("text")
            .attr("x", -height / 2 - margin.top)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "16px")
            .text("Medical Context");
    //     // Add Legend

    //     const legendWidth = 300; // Ensure it fits within the SVG width
    // const legendHeight = 20;

    // // Append a group for the legend, positioning it below the heatmap
    // const legend = svg.append("g")
    //     .attr("transform", `translate(${width - legendWidth}, ${margin.top})`); // Adjusted position

    // // Define a horizontal scale for the legend
    // const legendScale = d3.scaleLinear()
    //     .domain([
    //         d3.min(data, d => d.prob_gpt3_5_high - d.prob_gpt3_5_low), 
    //         d3.max(data, d => d.prob_gpt3_5_high - d.prob_gpt3_5_low)
    //     ])
    //     .range([0, legendWidth]);  // Horizontal legend

    // // Create a bottom axis for the legend
    // const legendAxis = d3.axisBottom(legendScale)
    //     .ticks(5)
    //     .tickFormat(d3.format(".2f"));

    // // Append a gradient for the legend
    // const defs = svg.append("defs");
    // const gradient = defs.append("linearGradient")
    //     .attr("id", "legend-gradient")
    //     .attr("x1", "0%").attr("y1", "0%")
    //     .attr("x2", "100%").attr("y2", "0%");

    // gradient.selectAll("stop")
    //     .data(d3.range(0, 1.01, 0.1))
    //     .enter().append("stop")
    //     .attr("offset", d => `${d * 100}%`)
    //     .attr("stop-color", d => colorScale(d));

    // legend.append("text")
    //     .attr("x", legendWidth / 2)
    //     .attr("y", -10)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "14px")
    //     .style("font-weight", "bold")
    //     .text("Uncertainty Score (High - Low)");

    // legend.append("rect")
    //     .attr("x", 0)
    //     .attr("y", -legendHeight)
    //     .attr("width", legendWidth)
    //     .attr("height", legendHeight)
    //     .style("fill", "url(#legend-gradient)");

    // // Append the axis below the color bar
    // legend.append("g")
    //     .attr("transform", `translate(0, 0)`) // Align axis with the legend bar
    //     .call(legendAxis);
    //Done
}

    updateVisualization();

window.addEventListener("resize", () => {
    updateVisualization();
});
});