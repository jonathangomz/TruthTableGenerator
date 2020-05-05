const PARENTHESIS_OPEN = ['(', '{', '['];
const PARENTHESIS_CLOSE = [')', '}', ']'];
const OPERATIONS = ['v', '*', '^', '+', '!'];

function generatePosfix(text) {
	const stack = [];
	let text_posfix = [];
	for (let char of text) {
		
		if (PARENTHESIS_OPEN.includes(char))
			stack.push(char);

		else if (OPERATIONS.includes(char))
		{
			if (stack.length > 0) {
				let lastChar = stack.pop();
				if (PARENTHESIS_OPEN.includes(lastChar)) {
					stack.push(lastChar);
					stack.push(char);
				}
			}
			else
				throw("Error 10: separe sus operaciones con paréntesis");
		}

		else if (PARENTHESIS_CLOSE.includes(char)) {
			if (stack.length > 0) {
				let lastChar = stack.pop();
				if(!PARENTHESIS_OPEN.includes(lastChar)) {
					text_posfix.push(lastChar);
					stack.pop();
				}
			}
		}
		else
			text_posfix.push(char);
	}

	return text_posfix;
}

let a = generatePosfix('{[a+b])}');
