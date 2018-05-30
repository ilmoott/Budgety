//Module used to controll the app's DATA
var budgetController = (function(){

    //two private constructor functions to create our expenses and incomes
    var Expense = function(id,description,value){
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    //including a method to calculate the percentage to the obj prototype
    Expense.prototype.calcPercentage = function(totalIncome){

        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage
    };


    var Income = function(id, description, value){
        this.id = id,
        this.description = description,
        this.value = value
    };

    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        // we use the reduce to loop over the data.allItems.inc || exp and sum it

        data.totals[type] = sum;
    }

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

    return {
        //public method that allow us to update the "data" object
        //it requires the TYPE(income or expense), DESCRIPTION and VALUE
        addItem: function(type, des, val){
            //the "type","des" and "val" data will be passed by the UICONTROLLER.getinput method

            var newItem, ID;
            
            //CREATE NEW ID

            //this defines the ID to be equal to the last item's ID + 1
            //the item will be retrieved from the data.allItems according to the type we passed on the addItem function
            if(data.allItems[type].length >0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else{
                ID = 0;
            }
            
            

            //CREATE NEW ITEM BASED ON 'inc' or 'exp' type
            if(type === 'exp'){
                //the "ID" comes from closure (ID private variable), "des" and "val" come from the arguments passed on the addItem function
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }


            //PUSH IT INTO OUR DATA STRUCTURE
            data.allItems[type].push(newItem);

            //RETURN THE NEW ELEMENT
            return newItem;
            
        },

        deleteItem: function(type, id){
            var ids, index;

            //we loop over the data structure and create a list with the obj ids
            ids = data.allItems[type].map(function(curr){
                return curr.id;
            });

            //the we retrieve the id of the obj we want
            index = ids.indexOf(id);

            //then we remove if it exists
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){


            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;


            //calculate the %
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
            

        },

        //method the uses the calPercentage method created on the Expense prototype to calculate
        //the percentages of all expanses
        calculatePercentages: function (){

            data.allItems.exp.forEach(function(curr){
                //the calcPercentage ask for a argument == Total Income
                curr.calcPercentage(data.totals.inc);
            });

        },


        //method to get the percentages and store them in an array
        getPercentages: function(){
            var allPerc;

            allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget: function (){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage:  data.percentage
            }
        },


        //JUST FOR TESTING. MUST BE DELETED
        testing: function(){
            console.log(data);
        }
    };

}());



//Module used to controll UI functions
var UIController = (function(){

    var DOMstrings = {
        //we create an object holding all the strings that represent class names
        //this allow us to reduce the error chance
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value', 
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    }
    return {
        //we use the return statement to make the methods public
        getinput: function(){

            return {
                //here we the "getinput" method return an object with three methods
                //the methods return the input's values that we need store and update

                type: document.querySelector(DOMstrings.inputType).value,
                //the value of this class was defined on the HTML as "inc" for income or "exp" for expenses

                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },

        addListItem: function(obj, type){
            //the obj is the one created on the data object

            var html, newHtml, element;

            //1. create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                //%id% is a placeholder for the actual id
            }
            else if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            //2. Replace the placeholder text with the actual data
            newHtml = html.replace('%id%',obj.id);
            //the replace method on the string object allow us to replace some part or placeholder for another thing we want
            newHtml = newHtml.replace('%value%',obj.value);
            newHtml = newHtml.replace('%description%',obj.description);


            //3. Insert the HTML into the DOM
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML = about the insert adjacent method
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        
        },

        deleteListItem: function(selectorId,){
            //we're goin to use the entire html id ("inc-1" or "exp-0")

            var element = document.getElementById(selectorId);

            element.parentNode.removeChild(element);

        },

        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription +', '+ DOMstrings.inputValue);
            //querySelectorAll returns a LIST, therefore, it doesnt act as an array
            
            fieldsArray = Array.prototype.slice.call(fields);
            //we're calling the slice method on the Array prototype passing the FIELDS variable as "this"
            //enabling the FIELDS to use the "slice" array's method

            fieldsArray.forEach(element => {
                element.value = "";
            });

            fieldsArray[0].focus();
            //sets the focus again to the "description" field
        },

        displayBudget: function(obj){
            
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +' %';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '-';
            }

        },

        displayPercentages: function(percentages){

            //fields will be a nodelist with all instances of the "item__percentage" class
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback){
                for (var i = 0; i < list.length; i++){
                    //we're gonna pass the current item and its index
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(curr, index){

                if (percentages[index] > 0){
                    curr.textContent = percentages[index]+' %';
                }
                else{
                    curr.textContent = '-';
                }

            });

        },

        getDOMstrings: function(){
            //this is a privilege method that exposes the DOMstrings objetc to the other modules
            return DOMstrings;
        }
    }


}());



//Module to controll and interact both UI and DATA modules
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        //here we're storing the UI controller DOMstrings in the DOM variable;
        var DOM = UICtrl.getDOMstrings();

        //Event listeners for both the button and the 'enter' key
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            //the parameter is used to manipulate the function according to the event
            
            if(event.keyCode === 13){
                //.keyCode is used to aim an specific key
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    };


    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget
        UICtrl.displayBudget(budget);
    };


    var updatePercentages = function(){

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };
    

    //functions that will be executed on the event handlers
    var ctrlAddItem = function(){

        var input, newItem;
        
        // 1. get the field input data
        input = UICtrl.getinput();


        //check if the inputs are valid
        if(input.description !=="" && !isNaN(input.value) && input.value>0){
            
        // 2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the new item to the UI
        UICtrl.addListItem(newItem,input.type);

        //4. Clear the fields
        UICtrl.clearFields();

        // 5. Calculate and update budget
        updateBudget();

        // 6. Calculate and update percentages
        updatePercentages();

        }
    };

    
    var ctrlDeleteItem = function(event){


        var itemId, splitID, type, ID;
        
        //we look for 4 generations of parents of the target of the event using "parentNode"
        //then we retain the "ID" of this element
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){

            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemId);

            // 3. Update and show the new budget
            updateBudget();
        }

    }

    


    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0});
            setupEventListeners();
        }
    };




}(budgetController,UIController));

controller.init();