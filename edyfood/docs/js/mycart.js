/*

*/

(function (R$) {

  "use strict";

  var OptionManager = (function () {
    var objToReturn = {};

    var defaultOptions = {
      classCartIcon: 'my-cart-icon',
      classCartBadge: 'my-cart-badge',
      affixCartIcon: true,
      checkoutCart: function(products) { },
      clickOnAddToCart: function($addTocart) { },
      getDiscountPrice: function(products) { return null; }
    };


    var getOptions = function (customOptions) {
      var options = R$.extend({}, defaultOptions);
      if (typeof customOptions === 'object') {
        R$.extend(options, customOptions);
      }
      return options;
    }

    objToReturn.getOptions = getOptions;
    return objToReturn;
  }());


  var ProductManager = (function(){
    var objToReturn = {};

    /*
    PRIVATE
    */
    localStorage.products = localStorage.products ? localStorage.products : "";
    var getIndexOfProduct = function(id){
      var productIndex = -1;
      var products = getAllProducts();
      R$.each(products, function(index, value){
        if(value.id == id){
          productIndex = index;
          return;
        }
      });
      return productIndex;
    }
    var setAllProducts = function(products){
      localStorage.products = JSON.stringify(products);
    }
    var addProduct = function(id, name, summary, price, quantity, image) {
      var products = getAllProducts();
      products.push({
        id: id,
        name: name,
        summary: summary,
        price: price,
        quantity: quantity,
        image: image
      });
      setAllProducts(products);
    }

    /*
    PUBLIC
    */
    var getAllProducts = function(){
      try {
        var products = JSON.parse(localStorage.products);
        return products;
      } catch (e) {
        return [];
      }
    }
    var updatePoduct = function(id, quantity) {
      var productIndex = getIndexOfProduct(id);
      if(productIndex < 0){
        return false;
      }
      var products = getAllProducts();
      products[productIndex].quantity = typeof quantity === "undefined" ? products[productIndex].quantity * 1 + 1 : quantity;
      setAllProducts(products);
      return true;
    }
    var setProduct = function(id, name, summary, price, quantity, image) {
      if(typeof id === "undefined"){
        console.error("id required")
        return false;
      }
      if(typeof name === "undefined"){
        console.error("name required")
        return false;
      }
      if(typeof image === "undefined"){
        console.error("image required")
        return false;
      }
      if(!$.isNumeric(price)){
        console.error("preço não é um numero")
        return false;
      }
      if(!$.isNumeric(quantity)) {
        console.error("quantia não é um numero");
        return false;
      }
      summary = typeof summary === "undefined" ? "" : summary;

      if(!updatePoduct(id)){
        addProduct(id, name, summary, price, quantity, image);
      }
    }
    var clearProduct = function(){
      setAllProducts([]);
    }
    var removeProduct = function(id){
      var products = getAllProducts();
      products = R$.grep(products, function(value, index) {
        return value.id != id;
      });
      setAllProducts(products);
    }
    var getTotalQuantityOfProduct = function(){
      var total = 0;
      var products = getAllProducts();
      R$.each(products, function(index, value){
        total += value.quantity * 1;
      });
      return total;
    }

    objToReturn.getAllProducts = getAllProducts;
    objToReturn.updatePoduct = updatePoduct;
    objToReturn.setProduct = setProduct;
    objToReturn.clearProduct = clearProduct;
    objToReturn.removeProduct = removeProduct;
    objToReturn.getTotalQuantityOfProduct = getTotalQuantityOfProduct;
    return objToReturn;
  }());


  var loadMyCartEvent = function(userOptions){

    var options = OptionManager.getOptions(userOptions);
    var $cartIcon = R$("." + options.classCartIcon);
    var R$cartBadge = R$("." + options.classCartBadge);

    var idCartModal = 'my-cart-modal';
    var idCartTable = 'my-cart-table';
    var classProductQuantity = 'my-product-quantity';
    var classProductTotal = 'my-product-total';
    var idGrandTotal = 'my-cart-grand-total';
    var idCheckoutCart = 'checkout-my-cart';
    var classProductRemove = 'my-product-remove';
    var idEmptyCartMessage = 'my-cart-empty-message';
    var classAffixMyCartIcon = 'my-cart-icon-affix';
    var idDiscountPrice = 'my-cart-discount-price';

    R$cartBadge.text(ProductManager.getTotalQuantityOfProduct());

    if(!$("#" + idCartModal).length) {
      R$('body').append(
        '<div class="modal fade" id="' + idCartModal + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="Fechar" data-dismiss="modal" aria-label="Fechar"><span aria-hidden="true">&times;</span></button>' +
        '<h5 class="modal-title" id="myModalLabel"> &nbsp; Meu Carrinho</h5>' +
        '</div>' +
        '<div class="modal-body">' +
        '<table class="table table-hover table-responsive" id="' + idCartTable + '"></table>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>' +
        '<button type="button" class="btn btn-primary" id="' + idCheckoutCart + '">Checkout</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    }

    var drawTable = function(){
      var R$cartTable = R$("#" + idCartTable);
      R$cartTable.empty();

      var products = ProductManager.getAllProducts();
      R$.each(products, function(){
        var total = this.quantity * this.price;
        R$cartTable.append(
          '<tr title="' + this.summary + '" data-id="' + this.id + '" data-price="' + this.price + '">' +
          '<td class="text-center"><img style="width:60px" src="' + this.image + '"/></td>' +
          '<td>' + this.name + '</td>' +
          '<td title="Unit Price">R$' + this.price + '</td>' +
          '<td title="Quantidade"><input type="number" min="1" style="width: 70px;" class="' + classProductQuantity + '" value="' + this.quantity + '"/></td>' +
          '<td title="Total" class="' + classProductTotal + '">R$' + total + '</td>' +
          '<td title="Remova do Carrinho" class="text-center" style="width: 30px;"><a href="javascript:void(0);" class="btn btn-xs btn-danger ' + classProductRemove + '">X</a></td>' +
          '</tr>'
        );
      });

      R$cartTable.append(products.length ?
        '<tr>' +
        '<td></td>' +
        '<td><strong>Total</strong></td>' +
        '<td></td>' +
        '<td></td>' +
        '<td><strong id="' + idGrandTotal + '">R$</strong></td>' +
        '<td></td>' +
        '</tr>'
        : '<div class="alert alert-danger" role="alert" id="' + idEmptyCartMessage + '">Seu carrinho esta vazio</div>'
      );

      var discountPrice = options.getDiscountPrice(products);
      if(discountPrice !== null) {
        R$cartTable.append(
          '<tr style="color: red">' +
          '<td></td>' +
          '<td><strong>Total (Incluindo o desconto)</strong></td>' +
          '<td></td>' +
          '<td></td>' +
          '<td><strong id="' + idDiscountPrice + '">R$</strong></td>' +
          '<td></td>' +
          '</tr>'
        );
      }

      showGrandTotal(products);
      showDiscountPrice(products);
    }
    var showModal = function(){
      drawTable();
      $("#" + idCartModal).modal('show');
    }
    var updateCart = function(){
      R$.each($("." + classProductQuantity), function(){
        var id = R$(this).closest("tr").data("id");
        ProductManager.updatePoduct(id, R$(this).val());
      });
    }
    var showGrandTotal = function(products){
      var total = 0;
      R$.each(products, function(){
        total += this.quantity * this.price;
      });
      R$("#" + idGrandTotal).text("R$" + total);
    }
    var showDiscountPrice = function(products){
      R$("#" + idDiscountPrice).text("R$" + options.getDiscountPrice(products));
    }

    /*
    EVENT
    */
    if(options.affixCartIcon) {
      var cartIconBottom = $cartIcon.offset().top * 1 + $cartIcon.css("height").match(/\d+/) * 1;
      var cartIconPosition = $cartIcon.css('position');
      R$(window).scroll(function () {
        if ($(window).scrollTop() >= cartIconBottom) {
          $cartIcon.css('position', 'fixed').css('z-index', '999').addClass(classAffixMyCartIcon);
        } else {
          $cartIcon.css('position', cartIconPosition).css('background', 'inherit').removeClass(classAffixMyCartIcon);
        }
      });
    }

    $cartIcon.click(showModal);

    R$(document).on("input", "." + classProductQuantity, function () {
      var price = R$(this).closest("tr").data("price");
      var id = R$(this).closest("tr").data("id");
      var quantity = R$(this).val();

      R$(this).parent("td").next("." + classProductTotal).text("R$" + price * quantity);
      ProductManager.updatePoduct(id, quantity);

      $cartBadge.text(ProductManager.getTotalQuantityOfProduct());
      var products = ProductManager.getAllProducts();
      showGrandTotal(products);
      showDiscountPrice(products);
    });

    R$(document).on('click', "." + classProductRemove, function(){
      var R$tr = $(this).closest("tr");
      var id = R$tr.data("id");
      R$tr.hide(500, function(){
        ProductManager.removeProduct(id);
        drawTable();
        R$cartBadge.text(ProductManager.getTotalQuantityOfProduct());
      });
    });

    R$("#" + idCheckoutCart).click(function(){
      var products = ProductManager.getAllProducts();
      if(!products.length) {
        R$("#" + idEmptyCartMessage).fadeTo('fast', 0.5).fadeTo('fast', 1.0);
        return ;
      }
      updateCart();
      options.checkoutCart(ProductManager.getAllProducts());
      ProductManager.clearProduct();
      R$cartBadge.text(ProductManager.getTotalQuantityOfProduct());
      $("#" + idCartModal).modal("hide");
    });

    R$(document).on('keypress', "." + classProductQuantity, function(evt){
      if(evt.keyCode == 38 || evt.keyCode == 40){
        return ;
      }
      evt.preventDefault();
    });
  }


  var MyCart = function (target, userOptions) {
    /*
    PRIVATE
    */
    var R$target = $(target);
    var options = OptionManager.getOptions(userOptions);
    var $cartIcon = $("." + options.classCartIcon);
    var R$cartBadge = $("." + options.classCartBadge);

    /*
    EVENT
    */
    R$target.click(function(){
      options.clickOnAddToCart(R$target);

      var id = R$target.data('id');
      var name = R$target.data('name');
      var summary = R$target.data('summary');
      var price = R$target.data('price');
      var quantity = R$target.data('quantity');
      var image = R$target.data('image');

      ProductManager.setProduct(id, name, summary, price, quantity, image);
      R$cartBadge.text(ProductManager.getTotalQuantityOfProduct());
    });

  }


  R$.fn.myCart = function (userOptions) {
    loadMyCartEvent(userOptions);
    return $.each(this, function () {
      new MyCart(this, userOptions);
    });
  }


})(jQuery);
