//Constructor function validator
function Validator(options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.gruopSelector).querySelector(options.errorSelector)
        var errorMessage
        //Lấy ra từng rule của Selector
        var rules = selectorRules[rule.selector]

        //lặp qua từng rule và kiểm tra
        //nếu mà có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                break;
                default:
                    errorMessage = rules[i](inputElement.value);
                }
                if(errorMessage) break;
        }
        
                    if(errorMessage) {
                        errorElement.innerText = errorMessage
                        getParent(inputElement, options.gruopSelector).classList.add('invalid')

                    } else {
                        errorElement.innerText = ''
                        getParent(inputElement, options.gruopSelector).classList.remove('invalid')
                    }

                    return !errorMessage
    }

    var formElement = document.querySelector(options.form)
    if(formElement) {
        //submit form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true
            //lặp qua từng rules và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }            
            })
            

            if(isFormValid) {
                // TH submit với javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
            
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio' :
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }

                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                } 
                //TH submit với hành vi mặc đinh
                else {
                    formElement.submit()
                }

            } 
        }


        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input ,...)

        options.rules.forEach(function(rule) {
            
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement) {
                //Xử lý trường hợp khi blur
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                //Xử lý trường hợp khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.gruopSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.gruopSelector).classList.remove('invalid')
                }
            })
        })
    }
}

// Định nghĩa rules
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập đầy đủ !!'
        }
    }
}

Validator.isChosen = function(selector,message) {
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng chọn vào ô !!'
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email !!'
        }
    }    
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập ${min} ký tự !!`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmedValue, message) {
    return {
        selector:selector,
        test: function(value) {
            return value === getConfirmedValue() ? undefined : message || 'Giá trị nhập lại không chính xác !!'
        }
    }
}

