var searchFields = ['name', 'description', 'category'];
// var searches = {};
var cart = [];
// var orders = [];

// References to products refer to the products object stored in data.js file

var navbar = document.getElementById("navbar");
navbar.addEventListener('click', function(e) {
  var currentView;
  switch (e.target.id) {
    case 'brand':
      searchBar.value = '';
      swap('view', 'view-home');
      break;
    case 'search-btn':
      if(e.target.value) {
        clear('search-content');
        var results = search(products, searchFields, e.target.value);
        currentView = view(results, 'view-search').id;
        swap('view', currentView);
      }
      break;
    case 'cart-btn':
      clear('cart-content');
      var aside = document.getElementById('cart-aside');
      if (aside.classList.contains('hidden')){
        aside.classList.remove('hidden');
      }
      currentView = view(cart, 'view-cart').id;
      swap('view', currentView);
      break;
    // case 'hist-btn':
    //   orderHistory();
    //   break;
      default:
  }
});

var searchBar = document.getElementById('search-bar');
searchBar.addEventListener('keyup', function(e) {
  if (e.target.value && e.which === 13 || e.keyCode === 13) {
    clear('search-content');
    var results = search(products, searchFields, e.target.value);
    var currentView = view(results, 'view-search').id;
    swap('view', currentView);
  }
})

var searchView = document.getElementById('view-search');
searchView.addEventListener('click', function(e) {
  clear('product-content');
  for (var i=0; i<products.length; i++) {
    if (e.target.getAttribute('data-id') === products[i].id) {
      var currentView = view(products[i], 'view-product').id;
      swap('view', currentView)
    }
  }
})

var productView = document.getElementById('view-product');
productView.addEventListener('click', function(e) {
  for (var i=0; i<products.length; i++) {
    if (e.target.getAttribute('data-id') === products[i].id) {
      toCart(products[i]);
    }
  }
})

var cartView = document.getElementById('view-cart');
cartView.addEventListener('change', function(e) {
  for (var i=0; i<cart.length; i++) {
    if (e.target.getAttribute('data-quant-id') === cart[i].id) {
      cart[i].quantity = e.target.value;
      var subtotal = document.getElementById('cart-sub-value');
      subtotal.textContent = priceFormat(calculate(cart));
    }
  }
})
cartView.addEventListener('click', function(e) {
  for (var i=0; i<cart.length; i++) {
    if (e.target.getAttribute('data-remove-id') === cart[i].id) {
          cart.splice(i, 1);
          clear('cart-content');
          view(cart, 'view-cart');
    }
  }
  if (e.target.id === 'cart-sub-btn') {
    clear('summary-content');
    var currentView = view(cart, 'view-checkout').id;
    swap('view', currentView);
  }
})

var checkoutView = document.getElementById('view-checkout');
// checkoutView.addEventListener('keyup', function(e) {
//   if(e.target.id === 'customer-input'){
//     if (e.which === 13 || e.keyCode === 13) {
//       customer.email = e.target.value;
//     }
//   }
// })

checkoutView.addEventListener('blur', function(e) {
  validate(e.target);
}, true);

checkoutView.addEventListener('change', function(e) {
  if (e.target.id === 'billing-checkbox') {
    var sources = $( '#shipping-form').find('input[name]');
    var targets = $( e.target.form ).find('input[name]');
    for (var i=0; i<targets.length; i++) {
      for (var k=0; k<sources.length; k++) {
        if (targets[i].getAttribute('name') === sources[k].getAttribute('name')) {
          if (e.target.checked) {
            $( targets[i] ).val($( sources[k] ).val());
          }
          else {
            $( targets[i] ).val("");
          }
        }
      }
    }
  }
});

