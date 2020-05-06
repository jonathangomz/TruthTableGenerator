document.addEventListener('DOMContentLoaded', DOMFunctionality);

function DOMFunctionality(e){
    let modal = configureModal({
        span: document.getElementsByClassName("button close")[0],
        modal: document.getElementById('modal')
    });

    let tableComponent = configureTable({
        tableContainer: document.getElementById("results")
    });

    tableComponent.updateDOM();

    let btn = document.getElementById('generate');
    btn.onclick = function(){
        const input = document.getElementById('condition');
        
        const validation = validator(input.value);
        if(validation.error){
            switch(validation.type) {
                case ERROR.LENGTH:
                    modal.display(validation.message);
                    break;
                default:
                    console.log("Default");
                    break;
            }
        }
    }
}

/**
 * Add the events for open & close modal, and the implement function to display with custom message.
 * @param  {HTMLElement} span The element to close the modal
 * @param  {HTMLElement} modal The modal itself
 * @returns {HTMLElement} The modal with a custom function for display with message.
 */
function configureModal({span, modal}) {
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    modal.display = function(message) {
        modal.style.display = "block";
        document.getElementById('modal-text').innerHTML = message ?? "This modal is empty hehe";
    }

    return modal;
}

/**
 * Add the events for open & close modal, and the implement function to display with custom message.
 * @param  {HTMLElement} tableContainer The element where table will be added
 * @param  {object} data Data to populate the table
 * @returns {TableComponent} A component that contains the HTML and other usefull methods for the table
 */
function configureTable({tableContainer, data = exampleData}) {
    const component = new TableComponent(tableContainer);
    
    for(let variable of data.variables) {
        component.addTitleCell(variable);
    }
    component.addTitleCell(data.condition);

    data.options.forEach((option, indexRes) => {
        let resultForCombination = data.results[indexRes];

        component.openRow();
        for(let key in option){
            component.addRowCell(option[key]);
        }
        component.addRowCell(resultForCombination);
        component.closeRow();
    });

    return component;
}


/**
 * Validate if the value for condition field is correct
 * @param  {string} strCondition The condition itself
 * @return {object}      An object with an error, type and message. Type and message useful only when error is presented.
 */
function validator(strCondition){
    if(strCondition.length <= 0)
        return { error: true, type: ERROR.LENGTH, message: "You must write a condition" };
    
    return { error: false, type: ERROR.NONE, message: ""};
}

/**
 * Typos for errors in data
 */
const ERROR = {
    NONE: 10000,
    LENGTH: 4000,
    CHARACTER: 4001,
    PARENTHESES_OPEN: 4002,
    PARENTHESES_CLOSE: 4003,
}

/**
 * Data to populate table example
 */
const exampleData = {
    condition: "(A & B)",
    variables: ["A", "B"],
    options: [
        {"A": false, "B": false},
        {"A": false, "B": true},
        {"A": true, "B": false},
        {"A": true, "B": true},
    ],
    results:[false, false, false, true]
}

/**
 * Table Component to display the results
 */
class TableComponent {

    /**
     * @constructor Initialize a new component
     * @param {HTMLElement} htmlElementContainer The element in the DOM where the table will be inserted.
     */
    constructor(htmlElementContainer){
        /** @private */
        this.container = htmlElementContainer;
        /** @private */
        this.row = [];
        /** @private */
        this.thead = [];
        /** @private */
        this.tbody = [];

        /** @public */
        const template = `<table>
                            <thead>${this.thead.join('')}</thead>
                            <tbody>${this.tbody.join('')}</tbody>
                        </table>`;
    }
    
    /**
     * Clean the row. Remove the cells added previously
     */
    openRow = () => {
        this.row = [];
    }

    /**
     * Add the current row with all the cells to the TBody of the table 
     */
    closeRow = () => {
        this.tbody.push(`<tr>${this.row.join('')}</tr>`);
    }

    /**
     * Add a new cell to the THead of the table
     * @param {any} data The data that will be inserted on the cell
     */
    addTitleCell = (data) => {
        this.thead.push(`<td>${data}</td>`);
    }

    /**
     * Add a new cell to the current row that will be on the TBody of the table
     * @param {any} data The data that will be inserted on the cell
     */
    addRowCell = (data) => {
        this.row.push(`<td>${data}</td>`);
    }

    /**
     * Get the template populated with the current data
     * @returns {string} The HTML for the table as a string
     */
    getHTML = () => {
        return `<table>
                    <thead>${this.thead.join('')}</thead>
                    <tbody>${this.tbody.join('')}</tbody>
                </table>`;
    }

    /**
     * Update the DOM and insert the HTML for the table with the current data
     */             
    updateDOM = () => {
        this.container.innerHTML = this.getHTML();
    }
}