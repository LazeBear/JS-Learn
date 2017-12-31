// use IIFE to create private data structure
// this is a module
var budgetController = (function () {

    // // this is private 
    // var x = 23;
    // // this is private as well
    // var add = function (a) {
    //     return x + a;
    // }

    // return {
    //     // this is public by calling:
    //     // budgetCtrller.publicTest(12)
    //     publicTest: function (b) {
    //         return add(b);
    //     }
    // }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Expense.prototype.getPercentage = function () {
    //     return this.percentage;
    // }

    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(e => {
            sum += e.value;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function (type, desc, value) {
            var newItem, itemArr, id;

            // generate the id
            itemArr = data.allItems[type];
            if (itemArr.length > 0) {
                id = itemArr[itemArr.length - 1].id + 1;
            } else {
                id = 0;
            }

            // generate the new item
            if (type === 'exp') {
                newItem = new Expense(id, desc, value);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, value);
            }

            // add the new item to the array
            data.allItems[type].push(newItem);

            // return the new item
            return newItem;
        },
        deleteItem: function (type, id) {
            var idArr, index;
            // convert into id array
            idArr = data.allItems[type].map(i => {
                return i.id;
            });
            index = idArr.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of expenses
            if (data.totals.exp > data.totals.inc) {
                data.percentage = 0;
            } else {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(e => {
                e.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(e => {
                // return e.getPercentage();
                return e.percentage;
            });
            console.log(allPercentages);
            return allPercentages;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }

})();

var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                desc: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItem: function (obj, type) {
            var html, newHtml;
            // create html string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // inser the html to the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (divID) {
            var element = document.getElementById(divID)
            element.parentNode.removeChild(element);
        },
        clearFields: function () {
            var fields, fieldsArr;
            // querySelectorAll returns a list
            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);

            // the trick to convert list to array
            fieldsArr = Array.prototype.slice.call(fields)

            //    fieldsArr.forEach(function(current, index, array) {
            //         current.value="";
            //    });

            fieldsArr.forEach(e => {
                e.value = "";
            });

            // reset the focus
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);

            nodeListForEach(fields, function (element, index) {
                var currentPer = percentages[index];
                currentPer > 0 ?
                    element.textContent = percentages[index] + '%' :
                    element.textContent = '---';
            });
        },
        displayMonth: function () {
            var now, year, month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ' ' + year;
        },
        changedType: function (e) {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDesc + ',' +
                DOMStrings.inputValue
            )

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    };


})();


var appController = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', addItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                addItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // display the budget on the ui
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {
        // calculate percentatges
        budgetCtrl.calculatePercentages();
        // read percentages from the budget constroller
        var percentages = budgetCtrl.getPercentages();
        // update the ui
        UICtrl.displayPercentages(percentages);
    }

    var addItem = function () {
        var input, newItem;
        // get the input data
        input = UICtrl.getInput();

        if (input.desc.trim() === "" || isNaN(input.value) || input.value <= 0) {
            return;
        }

        // add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

        // add the item to the ui
        UICtrl.addListItem(newItem, input.type);

        // clear the input
        UICtrl.clearFields();

        // calc and update budget
        updateBudget();

        // update percentages
        updatePercentages();
    };

    var deleteItem = function (e) {
        var idArr, itemID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        // split the string
        if (itemID) {
            idArr = itemID.split('-');
        }

        // delete the item
        budgetCtrl.deleteItem(idArr[0], parseInt(idArr[1]));

        // update item in ui
        UICtrl.deleteListItem(itemID);

        // update the budget
        updateBudget();

        // update percentages
        updatePercentages();
    };

    return {
        init: function () {
            console.log('App started!');
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
        }
    };
})(budgetController, UIController);

appController.init();