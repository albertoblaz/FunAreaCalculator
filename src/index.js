// Author: Alberto Blazquez <hola@albertoblazquez.net>

import $ from 'jquery'

/*** Utils ***/

/*
 * Runs a function 'fn', which returns a promise, a certain amount of 'num' times
 * @signature Num b :: () -> a -> b -> Promise c
 */
const doTimes = (fn, num) =>
  '0'.repeat(num).split('').map(fn)
  // '0'.repeat(num).split('').map((_, index) => fn())

/*
 * Formulae
 * Pure functions that calculate areas for our shapes
 * @signature {areaSquare|areaCircle} Num a :: a -> a
 * @signature {areaRectangle|areaEllipsis} Num a :: a -> a -> a
 */
const areaSquare = (base) => base ** 2
const areaRectangle = (base, height) => base * height
const areaCircle = (radius) => Math.PI * radius ** 2
const areaEllipsis = (a, b) => Math.PI * a * b

/*
 * API
 * Impure functions that fetch distances
 * Returns a promise with a random distance that gets resolved after a random delay
 * @signature Num a :: () -> Promise a
 */
const genRandomDistance = () => Math.floor(Math.random() * 4 + 1)
const genRandomDelay = () => Math.floor(Math.random() * 1800 + 200)
const getDistanceAPI = () =>
  new Promise((resolve) =>
    setTimeout(() => { resolve(genRandomDistance()) }, genRandomDelay()))

/*
 * Impure function that returns as many distances as dimensions given
 * @signature Int a, Float b :: a -> [b] -> b -> Promise b
 */
const shape = (dimensions, calculateArea) =>
  Promise.all(
    doTimes(getDistanceAPI, dimensions)
  ).then((distances) => calculateArea(...distances))

const square = () => shape(1, areaSquare)
const circle = () => shape(1, areaCircle)
const rectangle = () => shape(2, areaRectangle)
const ellipsis = () => shape(2, areaEllipsis)

/*** Pure Functional Components ***/

/*
 * Row component that renders a table row
 * @signature Float a, String b, Int c :: b -> a -> a -> c -> b
 */
const Row = (name, area, medianArea, times) =>
  `<tr>
    <td>${name}</td>
    <td>${medianArea.toFixed(2)}</td>
    <td>${area.toFixed(2)}</td>
    <td>${times}</td>
  </tr>`


/* Table component that renders a table
 * @signature String b :: [a] -> b
 */
const Table = (data) =>
  `<table>
    <thead>
      <tr>
        <th>Shape</th>
        <th>Median Area</th>
        <th>Latest Area</th>
        <th># Area Calculations</th>
      </tr>
    </thead>
    <tbody>${data.map((props) => Row(...props))}</tbody>
  </table>`


/* App component that renders tabular data and a button to re-render
 * @signature String b :: [a] -> b
 */
const App = (data) =>
  Table(data)
  // `${Table(data)}
  // <button id="click" onclick=reRender>Click Me!</button>`

/*** Render Engine  ***/

const medians = () => {
  const reg = {
    square: [],
    circle: [],
    rectangle: [],
    ellipsis: [],
  }

  return (shapeName, area) => {
    const arr = reg[shapeName]
    arr.push(area)
    arr.sort()
    const medianIndex = arr.length === 1 ? 0 : Math.round(arr.length / 2)
    return arr[medianIndex]
  }
}

/*
 * Function that fetches and formats data from our API for each given shape
 * Returns formatted data ready to be passed to components
 * @signature Shape s, Num n :: [s] -> Promise [n]
 */
const fetchData = (shapes) =>
  Promise.all(shapes.map((s) => s())).then((areas) =>
    areas.map((area, index) => [
      shapes[index].name,
      area,
      calculateMedian(shapes[index].name, area),
      TIMES
    ]))

/*
 * Returns a function that will replace the current DOM with a new rendered component
 * The function will inject fetched data from the API to this custom component
 * @signature Array a, Component c, DOMElement d :: a -> c -> [d]
 */
const mapDataToApp = (data) =>
  (appComponent) => DOM.html('').append(appComponent(data))

/* Main function */
const reRender = () => {
  DOM.html('Loading...')
  TIMES++
  fetchData([square, rectangle, circle, ellipsis])
    .then(mapDataToApp)
    .then((render) => render(App))
}

/*** Init ***/

let TIMES = 0
const DOM = $('#app')
const calculateMedian = medians()
DOM.html('Welcome! Click the button below to calculate areas')

$('#click').on('click', reRender)
reRender()