// checkoutView.addEventListener('click', function(e) {
//   switch (e.target.id) {
//     case 'ship-submit':
//       e.preventDefault();
//
//       // var ship = form.validate(form.ship, 'ship-submit-val')
//       // if (ship) {
//         // saveForm(form.ship, customer.ship);
//         // var summary = document.getElementById('ship-summary').getElementsByClassName('ship-summary-value');
//         // for (var prop in customer.ship) {
//         //   for (var i=0; i<summary.length; i++) {
//         //     summary.length[i].textContent = customer.ship[prop];
//         //   }
//         // }
//       // }
//       break;
//     // case 'pay-submit':
//     //   // var pay = form.validate(form.pay, 'pay-submit-val');
//     //   if (pay) {
//     //     saveForm(form.pay, customer.pay);
//     //     showPay();
//     //   }
//     //   break;
//     // // case 'shipping-update':
//     //   toggleShip();
//     //   var shipSubmit = document.getElementById('ship-submit-val');
//     //   shipSubmit.textContent = '';
//     //   break;
//     // case 'payment-update':
//     //   togglePay();
//     //   var paySubmit = document.getElementById('pay-submit-val');
//     //   paySubmit.textContent = '';
//     //   break;
//     // case 'checkoutBtn':
//     //   var validate = [form.validate(form.ship, 'ship-submit-val'),
//     //   form.validate(form.pay, 'pay-submit-val')];
//     //   var order = true;
//     //   for (var i=0; i<validate.length; i++) {
//     //     if(!validate[i]) {
//     //       order = false;
//     //     }
//     //   }
//     //   if(order) {
//     //     ordered();
//     // //   }
//     // //   break;
//     default:
//   }
// });

function validate(element) {
  if (!element.checkValidity()) {
    if(!element.classList.contains('form-input-invalid')) {
      element.classList.add('form-input-invalid');
    }
  }
  else {
    if (element.classList.contains('form-input-invalid')) {
      element.classList.remove('form-input-invalid');
    }
  }
}

function save(source, save) {
  for (var prop in save) {
    save[prop] = document.getElementById(source[prop].id).value;
  }
}

function search(products, fields, criteria) {
  var matches = [];
  var added;
  for (var i=0; i<products.length; i++) {
    added = false;
    for (var k=0; k<fields.length; k++) {
      if (products[i][fields[k]].toLowerCase().indexOf(criteria.toLowerCase()) === -1) {
        continue;
      } else {
        if (added) {
          continue;
        } else {
          matches.push(products[i])
          added = true;
        }
      }
    }
  }
  return matches;
}

function toCart(product) {
  if (cart.length === 0) {
    cart.push(product);
    cart[0].quantity = 1;
  }
  else {
    var found = false;
    for (var i=0; i<cart.length; i++) {
      if (product.id === cart[i].id) {
        found = true;
        cart[i].quantity++;
        break;
      }
    }
    if(!found) {
      cart.push(product);
      cart[cart.length - 1].quantity = 1;
    }
  }
}

function element(tagname, classes, text, attribute) {
  var el = document.createElement(tagname);
  if(typeof classes === 'object') {
    for (var i=0; i<classes.length; i++) {
      el.classList.add(classes[i]);
    }
  }
  else if (classes) {
    el.classList.add(classes);
  }
  if(text) {
    el.textContent = text;
  }
  if(attribute) {
    el.setAttribute(attribute[0], attribute[1]);
  }
  return el;
}

function view(items, view) {
  var elItems = create(items, view);
  var elView = document.getElementById(view)
  var elContent = $( 'div[id=' + view + ']' ).find('.main')[0];
  switch (view) {
    case 'view-home':
      break;
    case 'view-search':
      var count = document.getElementById('result-count');
      count.textContent = elItems.length;
      break;
    case 'view-product':
      break;
    case 'view-cart':
      if(cart.length === 0) {
        var aside = document.getElementById('cart-aside')
        aside.classList.add('hidden');
        var empty = element('div', 'empty-message', 'Your Cart is Currently Empty');
        elContent.appendChild(empty);
      }
      else {
        var title = element('div','', 'Shopping Cart', ['id', 'cart-title']);
        elContent.appendChild(title);
        var subtotal = document.getElementById('cart-sub-value');
        subtotal.textContent = priceFormat(calculate(cart));
        break;
      }
      break;
    case 'view-checkout':
      var itemsTotal = calculate(cart);
      var taxTotal = itemsTotal * 8 / 100;
      var itemsValue = document.getElementById('summary-items-value');
      itemsValue.textContent = priceFormat(itemsTotal);
      var taxValue = document.getElementById('summary-tax-value');
      taxValue.textContent = priceFormat(taxTotal);
      var totalValue = document.getElementById('summary-total-value');
      totalValue.textContent = priceFormat(itemsTotal + taxTotal);
      break;
    case 'view-history':
      elContent.appendChild(element('div', 'hist-title', 'Order History'));
      break;
    default:
  }
  append(elContent, elItems);
  return elView;
}

