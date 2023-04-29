import * as fs from 'fs';
import { finish } from 'wow';

export const PAGE_HEADER = 
`<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js" integrity="sha512-+IpCthlNahOuERYUSnKFjzjdKXIbJ/7Dd6xvUp+7bEw0Jp2dg6tluyxLs+zq9BMzZgrLv8886T4cBSqnKiVgUw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css" integrity="sha512-cznfNokevSG7QPA5dZepud8taylLdvgr0lDqw/FEZIhluFsSwyvS81CMnRdrNSKwbsmc43LtRd2/WMQV+Z85AQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js" integrity="sha512-FHsFVKQ/T1KWJDGSbrUhTJyS1ph3eRrxI228ND0EGaEp6v4a/vGwPWd3Dtd/+9cI7ccofZvl/wulICEurHN1pg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<div id="chartPage" style = "width:80%; margin: auto;"></div>

<style>

body {
  margin: 0px;
  background-color: white;
}

* {
  font-family: verdana;
}

#root {
  margin: 0px;
}

#buttons {
  margin: 0px;
  padding: 10px;
  background-color: #243137;
}

.graph-title {
  text-align: center;
}

.graph-description {
  text-align: center;
}

.c3 {
  user-select: none;
}

.c3-grid line {
  stroke: rgb(231, 231, 231);
  stroke-dasharray: 0
}

.c3-axis text
{
  fill: rgb(109, 109, 109);
}

.c3-axis line {
  stroke: rgb(231, 231, 231);
}

.c3 path {
  display: none;
}

.button {
  margin: 10px;
  color: white;
  font-size: 17px;
  background:none;
  border:none;
  cursor: pointer;
}

#page {
  margin: 10px;
  display: grid;
  grid-template-columns: auto auto auto;
  /*background-color: #2196f3;*/
  padding: 10px;
}

.cell {
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(235, 235, 235);
  width: 400px;
  margin: 20px;
  padding: 40px;
  box-shadow: 0 1px 1px 0 rgb(0 0 0 / 10%), 0 1px 1px 0 rgb(0 0 0 / 19%) !important;
  background-color: white;
}

h5 {
  user-select: none;
}

p {
  font-size: 12px;
}

.header-text {
  user-select: none;
  text-align: center;
}

.graph {
}
</style>

<div id = 'root'>
  <div id = 'buttons'></div>
  <div id = 'main'>
    <div id = 'header'>
      <h2 id = 'title' class='header-text'></h2>
      <p id = 'description' class = 'header-text'></p>
    </div>
    <div id = 'page'></div>
  </div>
</div>

<script>

const cells = {}
const descriptions = {}

let curOpacity = 1
let curOp = 0;

function nameToID(name) {
  return name.replace(/[^a-zA-Z0-9]/gi, '');
}

function fade(dir) {
  return new Promise((res,rej) => {
    let op = ++curOp;
    let step = dir == 'IN' ? 0.1 : -0.1
    let goal = dir == 'IN' ? 1 : 0
    let overflow = dir == 'IN' ? ()=>(curOpacity>= 1 ? true : false) : ()=>curOpacity<=0 ? true : false
    var eff = setInterval(function () {
      if(curOp != op) {
        rej();
        clearInterval(eff);
        return;
      }
      curOpacity += step;
      let page = document.getElementById('main')
      page.style.opacity = curOpacity;
      if(overflow()) {
        page.style.opacity = goal
        clearInterval(eff);
        setTimeout(()=> res(), 100)
      }
    }, 10)
  })
}

function loadPage(name) {
  fade('OUT')
    .then(()=>{
      document.getElementById('title').textContent = name
      document.getElementById('description').textContent = descriptions[name]

      let page = document.getElementById('page')
      while(page.childNodes.length > 0) {
        page.childNodes.item(0).remove();
      }

      for(const {title,description,xdesc,ydesc,values} of cells[name]) {
        let cell = document.createElement('div')
        cell.classList.add('cell')

        let titleNode = document.createElement('h5')
        titleNode.textContent = title
        titleNode.classList.add('graph-title')

        let desc = document.createElement('p')
        desc.textContent = description
        desc.classList.add('graph-description')

        let graph = document.createElement('div')
        graph.id = nameToID(title)

        cell.appendChild(titleNode)
        cell.appendChild(graph)
        cell.appendChild(desc)

        document.getElementById('page').appendChild(cell)

        const xs = {}
        Object.values(values).forEach(x=>xs[x.name] = x.name+'_x')

        const columns = values
          .map(col=>({
            x: [col.name+'_x',...col.x],
            y: [col.name,...col.y],
          }))
          .reduce((p,c) => { p.push(c.x); p.push(c.y); return p},[])

        c3.generate({
          bindto: \`#\${nameToID(title)}\`,
          data: {xs,columns,type: 'scatter'},
          grid: {x: {show: true}, y: {show: true}},
          axis: {
            x: {
              label: xdesc,
              tick: { fit: false }
            },
            y: {
              label: ydesc,
              tick: { fit: false }
            }
          }
        })
      }
      return fade('IN')
    })
    .then(()=>{
    })
    .catch((err)=>{
      console.error(err);
    })
}

let firstPage = undefined
function page(name, description) {
  if(!firstPage) {
    firstPage = name
  }
  descriptions[name] = description
  let pageButton = document.createElement('button')
  pageButton.classList.add('button')
  pageButton.textContent = name
  pageButton.addEventListener('click',() => {
    loadPage(name)
  })
  buttons.appendChild(pageButton);
}

document.getElementById('page').style.opacity = 1;

function graph(page,title,description,xdesc,ydesc,values) {
  if(!cells[page]) {
    cells[page] = []
  }
  cells[page].push({title,description,xdesc,ydesc,values});
}

setTimeout(()=>loadPage(firstPage),1)
</script>
`;

