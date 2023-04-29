import { CreatePage } from "./plots";

const page = CreatePage('My Page','Example Page')
let graph = page.AddGraph('My Graph','Example Graph','Example X','ExampleY')
let plot = graph.AddPlot('My Plot')
plot.AddData([{x:0,y:1},{x:1,y:1},{x:2,y:2},{x:3,y:3},{x:4,y:4}])