document.addEventListener('DOMContentLoaded', function(e){
    let modal = configureModal({
        span: document.getElementsByClassName("close")[0],
        modal: document.getElementById('message')
    });
    
    let btn = document.getElementById('button');

    btn.onclick = function(){
        const condition = document.getElementById('condition');
        
        const validation = validator(condition.value);
        if(validation.error){
            switch(validation.type) {
                case INVALID.LENGTH:
                    modal.display(validation.message);
                    break;
                default:
                    console.log("Default");
                    break;
            }
        }
    }
});

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
        document.getElementById('modal-text').innerHTML = message;
    }

    return modal;
}

/**
 * Validate if the value for condition field is correct
 * @param  {String} condition The condition itself
 * @return {Object}      An object with an error, type and message. Type and message useful only when error is presented.
 */
function validator(condition){
    if(condition.length <= 0)
        return { error: true, type: INVALID.LENGTH, message: "You must write a condition" };
}

/**
 * Typos for invalid data
 */
const INVALID = {
    LENGTH: 4000,
    CHARACTER: 4001,
    PARENTHESES_OPEN: 4002,
    PARENTHESES_CLOSE: 4003,
}