export abstract class GraphDataBase  {
    abstract GetValues(): {x:number,y:number}[];
    abstract Add(val: {x: number, y: number} | {x: number, y: number}[]): void;
    label?: string
}

export class GraphDataAverage extends GraphDataBase {
    constructor(label: string) {
        super();
        this.label = label
    }

    GetValues(): { x: number; y: number; }[] {
        let values: {x:number,y:number}[] = []
        for(let [x,{total,count}] of Object.entries(this.values)) {
            values.push({x:parseInt(x),y:total/count})
        }
        return values;
    }

    values: {[x: number]: {total: number, count: number}} = {}
    label?: string;
    Add(val: {x: number, y: number} | {x: number, y: number}[]) {
        if(!Array.isArray(val)) {
            val = [val]
        }

        val.forEach(x=>{
            if(!this.values[x.x]) {
                this.values[x.x] = {total:0,count:1}
            }
            else
            {
                this.values[x.x].total+=x.y;
                this.values[x.x].count++;
            }
        })
    }
}

export class GraphData extends GraphDataBase {
    values: {x:number,y:number}[] = []
    label?: string

    GetValues(): { x: number; y: number; }[] {
        return this.values;
    }

    AddSplit(xvalues: number|number[], yvalues: number|number[]) {
        if(!Array.isArray(xvalues)) {
            xvalues = [xvalues]
        }
        if(!Array.isArray(yvalues)) {
            yvalues = [yvalues]
        }
        for(let i=0;i<xvalues.length; ++i) {
            this.values.push({x:xvalues[i],y:yvalues[i]})
        }
    }

    Add(values: {x: number, y: number}[] | {x: number, y: number}) {
        if(!Array.isArray(values)) {
            values = [values];
        }
        this.values = this.values.concat(values);
    }
}

export class Graph {
    data: GraphDataBase[] = []
    label?: string
    description?: string
    xlabel?: string;
    ylabel?: string

    Get<T extends GraphDataBase>(label: string) {
        return this.data.find(x=>x.label === label) as T
    }

    AddAverage(label: string) {
        let data = new GraphDataAverage(label)
        this.data.push(data);
        return data;
    }

    AddData(label: string, values?: {x: number, y: number}[] | {x: number, y: number}) {
        let data = new GraphData();
        data.label = label;
        if(values) {
            data.Add(values)
        }
        this.data.push(data);
        return data;
    }

    AddDataSplit(label: string, xvalues: number|number[], yvalues: number|number[]) {
        let data = new GraphData();
        data.label = label;
        data.AddSplit(xvalues,yvalues);
        this.data.push(data);
        return data;
    }
}

export class Page {
    graphs: Graph[] = []
    label?: string
    description?: string

    Get(label: string) {
        return this.graphs.find(x=>x.label === label);
    }

    AddGraph(label: string, description: string, xlabel?: string, ylabel?: string) {
        let graph = new Graph();
        graph.label = label;
        graph.description = description;
        graph.xlabel = xlabel;
        graph.ylabel = ylabel;
        this.graphs.push(graph);
        return graph;
    }
}

let pages: Page[] = []
export function CreatePage(name: string, description: string) {
    let page = new Page();
    page.label = name;
    page.description = description;
    pages.push(page);
    return page;
}

finish('plot',()=>{
    let text = PAGE_HEADER;
    text += `<script>\n`
    let graphCounter = 0;
    pages.forEach(({label,description,graphs},i)=>{
        let pageid = label || `Page ${i}`
        text += `page("${pageid}", "${description || ''}");\n`
        graphs.forEach((graph) => {
            text += `graph("${pageid}","${graph.label||`Graph ${graphCounter}`}", "${graph.description||''}","${graph.xlabel||'x'}", "${graph.ylabel||'y'}",[`
            graph.data.forEach((data) => {
                let values = data.GetValues();
                text+= `{name: "${data.label||'points'}", x:[${values.map(x=>x.x)}], y:[${values.map(x=>x.y)}]},`
            })
            text += "]);\n"
            graphCounter++;
        })
    })
    text += '</script>'
    fs.writeFileSync('./plots.html',text)
})