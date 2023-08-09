document.addEventListener('DOMContentLoaded', DOMFunctionality);

function DOMFunctionality(){
    let modal = configureModal({
        close: document.getElementsByClassName("button close")[0],
        modal: document.getElementById('modal')
    });

    let tableComponent = new TableComponent(document.getElementById("results"))

    // Load example initial table
    tableComponent.loadData(exampleData)

    let btn = document.getElementById('generate');
    btn.onclick = function(){
        // Clean the table
        tableComponent.reset();

        const input = document.getElementById('condition');
        
        const validation = validator(input.value);
        if(validation.haveError){
            modal.display(validation.message);
        } else {
            const options = getOptions(input.value);
            const result = solve(input.value, options);

            // Update table
            tableComponent.loadData(result);
        }
    }
}

/**
 * 
 * Get the options to use for true and false
 * @param  {string} condition The rule to map
 * @returns {Object} An Object with each of the valid options for the condition
 */
function getOptions(condition) {
	const regex = new RegExp('([a-zA-Z])*', 'g');
	const result = condition.match(regex).filter(options => options !== '');
	const variablesWithoutDuplicateds = [...new Set(result)]; // a, b, c

    // get the number of combinations for the condition using binary. Ex. if a, b & c the max options are '100' in binary * 2 (100 = 4, 4*2 = 8)
	let rounds = parseInt('1' + new Array(variablesWithoutDuplicateds.length).join('0'), 2) * 2

	const mappedOptions = {}
	for(let i = 0; i < rounds; i++) {
        mappedOptions[i] = {}
        const binary = i.toString(2).split('')

        while(binary.length < variablesWithoutDuplicateds.length) {
            binary.unshift('0')
        }

        for(let option in variablesWithoutDuplicateds) {
            mappedOptions[i][variablesWithoutDuplicateds[option]] = Boolean(parseInt(binary[option]))
        }
	}

	return mappedOptions
}

/**
 * 
 * Solve each of the possible variants of the operation
 * @param  {string} condition The condition to solve
 * @returns {Object} A list of objecs with the options and result
 */
function solve(condition) {
    const mappedConditionsResults = {}
    const mappedOptions = []
    const results = []

    const options = getOptions(condition)
    for(let option in options) {
        let singleMappedOperation = condition;
        for(let variable of Object.keys(options[option])) {
            let value = options[option][variable]
            singleMappedOperation = singleMappedOperation.replace(variable, value.toString())
        }

        const result = Boolean(eval(singleMappedOperation))

        mappedConditionsResults[option] = {
            operation: singleMappedOperation,
            options: options[option],
            result: result
        }

        mappedOptions.push(options[option])
        results.push(result)
    }

    return {
        condition,
        variables: Object.keys(options[0]),
        options: mappedOptions,
        results,
        mappedResults: {...mappedConditionsResults}
    }
}


/**
 * Add the events for open & close modal, and the implement function to display with custom message.
 * @param  {HTMLElement} close The element to close the modal
 * @param  {HTMLElement} modal The modal itself
 * @returns {HTMLElement} The modal with a custom function for display with message.
 */
function configureModal({close, modal}) {
    // When the user clicks on <span> (x), close the modal
    close.onclick = function() {
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

        component.initRow();
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
 * @param  {string} input The input text
 * @return {object}      An object with haveError, error and message properties. Error and message are useful only when haveError is true.
 */
function validator(input){
    if(input.length <= 0)
        return { haveError: true, error: ERROR.LENGTH, message: "You must write a condition" };

    let parentheses = parenthesesValidator(input);

    if(parentheses.haveError){
        return { haveError: true, error: parentheses.error, message: parentheses.message };
    }
    
    return { haveError: false, error: ERROR.NONE, message: "Ok" };
}

/**
 * Validate the correct use of the parentheses
 * @param {string} input An string with a sequence of parentheses
 * @returns {object}     An object with haveError, error and message properties. Error and message are useful only when haveError is true.
 */
function parenthesesValidator(input) {
    const PARENTHESIS_OPEN = ['(', '{', '['];
    const PARENTHESIS_CLOSE = [')', '}', ']'];

    const stackForParentheses = [];
    for(let char of input){
        if(PARENTHESIS_OPEN.includes(char))
            stackForParentheses.push(char);
        
        else if(PARENTHESIS_CLOSE.includes(char)) {
            if(stackForParentheses.length === 0)
                return {haveError: true, error: ERROR.PARENTHESES_CLOSE, message: 'Bad close parentheses. Open parenthesis is missing.'};

            let last = stackForParentheses.pop();
            if(PARENTHESIS_OPEN.indexOf(last) !== PARENTHESIS_CLOSE.indexOf(char))
                return {haveError: true, error: ERROR.PARENTHESES_TYPE_MIX, message: 'Mixed parentheses'};
        }
        
    }

    if(stackForParentheses.length !== 0)
        return {haveError: true, error: ERROR.PARENTHESES_OPEN, message: 'Bad open parentheses. Close parenthesis is missing.'};

    return { haveError: false, error: ERROR.NONE, message: 'Ok'};
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
    PARENTHESES_TYPE_MIX: 4004,
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
        /** @public */
        this.container = htmlElementContainer;
        /** @public */
        this.row = [];
        /** @public */
        this.thead = [];
        /** @public */
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
    initRow = () => {
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


    /**
     * Add date and update table
     * @param {any} data The data that will be inserted on the table
     * @returns {string} The TableComponent itself
     */
    loadData = (data = exampleData) => {        
        for(let variable of data.variables) {
            this.addTitleCell(variable);
        }
        this.addTitleCell(data.condition);
    
        data.options.forEach((option, indexRes) => {
            let resultForCombination = data.results[indexRes];
    
            this.initRow();
            for(let key in option){
                this.addRowCell(option[key]);
            }
            this.addRowCell(resultForCombination);
            this.closeRow();
        });

        this.updateDOM()
    
        return this;
    }

    /**
     * Reset the table
     */
    reset = () => {
        this.row = []
        this.thead = []
        this.tbody = []
    }
}