function create(items, view) {
  var img;
  var name;
  var price;
  var descrip;
  var elItems = [];
  var elItem;
  if (Array.isArray(items)) {
    for (var i=0; i<items.length; i++) {
      if(!Array.isArray(items[i])) {
        img = element('img', '', '', ['src', items[i].img]);
        name = element('div', '', items[i].name);
        price = element('div', '', priceFormat(items[i].price));
        descrip = element('div', '', items[i].description);
        switch (view) {
          // case 'view-home':
          //   break;
          case 'view-search':
            img.classList.add('result-img');
            name.classList.add('result-name');
            name.setAttribute('data-id', items[i].id);
            price.classList.add('result-price');
            var resultText = element('div', 'result-text');
            append(resultText, [name, price]);
            elItem = element('div', 'result');
            append(elItem, [img, resultText]);
            break;
          case 'view-cart':
            img.classList.add('cart-img');
            name.classList.add('cart-name');
            price.classList.add('cart-price');
            var cartText = element('div', 'cart-text');
            append(cartText, [name, price]);
            var quantLabel = element('div', 'quant-label', 'Quantity');
            var quantSection = element('div', 'inline-div');
            append(quantSection, [quantLabel, quantBtn(items[i]), removeBtn(items[i])])
            elItem = element('div', 'cart-item');
            append(elItem, [img, cartText, quantSection]);
            break;
          case 'view-checkout':
            img.classList.add('review-img');
            name.classList.add('review-name');
            price.classList.add('review-price');
            var quantity = element('div', 'review-quant', 'Quantity: ' + cart[i].quantity);
            var reviewText = element('div','review-text');
            append(reviewText, [name, price, quantity]);
            var subLabel = element('span','', 'Subtotal: ');
            var subValue = element('span', 'review-sub-value', priceFormat(cart[i].quantity * cart[i].price));
            var sub = element('div', 'review-sub');
            append(sub, [subLabel, subValue])
            elItem = element('div', 'review');
            append(elItem, [img, reviewText, sub]);
            break;
            default:
        }
        elItems.push(elItem);
      }
      //order history has arrays within an array
      else {
        elItem = element('div', ['hist-order', 'col-md-9'], '');
        var date = element('div', 'hist-date');
        append(date, [
          element('div', 'hist-date-label', 'Order Submitted:'),
          element('div', 'hist-date-content', items[i].submitted.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}))
        ]);
        var total = element('div', 'hist-total');
        append(total, [
          element('div', 'hist-total-label', 'Total:'),
          element('div', 'hist-total-content', priceFormat(items[i].total)),
        ]);
        var summary = element('div', 'hist-summary');
        append(summary, [date, total]);
        append(elItem, summary);
        for (var k=0; k<items[i].contents.length; k++) {
          var item = element('div', 'hist-item');
          append(item, element('img', 'hist-item-img', '', ['src', items[i].contents[k].img]));
          var text = element('div', 'hist-item-text');
          append(text, [
            element('div', 'hist-item-name', items[i].contents[k].name),
            element('div', 'hist-item-price', priceFormat(items[i].contents[k].price))
          ]);
          append(item, text);
          append(elItem, item);
          elItems.push(elItem);
        }
      }
    }
    return elItems;
  }
  //product view only uses one object
  else {
    img = element('img', 'product-img', '', ['src', items.img]);
    name = element('div', 'product-name', items.name);
    price = element('div', 'product-price', priceFormat(items.price));
    descrip = element('div', 'product-descr', items.description);
    var cartBtn = element('button', 'add-cart-btn', 'Add to Cart', ['data-id', items.id]);
    var prodDetail = element('div', 'product-detail');
    append(prodDetail, [name, price, descrip, cartBtn]);
    elItem = element('div', 'product-item');
    append(elItem, [img, prodDetail]);
    return elItem;
  }
}

