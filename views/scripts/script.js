let dataBuffer = [];
const tickDuration = 1000; // ms

// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8080');

// Connection opened
socket.addEventListener('open', function (event) {
    // socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    const data = JSON.parse(event.data);
    dataBuffer.push(...data.readings.map(reading => reading.magnitude));
});


// Chart
var n = 60,
    random = d3.random.normal(0, .5),
    data = d3.range(n).map(() => 0)
    // data2 = d3.range(n).map(random);

var margin = { top: 20, right: 20, bottom: 20, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, n - 1])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 600])
    .range([height, 0]);

var line = d3.svg.line()
    .x(function (d, i) { return x(i); })
    .y(function (d, i) { return y(d); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"));

svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));

var path = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

tick();

function tick() {
    newValue = dataBuffer.reduce(avgReducer, 0);
    console.log('newValue', newValue);
    dataBuffer = [];



    // push a new data point onto the back
    data.push(newValue);
    

    // redraw the line, and slide it to the left
    path
        .attr("d", line)
        .attr("transform", null)
        .transition()
        .duration(tickDuration)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ",0)")
        .each("end", tick);

    // pop the old data point off the front
    data.shift();

}

function avgReducer(previousValue, currentValue, currentIndex, array) {
    let result = previousValue + currentValue;
    if (currentIndex === array.length - 1) {
        result = result / array.length;
    }
    return result;
}