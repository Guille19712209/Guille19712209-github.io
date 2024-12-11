/* 
  una funcion puede contener:
    objetos
    constantes
    operadores
    variables

concatenaciones validas

objeto operador
constante operador


*/
const formulas = [
    "obj1*0.2",                                                 // obj(si mismo) operador constante
    "obj2*0.2",                                                 // obj operador constante - crea link obj1->obj2
    "(obj1+obj2)*obj3",                                         // operador obj operador obj operador operador obj
    "valorPeriodo(obj1,5)+valorPeriodo(obj2,periodoActual-2)",  // funcion operador objt operador constante operador operador ... variable operador objeto operador
    "valorPeriodo(obj1,1)",
    "valorPeriodo(obj1,periodoActual-1)",
    "valorPeriodo(obj1,periodoActual+1)",
    "valorPeriodo(obj1,periodoFinal)",
    "valorPeriodoInicial(obj1)",
    "valorPeriodoAnterior(obj1)",
    "valorPeriodoSiguiente(obj1)",
    "valorPeriodoFinal(obj1)",
]


/*
    para ejecutar la funcion se debe evavaluar el string
    y antes definir el ambito donde viven objetos, variables y funciones
*/
const execute = (formula) => {
    const obj1 = 1000
    const obj2 = 2000
    const obj3 = 2000
    const periodoActual = 2
    const periodoFinal = 8
    const valorPeriodo = (obj, periodo) => obj * periodo
    const valorPeriodoInicial = (obj) => obj * 1
    const valorPeriodoAnterior = (obj) => obj * 2
    const valorPeriodoSiguiente = (obj) => obj * 3
    const valorPeriodoFinal = (obj) => obj * periodoFinal

    return eval(formula)
}

const ejecuteFormulas = () => {
    formulas.forEach((formula, i) => {
        console.log(formulas[i])
        console.log(execute(formulas[i]))
        console.log('---------------------------------')
    })
}



/*
    procesar una formula en busqueda de links entre objetos, tener cuenta que en una formula puede venor

    objetos
    constantes
    operadores
    variables

*/
const getLinks = (obj,formula) => {
    const objects = ['obj1', 'obj2', 'obj3']
    const operators = ['+', '-', '*', '/', '(', ')', ',']
    const variables = ['periodoActual', 'periodoFinal']

    const isObject = (str) => objects.includes(str)
    const isOperator = (str) => operators.includes(str)
    const isVariable = (str) => variables.includes(str)
    const isConstant = (str) => !isNaN(str)

    const literalRegex = /\b([a-zA-Z_]\w*)\b/g;
    const references = []

    while ((match = literalRegex.exec(formula)) !== null) {
        if (objects.includes(match[1]) && match[1] !== obj) {
            references.push(match[1]);
        }
    }
    return references
}



const getLinkFormulas = () => {
    formulas.forEach((formula, i) => {
        console.log(formulas[i])
        console.log(getLinks('obj1',formulas[i]))
        console.log('---------------------------------')
    })
}


// ejecuteFormulas()
getLinkFormulas()