function append(parent, children) {
  if(Array.isArray(children)) {
    for (var i=0; i<children.length; i++) {
      parent.appendChild(children[i]);
    }
  }
  else {
    parent.appendChild(children);
  }
}

function clear(view) {
  var elView = document.getElementById(view);
   while(elView.firstChild) {
    elView.removeChild(elView.firstChild);
  }
}

function swap(attribute, view) {
  var elViews = document.getElementsByClassName(attribute);
  var nextView = document.getElementById(view);
  if (elViews.length > 0) {
    for (var i=0; i<elViews.length; i++) {
      elViews[i].classList.remove('active');
      elViews[i].classList.add('hidden');
    }
    nextView.classList.remove('hidden');
    nextView.classList.add('active');
  }
  else {
    var elView = document.getElementById(attribute);
    if (elView.classList.contains('hidden')) {
      elView.classList.remove('hidden');
      elView.classList.add('active');
    }
    else {
      elView.classList.add('hidden');
      elView.classList.remove('active');
    }
  }
}

function priceFormat(num) {
  var numFormat = num.toLocaleString('en-US',{style: 'currency', currency: 'USD'});
  return numFormat;
}

function calculate(products) {
  var total = 0;
  for (var i=0; i<products.length; i++) {
    total += products[i].quantity * products[i].price * 100;
  }
  return total / 100;
}

function removeBtn(obj) {
  var remove = element('div', 'remove-btn', 'Remove');
  remove.setAttribute('data-remove-id', obj.id);
  return remove;
}

function quantBtn(item) {
  var quant = document.createElement('select');
  quant.classList.add('quant-btn');
  quant.setAttribute('value', item.quantity);
  quant.setAttribute('data-quant-id', item.id);
  for (var i=1; i<=10; i++) {
    var theOption = document.createElement('option');
    theOption.setAttribute('value', i);
    theOption.textContent = i;
    if (theOption.textContent === item.quantity.toString()) {
      theOption.setAttribute('selected', 'selected');
    }
    quant.appendChild(theOption);
  }
  return quant;
}



// function ordered() {
//   var order = {};
//   order.total = 0;
//   order.submitted = new Date();
//   order.contents = [];
//   for (var i=0; i<cart.length; i++) {
//     order.contents.push(cart[i]);
//     order.total += (cart[i].quantity * cart[i].price);
//   }
//   order.customer = customer;
//   orders.push(order);
//   cart = [];
//   hide('checkout');
//   var confirmation = element('div', 'order-confirmation', 'Your order has been placed');
//   content.appendChild(confirmation);
// }

// function showShip() {
//   var shipInfo = document.getElementById('ship-info');
//   clear(shipInfo);
//   var shipText = element('div', 'ship-text');
//   append(shipText, [
//     element('div', '', customer.ship.name),
//     element('div', '', customer.ship.address),
//     element('div', '', customer.ship.addressTwo),
//     element('span', '', customer.ship.city + ', '),
//     element('span', '', customer.ship.state + ' '),
//     element('span', '', customer.ship.zip),
//     element('div', '', customer.ship.phone)
//     ]);
//   append(shipInfo, shipText);
//   shipInfo.style.display = 'block';
//   var shipForm = document.getElementById('shipping-form');
//   shipForm.style.display = 'none';
//   var shipUpdate = document.getElementById('shipping-update');
//   shipUpdate.style.display = 'inline';
// }
