
// Like d3.timeFormat, but faster.
function parseDate(d) {
    return new Date(2001,
        d.substring(0, 2) - 1,
        d.substring(2, 4),
        d.substring(4, 6),
        d.substring(6, 8));
}

// Various formatters.
const formatNumber = d3.format(',d');

const formatChange = d3.format('+,d');
const formatDate = d3.timeFormat('%B %d, %Y');
const formatTime = d3.timeFormat('%I:%M %p');


d3.csv(XFILTER_PARAMS.data_file, (error, flights) => {
    if(error) { console.log(error); }

    // A little coercion, since the CSV is untyped.
    flights.forEach((d, i) => {
        d.index = i;
        d.date = parseDate(d.date);
        d.delay = +d.delay;
        d.distance = +d.distance;
    });

    create_crossfilter(flights);
})

function create_crossfilter(flights) {
    
    
        // Create the crossfilter for the relevant dimensions and groups.
        const flight = crossfilter(flights);
    
        const all = flight.groupAll();
        const date = flight.dimension(d => d.date);
        const dates = date.group(d3.timeDay);
        const hour = flight.dimension(d => d.date.getHours() + d.date.getMinutes() / 60);
        const hours = hour.group(Math.floor);
        const delay = flight.dimension(d => Math.max(-60, Math.min(149, d.delay)));
        const delays = delay.group(d => Math.floor(d / 10) * 10);
        const distance = flight.dimension(d => Math.min(1999, d.distance));
        const distances = distance.group(d => Math.floor(d / 50) * 50);
    
        const charts = [
    
            barChart()
            .dimension(hour)
            .group(hours)
            .x(d3.scaleLinear()
                .domain([0, 24])
                .rangeRound([0, 10 * 24])),
    
            barChart()
            .dimension(delay)
            .group(delays)
            .x(d3.scaleLinear()
                .domain([-60, 150])
                .rangeRound([0, 10 * 21])),
    
            barChart()
            .dimension(distance)
            .group(distances)
            .x(d3.scaleLinear()
                .domain([0, 2000])
                .rangeRound([0, 10 * 40])),
    
            barChart()
            .dimension(date)
            .group(dates)
            .round(d3.timeDay.round)
            .x(d3.scaleTime()
                .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
                .rangeRound([0, 10 * 90]))
            .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]),
    
        ];
    
        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        const chart = d3.selectAll('.chart')
            .data(charts);
    
        // Render the initial lists.
        const list = d3.selectAll('.list')
            .data([flightList]);
    
        // Render the total.
        d3.selectAll('#total')
            .text(formatNumber(flight.size()));
    
        renderAll();
    
        // Renders the specified chart or list.
        function render(method) {
            d3.select(this).call(method);
        }
    
        // Whenever the brush moves, re-rendering everything.
        function renderAll() {
            chart.each(render);
            list.each(render);
            d3.select('#active').text(formatNumber(all.value()));
        }
        
        window.filter = filters => {
            filters.forEach((d, i) => {
                charts[i].filter(d);
            });
            renderAll();
        };
    
        window.reset = i => {
            charts[i].filter(null);
            renderAll();
        };
    
        function flightList(div) {
            // Results List

            // Group by date
            const flightsByDate = d3.nest().key(d => d3.timeDay(d.date))
                // Limit to 40 results
                .entries(date.top(XFILTER_PARAMS.max_results));
    
            div.each(function() {
                const date = d3.select(this).selectAll('.date')
                    .data(flightsByDate, d => d.key);
    
                date.exit().remove();
    
                date.enter().append('div')
                    .attr('class', 'date')
                    .append('div')
                    .attr('class', 'day')
                    .text(d => formatDate(d.values[0].date))
                    .merge(date);
    
    
                const flight = date.order().selectAll('.flight')
                    .data(d => d.values, d => d.index);
    
                flight.exit().remove();
    
                const flightEnter = flight.enter().append('div')
                    .attr('class', 'flight');
    
                flightEnter.append('div')
                    .attr('class', 'time')
                    .text(d => formatTime(d.date));
    
                flightEnter.append('div')
                    .attr('class', 'origin')
                    .text(d => d.origin);
    
                flightEnter.append('div')
                    .attr('class', 'destination')
                    .text(d => d.destination);
    
                flightEnter.append('div')
                    .attr('class', 'distance')
                    .text(d => `${formatNumber(d.distance)} mi.`);
    
                flightEnter.append('div')
                    .attr('class', 'delay')
                    .classed('early', d => d.delay < 0)
                    .text(d => `${formatChange(d.delay)} min.`);
    
                flightEnter.merge(flight);
    
                flight.order();
            });
        }
}