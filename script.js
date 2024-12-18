document.addEventListener('DOMContentLoaded', () => {
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const screen3 = document.getElementById('screen3');
    const toScreen2 = document.getElementById('toScreen2');
    const toScreen3 = document.getElementById('toScreen3');
    const form = document.getElementById('mainForm');
    const productsContainer = document.querySelector('.products');
    const selectedProductsList = document.querySelector('.selected-products');
    const gramsInput = document.getElementById('gramsInput');
    const gramsField = document.getElementById('grams');
    const confirmGrams = document.getElementById('confirmGrams');
    const activitySelect = document.getElementById('activity');
    let categoryName = document.getElementById('category_name');
    let categoryDescription = document.getElementById('category_description');
    let categoryPhoto = document.getElementById('category_url');
    let calorieStandard = document.getElementById('calorie_standard');
    let userCalorie = document.getElementById('user_calorie');

    let selectedProductElement = null; // Хранит текущий выбранный продукт
    const selectedProducts = new Map(); // Хранит выбранные продукты и их количество

    // Валидация перед отправкой формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const activityValue = activitySelect.value;
    
        if (!activityValue) {
            alert('Пожалуйста, выберите тип физической нагрузки!');
            return;
        }
    
        // Другие поля валидации
        if (!validateForm()) {
            return;
        }
    
    });

    // Переход на второй экран с валидацией
    toScreen2.addEventListener('click', () => {
        if (form.checkValidity()) {
            screen1.classList.add('hidden');
            screen2.classList.remove('hidden');
            loadProducts(); // Загружаем данные с сервера
        } else {
            alert('Пожалуйста, заполните все поля!');
        }
    });

    // Функция для загрузки данных с сервера с использованием XMLHttpRequest
    function loadProducts() {
        const Http = new XMLHttpRequest();
        const url = 'http://51.250.41.47:8000/api/v1/foods/';

        Http.open("GET", url);
        Http.send();

        Http.onreadystatechange = function () {
            if (Http.readyState === 4) { // Запрос завершён
                if (Http.status === 200) { // Успешный статус
                    const data = JSON.parse(Http.responseText);
                    displayProducts(data); // Отображаем продукты на странице
                } else {
                    console.error('Ошибка запроса:', Http.statusText);
                    alert('Ошибка при загрузке продуктов.');
                }
            }
        };
    }

    // Функция для отображения продуктов на странице
    function displayProducts(products) {
        productsContainer.innerHTML = ''; // Очищаем старые продукты
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.dataset.name = product.name;
            productDiv.textContent = product.name;

            productDiv.addEventListener('click', () => {
                // Если продукт уже выбран, снимаем его выбор
                if (productDiv.classList.contains('selected')) {
                    productDiv.classList.remove('selected');
                    selectedProducts.delete(product.name); // Удаляем из выбранных
                } else {
                    // Иначе выделяем продукт
                    productDiv.classList.add('selected');
                    selectedProductElement = productDiv;
                    gramsInput.classList.remove('hidden');
                    gramsField.value = selectedProducts.get(product.name) || ''; // Подставляем старое значение, если есть
                }
            });

            productsContainer.appendChild(productDiv);
        });
    }

    
    // Подтверждение ввода граммов
    confirmGrams.addEventListener('click', () => {
        const gramsValue = gramsField.value;
        if (!gramsValue || gramsValue <= 0) {
            alert('Введите корректное количество граммов!');
            return;
        }
        const productName = selectedProductElement.dataset.name;
        selectedProducts.set(productName, gramsValue);

        updateSelectedProductsList();
        gramsInput.classList.add('hidden');
    });

    // Обновляем список выбранных продуктов
    function updateSelectedProductsList() {
        selectedProductsList.innerHTML = ''; // Очищаем список
        selectedProducts.forEach((grams, name) => {
            const item = document.createElement('div');
            item.textContent = `${name}: ${grams} г`;
            selectedProductsList.appendChild(item);
        });

        document.querySelectorAll('.product').forEach(p => {
            if (selectedProducts.has(p.dataset.name)) {
                p.classList.add('selected'); // Подсветка выбранных продуктов
            } else {
                p.classList.remove('selected');
            }
        });
    }

    // Отправка данных на сервер
    toScreen3.addEventListener('click', () => {
        const formData = gatherFormData();
        console.log('Отправляем данные:', formData);
        screen2.classList.add('hidden');
        screen3.classList.remove('hidden');
        sendToServer(formData);
    })

    // Собираем данные формы
    function gatherFormData() {
        let gender = document.getElementById('gender').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const age = document.getElementById('age').value;
        const activity = activitySelect.value;

        const foods = Array.from(selectedProducts.entries()).map(([name, quantity]) => ({
            name,
            quantity: Number(quantity),
        }));

        console.log(gender);

        if (gender === 'мужчина') {
            gender = 'Male';
        } else {
            gender = 'Female';
        };

        return {
            gender: gender,
            height: Number(height),
            weight: Number(weight),
            age: Number(age),
            physical_activity_type: Number(activity),
            foods: foods
        };
    }

    // Отправка данных на сервер
    function sendToServer(formData) {
        const url = 'http://51.250.41.47:8000/api/v1/info/';
        const Http = new XMLHttpRequest();

        Http.open("POST", url);
        Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        Http.send(JSON.stringify(formData));

        Http.onreadystatechange = function () {
            if (Http.readyState === 4) {
                if (Http.status === 200 || Http.status === 201) {
                    console.log('Данные успешно отправлены:', Http.responseText);
                    // alert('Данные успешно отправлены!');
                    const data = JSON.parse(Http.responseText);
                    displayServerResponse(data);

                } else {
                    console.error('Ошибка при отправке данных:', Http.statusText);
                    alert('Ошибка при отправке данных.');
                }
            }
        };
    }

    function displayServerResponse(data) {        
        // Очищаем содержимое элемента перед обновлением
        categoryName.innerHTML = '';
        categoryDescription.innerHTML = '';
        categoryPhoto.innerHTML = '';
        calorieStandard.innerHTML = '';
        userCalorie.innerHTML = '';
    
        const pName = document.createElement('p');
        pName.textContent = data.category_name;
        categoryName.appendChild(pName);

        const pDesc = document.createElement('p');
        pDesc.textContent = data.category_description;
        categoryDescription.appendChild(pDesc);

        const imageElement = document.createElement('img');
        imageElement.src = data.category_url;
        categoryPhoto.appendChild(imageElement);

        const pCalories = document.createElement('p');
        pCalories.textContent = data.calorie_standard;
        calorieStandard.appendChild(pCalories);

        const pUserCalories = document.createElement('p');
        pUserCalories.textContent = data.user_calorie;
        userCalorie.appendChild(pUserCalories);
    }

    // Валидация формы
    function validateForm() {
        const gender = document.getElementById('gender').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const age = document.getElementById('age').value;

        if (!gender || !height || !weight || !age) {
            alert('Пожалуйста, заполните все поля формы!');
            return false;
        }
        return true;
    }

});
