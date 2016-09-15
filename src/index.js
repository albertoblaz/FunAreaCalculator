// Author: Alberto Blazquez <hola@albertoblazquez.net>

import $ from 'jquery'
const styles = require('../css/styles.css')

/*** Utils ***/

/*
 * Runs a function 'fn', which returns a promise, a certain amount of 'num' times
 * @signature Num b :: () -> a -> b -> Promise c
 */
const doTimes = (fn, num) =>
  '0'.repeat(num).split('').map(fn)

/*
 * Returns a 2-digit float point version of a given number
 * @signature Num a :: a -> a
 */
const toFloat2 = (num) => parseFloat(num.toFixed(2))

/*
 * Returns a capitalised version of a given string
 * @signature Str a :: a -> a
 */
const capitalize = (str) =>
  `${str[0].toUpperCase()}${str.slice(1, str.length)}`

/*
 * Log median and all areas for a particular shape
 * @signature Str a, Float b, Int c :: a -> [b] -> c -> ()
 */
const logMedians = (shapeName, median, areas) => {
  console.log(shapeName, ' - Median area: ', toFloat2(median))
  console.log(shapeName, ' - All areas: ', areas.map(toFloat2))
}

/*
 * Memoize an object with all calculated areas (object of { shapename - array })
 * Returns a function that will return the median value for a particular shape
 */
const medians = (map) =>
  (shapeName, area) => {
    const arr = map[shapeName]
    arr.push(area)
    arr.sort((a, b) => a - b) // Trick to sort float point numbers in JS
    const medianIndex = arr.length === 1 ? 0 : Math.round(arr.length / 2) - 1

    logMedians(shapeName, arr[medianIndex], arr)
    return arr[medianIndex]
  }

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
  `<tr class="${styles.row}">
    <td class="${styles.row__shapename}">${capitalize(name)}</td>
    <td>${medianArea.toFixed(2)}</td>
    <td>${area.toFixed(2)}</td>
    <td>${times}</td>
  </tr>`

/* Table component that renders a table
 * @signature String b :: [a] -> b
 */
const Table = (data) =>
  `<table class="${styles.table}">
    <thead>
      <tr>
        <th class="${styles.column}">Shape Name</th>
        <th class="${styles.column}">Median Area</th>
        <th class="${styles.column}">Latest Area</th>
        <th class="${styles.column}"># Area Calculations</th>
      </tr>
    </thead>
    <tbody>${data.map((props) => Row(...props)).join('')}</tbody>
  </table>`

/*
 * Renders a message based on the number of times the app has re-rendered
 * @signature Num a, DOMElement b :: a -> b
 */
const Description = (times) => {
  const message = times === 1 ? 'Welcome! Click the button to calculate some shapes areas'
    : times === 2 ? 'Cool, huh? Do it again and see how median and latest values differ'
    : times === 3 ? 'Awesome! Keep it up bro and click more'
    : 'Great! Hope you like it :)'

  return `<h2 class="${styles.description}">${message}</h2>`
}

/* App component and its possible states */

const AppLoading = () =>
  `<div class="${styles.loading_message}">Loading...</div>`

const AppIdle = (data) =>
  `<div>
    ${Table(data)}
    <div>
      ${Description(data[0][3])}
      <button class="${styles.button_click}" id="click">Click Me!</button>
    </div>
  </div>`

const App = (componentState, data) =>
  `<section class="${styles.container}">
    <header class="${styles.header}">
      <h1 class="${styles.header__headline}">Fun Area Calculator</h1>
    </header>
    ${
      componentState === stateEnum.loading ? AppLoading()
      : componentState === stateEnum.idle ? AppIdle(data)
      : null
    }
  </section>`

/*** Render Engine  ***/

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
  (appComponent) => DOM.html('').append(appComponent(stateEnum.idle, data))

/* Main function */
const main = () => {
  DOM.html('').append(App(stateEnum.loading))
  TIMES++
  fetchData([square, rectangle, circle, ellipsis])
    .then(mapDataToApp)
    .then((render) => render(App))
}

/* Enum with all possible view states */
const stateEnum = {
  loading: 'loading',
  idle: 'idle',
}

/*** Init ***/

let TIMES = 0
const DOM = $('#app')

const calculateMedian = medians({
  square: [],
  circle: [],
  rectangle: [],
  ellipsis: [],
})

$('body').on('click', '#click', main)
main()
