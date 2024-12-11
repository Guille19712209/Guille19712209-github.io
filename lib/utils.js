
const uuidv4 = () => "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
)

const showAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')
    $('#alertPlaceholder').html(wrapper)
    setTimeout(() => $('#alertPlaceholder').empty(), 2000)
}

const showError = (message) => {
    showAlert(message, 'danger')
}

const showSuccess = (message) => {
    showAlert(message, 'success')
}

const showWarning = (message) => {
    showAlert(message, 'warning')
}

const isNumeric = (str) => {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}